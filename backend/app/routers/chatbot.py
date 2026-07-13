"""
FULLY RAG-POWERED CHATBOT for SHOP.CO
=======================================
- Google Gemini (new genai SDK) for embeddings + generation
- Qdrant Cloud for vector similarity search
- OpenRouter as fallback LLM
- SQL keyword search as second fallback
"""

import asyncio
import logging
import os
import re
from typing import List, Optional

import httpx
from fastapi import APIRouter, Depends
from google import genai as google_genai
from google.genai import types as genai_types
from pydantic import BaseModel
from qdrant_client import QdrantClient
from qdrant_client.http import models as qdrant_models
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Product

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("chatbot")

router = APIRouter()

# ──────────────────────────────────────────
# CONSTANTS
# ──────────────────────────────────────────

COLLECTION_NAME = "shopco_products"
# Updated model names for the new google.genai SDK
EMBEDDING_MODEL = "models/gemini-embedding-001"
EMBEDDING_SIZE = 3072  # models/gemini-embedding-001 produces 3072-dim vectors
GEMINI_MODEL = "gemini-2.0-flash"
TOP_K_RESULTS = 6
SIMILARITY_THRESHOLD = 0.25

# ──────────────────────────────────────────
# GLOBAL STATE
# ──────────────────────────────────────────

genai_client: Optional[google_genai.Client] = None
qdrant_client: Optional[QdrantClient] = None
gemini_available = False
index_ready = False


# ====================================================================
#  RAG ENGINE: Qdrant Cloud + Gemini Embeddings (new genai SDK)
# ====================================================================

def get_embedding(text: str) -> List[float]:
    """Generate embedding via the new Gemini genai SDK."""
    if not genai_client:
        raise RuntimeError("Gemini client not initialized")
    result = genai_client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
    )
    return result.embeddings[0].values


def enhance_query(query: str) -> str:
    """
    Rewrite a natural-language shopping query into a rich product-search query
    so the embedding captures all key dimensions (category, style, color, size, price).
    """
    query_lower = query.lower().strip()

    replacements = {
        r"\bt[- ]?shirt\b": "t-shirt shirt",
        r"\bhoodie\b": "hoodie sweatshirt",
        r"\bjeans?\b": "jeans denim pants",
        r"\bshoe[s]?\b": "shoes sneakers footwear",
        r"\bsneaker[s]?\b": "sneakers shoes",
        r"\bdress\b": "dress clothing",
        r"\bjacket\b": "jacket coat outerwear",
        r"\bshort[s]?\b": "shorts bermuda",
        r"\bpolo\b": "polo shirt",
    }
    for pattern, replacement in replacements.items():
        query_lower = re.sub(pattern, replacement, query_lower)

    return query_lower


def init_rag_engine():
    """Initialize cloud Qdrant and Gemini (new genai SDK)."""
    global genai_client, qdrant_client, gemini_available, index_ready

    # ── 1. Setup Gemini (new SDK) ──
    if settings.GEMINI_API_KEY:
        try:
            genai_client = google_genai.Client(api_key=settings.GEMINI_API_KEY)
            gemini_available = True
            logger.info("Gemini configured successfully!")
        except Exception as e:
            logger.error(f"Gemini config failed: {e}")
    else:
        logger.warning("No GEMINI_API_KEY in .env")

    # ── 2. Setup Qdrant Cloud ──
    if settings.QDRANT_URL and settings.QDRANT_API_KEY:
        try:
            qdrant_client = QdrantClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY,
                timeout=120,
            )
            collections = qdrant_client.get_collections().collections
            existing = any(c.name == COLLECTION_NAME for c in collections)
            if existing:
                count = qdrant_client.count(COLLECTION_NAME).count
                if count > 0:
                    index_ready = True
                    logger.info(f"Qdrant Cloud connected: {count} indexed products")
                    return

            logger.info("Creating product embeddings index on Qdrant Cloud...")
            try:
                qdrant_client.delete_collection(COLLECTION_NAME)
            except Exception:
                pass

            qdrant_client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=qdrant_models.VectorParams(
                    size=EMBEDDING_SIZE,
                    distance=qdrant_models.Distance.COSINE,
                ),
            )
            logger.info("Qdrant Cloud collection created!")
        except Exception as e:
            logger.error(f"Qdrant Cloud init failed: {e}")
            qdrant_client = None
    else:
        logger.warning("No QDRANT_URL / QDRANT_API_KEY in .env")


def index_products(db: Session):
    """Index all products into Qdrant Cloud with embeddings."""
    global index_ready
    if not qdrant_client or not genai_client:
        logger.warning("Cannot index: Qdrant or Gemini not available")
        return

    try:
        count = qdrant_client.count(COLLECTION_NAME).count
        if count > 0:
            index_ready = True
            logger.info(f"Products already indexed ({count} vectors)")
            return
    except Exception:
        pass

    products = db.query(Product).all()
    if not products:
        logger.warning("No products to index")
        return

    points = []
    for p in products:
        try:
            product_text = (
                f"Product: {p.title}\n"
                f"Category: {(p.category or '').replace('_', ' ').title()}\n"
                f"Description: {p.description or ''}\n"
                f"Price: ${p.price}\n"
                f"Sizes: {', '.join(p.get_sizes())}\n"
                f"Colors: {', '.join(p.get_colors()) if p.get_colors() else 'Various'}\n"
                f"Rating: {p.rating or 4.5}/5\n"
                f"Stock: {(p.stock or 10)}"
            )

            embedding = get_embedding(product_text)

            points.append(qdrant_models.PointStruct(
                id=p.id,
                vector=embedding,
                payload={
                    "product_id": p.id,
                    "title": p.title,
                    "slug": p.slug,
                    "category": p.category or "",
                    "price": p.price,
                    "old_price": p.old_price or 0,
                    "description": p.description or "",
                    "img_url": p.img_url,
                    "sizes": p.get_sizes(),
                    "colors": p.get_colors(),
                    "rating": p.rating or 4.5,
                    "stock": p.stock or 10,
                }
            ))
            logger.info(f"  Indexed: {p.title}")
        except Exception as e:
            logger.error(f"  Failed to index {p.title}: {e}")

    if points:
        # Upload in batches of 5 with individual retry
        for i in range(0, len(points), 5):
            batch = points[i:i + 5]
            try:
                qdrant_client.upsert(
                    collection_name=COLLECTION_NAME,
                    points=batch,
                    wait=True,
                )
                logger.info(f"  Uploaded batch {i//5 + 1}/{(len(points)-1)//5 + 1}")
            except Exception as batch_err:
                logger.error(f"  Batch {i//5 + 1} failed, trying one-by-one: {batch_err}")
                # Fallback: upload individually
                for point in batch:
                    try:
                        qdrant_client.upsert(
                            collection_name=COLLECTION_NAME,
                            points=[point],
                            wait=True,
                        )
                    except Exception as single_err:
                        logger.error(f"  Failed to upload product {point.id}: {single_err}")

        # Verify index
        try:
            final_count = qdrant_client.count(COLLECTION_NAME).count
            if final_count > 0:
                index_ready = True
                logger.info(f"Indexed {final_count} products into Qdrant Cloud!")
            else:
                logger.warning("No products were indexed!")
        except Exception:
            pass


def search_products_rag(query: str, top_k: int = TOP_K_RESULTS) -> List[dict]:
    """Semantic search: query -> embedding -> Qdrant vector search (new query_points API)."""
    if not qdrant_client or not genai_client or not index_ready:
        logger.warning("RAG search not available")
        return []

    try:
        enhanced = enhance_query(query)
        query_embedding = get_embedding(enhanced)

        # Use the new query_points API (deprecated .search() removed in recent qdrant-client)
        results = qdrant_client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_embedding,
            limit=top_k,
            score_threshold=SIMILARITY_THRESHOLD,
            with_payload=True,
            with_vectors=False,
        )

        if not results or not results.points:
            logger.info(f"  No Qdrant results for: {query[:50]}")
            return []

        # Filter by score threshold
        hits = [
            point.payload for point in results.points
            if point.payload and point.score >= SIMILARITY_THRESHOLD
        ]
        logger.info(f"  Qdrant found {len(hits)} results for: {query[:50]}")
        return hits

    except Exception as e:
        logger.error(f"RAG search error: {e}")
        return []


def build_rag_context(products: List[dict]) -> str:
    """Build a detailed product context string for the LLM."""
    if not products:
        return ""

    lines = ["Available Products:\n"]
    for i, p in enumerate(products, 1):
        sizes = ", ".join(p.get("sizes", []))
        colors_count = len(p.get("colors", []))
        price = p.get("price", 0)
        old_price = p.get("old_price", 0)
        rating = p.get("rating", 4.5)
        stock = p.get("stock", 10)
        description = (p.get("description") or "")[:120]

        price_str = f"${price}"
        if old_price and old_price > price:
            discount = int(((old_price - price) / old_price) * 100)
            price_str += f" (was ${old_price}, -{discount}%)"

        lines.append(
            f"{i}. {p['title']} - {price_str} | Rating: {rating}/5\n"
           f"   {description}\n"
           f"   Sizes: {sizes} | Colors: {colors_count} variants | Stock: {stock}\n"
        )

    return "\n".join(lines)


# ====================================================================
#  FALLBACK: SQL Keyword Search
# ====================================================================

def db_search_fallback(query: str, db: Session) -> List[Product]:
    """Traditional SQL keyword search as fallback."""
    q = query.lower().strip()
    q = re.sub(
        r'\b(the|a|an|is|are|was|were|do|does|did|have|has|had|show|me|tell|about|for|in|of|to|'
        r'how|much|what|which|where|when|can|i|you|we|they|he|she|it|that|this|with|and|or|but|'
        r'not|please|need|want|looking|find|got|any|some|all|price|cost|size|color|available|'
        r'stock|hello|hi|hey|thanks|thank|please|help|would|could|should|does|like|has)\b',
        '', q
    ).strip()

    if not q or len(q) < 2:
        return []

    # Generate search variations (handle singular/plural)
    search_terms = [q]
    if q.endswith('s') and len(q) > 3:
        search_terms.append(q[:-1])  # remove trailing 's'
    if not q.endswith('s'):
        search_terms.append(q + 's')  # add 's'

    # Search titles with variations
    for term in search_terms:
        products = db.query(Product).filter(Product.title.ilike(f"%{term}%")).all()
        if products:
            return products

    # Search descriptions with variations
    for term in search_terms:
        products = db.query(Product).filter(Product.description.ilike(f"%{term}%")).all()
        if products:
            return products

    # Word-by-word search
    for word in q.split():
        if len(word) > 2:
            products = db.query(Product).filter(
                Product.title.ilike(f"%{word}%")
            ).all()
            if products:
                return products

    return []


# ====================================================================
#  FALLBACK LLM: OpenRouter
# ====================================================================

async def query_openrouter(system_prompt: str, user_message: str) -> Optional[str]:
    """Send a chat completion request to OpenRouter as primary LLM."""
    if not settings.OPENROUTER_API_KEY:
        return None

    models_to_try = [
        "google/gemini-2.0-flash-001",  # Fast & cheap
        "openai/gpt-4o-mini",            # Widely available
        "meta-llama/llama-3.3-70b-instruct", # Open source fallback
    ]

    for model in models_to_try:
        try:
            async with httpx.AsyncClient(timeout=45) as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://shopco.com",
                    },
                    json={
                        "model": model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_message},
                        ],
                        "temperature": 0.7,
                        "max_tokens": 500,
                    },
                )
                if response.status_code != 200:
                    error_body = response.text[:200]
                    logger.warning(f"OpenRouter {model} returned {response.status_code}: {error_body}")
                    continue

                result = response.json()
                if "choices" in result and len(result["choices"]) > 0:
                    content = result["choices"][0].get("message", {}).get("content", "").strip()
                    if content:
                        return content
                    logger.warning(f"OpenRouter {model} returned empty content")
                else:
                    logger.warning(f"OpenRouter {model} returned no choices: {result.get('error', 'unknown')}")
        except Exception as e:
            logger.warning(f"OpenRouter {model} error: {e}")
            continue

    return None


# ====================================================================
#  INTENT DETECTION (Rule-based for fast common replies)
# ====================================================================

_INTENT_PATTERNS = {
    "greeting": r'^(hi|hello|hey|salam|assalam|good\s*(morning|evening|afternoon|day)|yo|wasup|whats up|hlo|howdy|greetings)\b',
    "help": r'^(help|\?|commands|what can you do|how (do|can) you (help|work))',
    "thanks": r'(thanks|thank you|thx|ty|appreciate it|goodbye|bye|see you|have a great)',
    "order_tracking": r'(order|track|shipping|delivery|where is my|order status|track order|order id)',
    "contact": r'(contact|support|email|phone|customer service|help desk|call|live chat)',
    "discount": r'(discount|promo|coupon|sale|offer|deal|promotion|special offer|save|off|cheap)',
}


def detect_intent(message: str) -> Optional[str]:
    msg_lower = message.lower().strip()
    for intent, pattern in _INTENT_PATTERNS.items():
        if re.match(pattern, msg_lower):
            return intent
    return None


_INTENT_RESPONSES = {
    "greeting": (
        "Welcome to SHOP.CO! \n\n"
        "I'm your AI shopping assistant. I can help you find the perfect outfit!\n\n"
        "Try asking me:\n"
        "- \"Show me t-shirts\"\n"
        "- \"What's under $150?\"\n"
        "- \"Do you have skinny jeans?\"\n"
        "- \"What's new this week?\"\n"
        "- \"Recommend something casual\"\n\n"
        "What are you looking for today?"
    ),
    "help": (
        "I can help you with:\n\n"
        "- Find products -- \"Show me shirts under $100\"\n"
        "- Price check -- \"How much is the polo shirt?\"\n"
        "- Sizes & Colors -- \"Do you have medium in skinny jeans?\"\n"
        "- New arrivals -- \"What's new this week?\"\n"
        "- Best sellers -- \"What's trending?\"\n"
        "- Offers -- \"Any discounts or promo codes?\"\n"
        "- Orders -- \"Track my order\"\n\n"
        "Just chat naturally and I'll handle the rest!"
    ),
    "thanks": (
        "You're welcome! Happy shopping at SHOP.CO! \n\n"
        "Come back anytime if you need help finding something perfect!"
    ),
    "order_tracking": (
        "Track Your Order\n\n"
        "Go to our Order Tracking page and enter your Order ID to see live status.\n"
        "Need your order ID? Check your email confirmation or Profile > Order History.\n\n"
        "Can I help you with anything else?"
    ),
    "contact": (
        "We're Here to Help!\n\n"
        "Email: support@shop.co\n"
        "Live Chat: Available 24/7 right here!\n"
        "Visit us at our store for personal assistance\n\n"
        "How can I assist you today?"
    ),
    "discount": (
        "Current Offers & Promotions!\n\n"
        "- Use code DISCOUNT10 -> Get $30 OFF your order\n"
        "- New customers -> 20% OFF your first order\n"
        "- Free delivery on all orders over $100\n\n"
        "Start shopping and save big!\n\n"
        "Want me to show you products under a certain budget?"
    ),
}


# ====================================================================
#  LLM GENERATION (Gemini new genai SDK + OpenRouter fallback)
# ====================================================================

_SYSTEM_PROMPT_BASE = (
    "You are a friendly, enthusiastic shopping assistant for SHOP.CO, a premium clothing store. "
    "Your goal is to help customers find the perfect products.\n\n"
    "## RESPONSE STYLE\n"
    "- Keep replies concise (2-5 sentences), natural, and helpful\n"
    "- Use emojis occasionally for warmth\n"
    "- Be conversational -- like a real shop assistant in a boutique\n"
    "- If you recommend products, explain why they're a good fit\n\n"
    "## PRODUCT RULES\n"
    "- ONLY recommend products listed in the 'RELEVANT PRODUCTS' section below\n"
    "- If no products match, say so honestly and ask what else they're looking for\n"
    "- Include price, sizes, and rating when recommending\n"
    "- If they ask about something not in inventory, suggest alternatives you do have\n\n"
    "## ANSWERING QUESTIONS\n"
    "- For price questions: state the price and any discounts\n"
    "- For size questions: list available sizes from the product data\n"
    "- For comparison questions: highlight the key differences\n"
    "- For recommendations: pick 1-2 best matches and explain why\n"
)


async def generate_with_gemini(system_prompt: str, user_msg: str) -> Optional[str]:
    """Generate response using new Gemini genai SDK."""
    if not genai_client or not gemini_available:
        return None
    try:
        full_prompt = f"{system_prompt}\n\nCustomer: {user_msg}\nAssistant:"
        response = await asyncio.to_thread(
            genai_client.models.generate_content,
            model=GEMINI_MODEL,
            contents=full_prompt,
            config=genai_types.GenerateContentConfig(
                temperature=0.7,
                max_output_tokens=600,
            ),
        )
        if response and response.text:
            reply = response.text.strip()
            reply = re.sub(r'^(Assistant:?\s*)', '', reply).strip()
            return reply
    except Exception as e:
        logger.error(f"Gemini generation error: {e}")
    return None


async def generate_response(user_msg: str, context: str) -> str:
    """
    Generate a response using the best available LLM:
    1. Try OpenRouter first (has available quota)
    2. Fallback to Gemini
    3. Graceful message if both fail
    """
    system_prompt = _SYSTEM_PROMPT_BASE
    if context:
        system_prompt += f"\n\n## RELEVANT PRODUCTS\n{context}"
    else:
        system_prompt += (
            "\n\n## RELEVANT PRODUCTS\nNo specific products matched the query. "
            "Suggest the customer browse categories or ask what they're looking for."
        )

    # Try OpenRouter first (has available quota)
    reply = await query_openrouter(system_prompt, user_msg)
    if reply:
        return reply

    # Fallback to Gemini
    logger.info("OpenRouter failed, trying Gemini fallback...")
    reply = await generate_with_gemini(system_prompt, user_msg)
    if reply:
        return reply

    return (
        "I'm having a temporary connection issue with my AI engine. "
        "Please try again in a moment, or browse our products directly!"
    )


# ====================================================================
#  RAG PIPELINE (Main flow)
# ====================================================================

async def rag_pipeline(user_msg: str, db: Session) -> str:
    """
    Full RAG pipeline:
    1. Search Qdrant for semantically similar products
    2. If found, build context and generate with LLM
    3. If no vector results, try SQL text search
    4. Last resort: suggest browsing
    """
    # Step 1: Vector Search (RAG)
    candidates = await asyncio.to_thread(search_products_rag, user_msg)

    if candidates:
        context = build_rag_context(candidates)
        reply = await generate_response(user_msg, context)
        return reply

    # Step 2: SQL Fallback
    logger.info("No RAG results, trying SQL fallback...")
    db_products = await asyncio.to_thread(db_search_fallback, user_msg, db)

    if db_products:
        lines = ["Found via search:\n"]
        for p in db_products[:5]:
            sizes = ", ".join(p.get_sizes())
            lines.append(
                f"- {p.title} -- ${p.price} | Sizes: {sizes} | Rating: {p.rating or 4.5}/5\n"
                f"  {p.description or ''}\n"
            )
        simple_context = "\n".join(lines)
        reply = await generate_response(user_msg, simple_context)
        return reply

    # Step 3: Show some products as last resort
    all_products = await asyncio.to_thread(
        lambda: db.query(Product).limit(6).all()
    )
    lines = [
        "I couldn't find exactly what you described, but here's what we have:\n"
    ]
    for p in all_products:
        lines.append(f"- {p.title} -- ${p.price} | Rating: {p.rating or 4.5}/5\n")
    lines.append(
        "\nTell me which one catches your eye, or describe what you're looking for differently!"
    )
    return "".join(lines)


# ====================================================================
#  API SCHEMAS
# ====================================================================

class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


# ====================================================================
#  API ENDPOINTS
# ====================================================================

@router.get("/status")
def chatbot_status():
    """Check the status of all RAG components."""
    return {
        "gemini_available": gemini_available,
        "qdrant_connected": qdrant_client is not None,
        "index_ready": index_ready,
        "api_key_configured": bool(settings.GEMINI_API_KEY),
        "qdrant_url_configured": bool(settings.QDRANT_URL),
        "openrouter_configured": bool(settings.OPENROUTER_API_KEY),
    }


@router.post("/reindex")
def reindex(db: Session = Depends(get_db)):
    """Force re-index all products into Qdrant Cloud."""
    global index_ready
    index_ready = False
    if qdrant_client:
        try:
            qdrant_client.delete_collection(COLLECTION_NAME)
        except Exception:
            pass
        try:
            qdrant_client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=qdrant_models.VectorParams(
                    size=EMBEDDING_SIZE,
                    distance=qdrant_models.Distance.COSINE,
                ),
            )
        except Exception as e:
            logger.error(f"Re-create collection error: {e}")

    init_rag_engine()
    index_products(db)
    return {"message": "Re-indexed successfully", "index_ready": index_ready}


@router.post("", response_model=ChatResponse)
async def chatbot_chat(req: ChatRequest, db: Session = Depends(get_db)):
    """
    Main chat endpoint.
    1. Quick intent detection for common queries (instant reply)
    2. Full RAG pipeline for everything else
    """
    msg = req.message.strip()
    if not msg:
        return ChatResponse(reply="Please say something!")

    # Quick Intent Detection
    intent = detect_intent(msg)
    if intent and intent in _INTENT_RESPONSES:
        if intent in ("greeting", "help"):
            # Enrich greeting with a trending product suggestion
            candidates = await asyncio.to_thread(
                search_products_rag, "trending products clothing"
            )
            if candidates:
                top = candidates[0]
                extra = (
                    f"\n\nHot pick: {top['title']} -- just ${top['price']}! "
                    f"Want to know more?"
                )
                return ChatResponse(reply=_INTENT_RESPONSES[intent] + extra)
        return ChatResponse(reply=_INTENT_RESPONSES[intent])

    # Full RAG Pipeline
    reply = await rag_pipeline(msg, db)
    return ChatResponse(reply=reply)
