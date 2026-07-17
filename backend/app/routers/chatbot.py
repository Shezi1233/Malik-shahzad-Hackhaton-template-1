"""
FULLY RAG-POWERED CHATBOT for SHOP.CO
=======================================
- Google Gemini (new genai SDK) for embeddings + generation
- Qdrant Cloud for vector similarity search
- OpenRouter as fallback LLM
- SQL keyword search as second fallback
- PURCHASE INTENT: automatically add products to user's cart

NOTE: All third-party imports (google.genai, qdrant_client, httpx) are lazy
so the module loads even if optional dependencies are missing.
"""

import asyncio
import logging
import os
import re
from typing import Any, List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import CartItem, Product, User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("chatbot")

router = APIRouter()

# ──────────────────────────────────────────
# CONSTANTS
# ──────────────────────────────────────────

COLLECTION_NAME = "shopco_products"
EMBEDDING_MODEL = "models/gemini-embedding-001"
EMBEDDING_SIZE = 3072
GEMINI_MODEL = "gemini-2.0-flash"
TOP_K_RESULTS = 6
SIMILARITY_THRESHOLD = 0.25

# ──────────────────────────────────────────
# GLOBAL STATE
# ──────────────────────────────────────────

genai_client: Optional[Any] = None
qdrant_client: Optional[Any] = None
gemini_available = False
index_ready = False


# ====================================================================
#  RAG ENGINE: Qdrant Cloud + Gemini Embeddings (new genai SDK)
# ====================================================================


def _import_genai():
    try:
        import google.genai as _genai
        return _genai
    except ImportError:
        return None


def _import_genai_types():
    try:
        from google.genai import types as _types
        return _types
    except ImportError:
        return None


def _import_qdrant_client():
    try:
        from qdrant_client import QdrantClient as _QdrantClient
        return _QdrantClient
    except ImportError:
        return None


def _import_qdrant_models():
    try:
        from qdrant_client.http import models as _models
        return _models
    except ImportError:
        return None


def get_embedding(text: str) -> List[float]:
    if not genai_client:
        raise RuntimeError("Gemini client not initialized")
    result = genai_client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
    )
    return result.embeddings[0].values


def enhance_query(query: str) -> str:
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
    global genai_client, qdrant_client, gemini_available, index_ready

    if settings.GEMINI_API_KEY:
        try:
            _genai = _import_genai()
            if _genai is None:
                logger.warning("google-genai package not installed")
            else:
                genai_client = _genai.Client(api_key=settings.GEMINI_API_KEY)
                gemini_available = True
                logger.info("Gemini configured successfully!")
        except Exception as e:
            logger.error(f"Gemini config failed: {e}")
    else:
        logger.warning("No GEMINI_API_KEY in .env")

    if settings.QDRANT_URL and settings.QDRANT_API_KEY:
        try:
            _QdrantClient = _import_qdrant_client()
            if _QdrantClient is None:
                logger.warning("qdrant-client package not installed")
            else:
                qdrant_client = _QdrantClient(
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

                _qdrant_models = _import_qdrant_models()
                if _qdrant_models:
                    qdrant_client.create_collection(
                        collection_name=COLLECTION_NAME,
                        vectors_config=_qdrant_models.VectorParams(
                            size=EMBEDDING_SIZE,
                            distance=_qdrant_models.Distance.COSINE,
                        ),
                    )
                    logger.info("Qdrant Cloud collection created!")
        except Exception as e:
            logger.error(f"Qdrant Cloud init failed: {e}")
            qdrant_client = None
    else:
        logger.warning("No QDRANT_URL / QDRANT_API_KEY in .env")


def index_products(db: Session):
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

    _qdrant_models = _import_qdrant_models()
    if _qdrant_models is None:
        logger.warning("Cannot index: qdrant models not available")
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
            points.append(_qdrant_models.PointStruct(
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
                logger.error(f"  Batch {i//5 + 1} failed: {batch_err}")
                for point in batch:
                    try:
                        qdrant_client.upsert(
                            collection_name=COLLECTION_NAME,
                            points=[point],
                            wait=True,
                        )
                    except Exception:
                        pass

        try:
            final_count = qdrant_client.count(COLLECTION_NAME).count
            if final_count > 0:
                index_ready = True
                logger.info(f"Indexed {final_count} products into Qdrant Cloud!")
        except Exception:
            pass


def search_products_rag(query: str, top_k: int = TOP_K_RESULTS) -> List[dict]:
    if not qdrant_client or not genai_client or not index_ready:
        logger.warning("RAG search not available")
        return []

    try:
        enhanced = enhance_query(query)
        query_embedding = get_embedding(enhanced)
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
    q = query.lower().strip()
    q = re.sub(
        r'\b(the|a|an|is|are|was|were|do|does|did|have|has|had|show|me|tell|about|for|in|of|to|'
        r'how|much|what|which|where|when|can|i|you|we|they|he|she|it|that|this|with|and|or|but|'
        r'not|please|need|want|looking|find|got|any|some|all|price|cost|size|color|available|'
        r'stock|hello|hi|hey|thanks|thank|please|help|would|could|should|does|like|has|buy|add|'
        r'cart|purchase|order|get|take|put)\b',
        '', q
    ).strip()

    if not q or len(q) < 2:
        return []

    search_terms = [q]
    if q.endswith('s') and len(q) > 3:
        search_terms.append(q[:-1])
    if not q.endswith('s'):
        search_terms.append(q + 's')

    for term in search_terms:
        products = db.query(Product).filter(Product.title.ilike(f"%{term}%")).all()
        if products:
            return products

    for term in search_terms:
        products = db.query(Product).filter(Product.description.ilike(f"%{term}%")).all()
        if products:
            return products

    for word in q.split():
        if len(word) > 2:
            products = db.query(Product).filter(Product.title.ilike(f"%{word}%")).all()
            if products:
                return products

    return []


# ====================================================================
#  FALLBACK LLM: OpenRouter
# ====================================================================

async def query_openrouter(system_prompt: str, user_message: str) -> Optional[str]:
    if not settings.OPENROUTER_API_KEY:
        return None
    try:
        import httpx
    except ImportError:
        logger.warning("httpx not installed")
        return None

    models_to_try = [
        "google/gemini-2.0-flash-001",
        "openai/gpt-4o-mini",
        "meta-llama/llama-3.3-70b-instruct",
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
                        "max_tokens": 600,
                    },
                )
                if response.status_code != 200:
                    continue
                result = response.json()
                if "choices" in result and len(result["choices"]) > 0:
                    content = result["choices"][0].get("message", {}).get("content", "").strip()
                    if content:
                        return content
        except Exception as e:
            logger.warning(f"OpenRouter {model} error: {e}")
            continue
    return None


# ====================================================================
#  INTENT DETECTION
# ====================================================================

_INTENT_PATTERNS = {
    "greeting": r'^(hi|hello|hey|salam|assalam|good\s*(morning|evening|afternoon|day)|yo|wasup|whats up|hlo|howdy|greetings)\b',
    "help": r'^(help|\?|commands|what can you do|how (do|can) you (help|work))',
    "thanks": r'(thanks|thank you|thx|ty|appreciate it|goodbye|bye|see you|have a great)',
    "contact": r'(contact|support|email|phone|customer service|help desk|call|live chat)',
    "discount": r'(discount|promo|coupon|sale|offer|deal|promotion|special offer|save|off|cheap)',
}

# Purchase pattern — separate because it uses re.search (anywhere in message)
# and must be checked BEFORE order_tracking to avoid conflicts
_PURCHASE_PATTERN = (
    r'\b('
    r'buy|purchase|add\s+(to|in)?\s*cart|'
    r'i\'?ll\s+(take|get|buy|purchase|order)|'
    r'put\s+(it|this|that)\s+in\s+(the\s+)?cart|'
    r'checkout|place\s+(an?\s+)?order|'
    r'want\s+(to\s+)?(buy|purchase|order|get|add)|'
    r'can\s+(you|i)\s+(buy|purchase|order|get|add)|'
    r'could\s+(you|i)\s+(buy|purchase|order|get|add)|'
    r'i\s+(need|want|would\s+like)\s+(to\s+)?(buy|purchase|order|get|add|it|this|that)|'
    r'pay\s+(for\s+)?(it|this|that)|'
    r'grab\s+(it|this|that|the)|'
    r'add\s+it|'
    r'take\s+(it|this|that|the)'
    r')\b'
)

# ── Size normalization ──
_SIZE_MAP = {
    "xs": "XS", "extra small": "XS",
    "s": "S", "small": "S",
    "m": "M", "medium": "M",
    "l": "L", "large": "L",
    "xl": "XL", "extra large": "XL",
    "xxl": "XXL", "extra extra large": "XXL",
}

# ── Common colors ──
_COLOR_SET = {
    "black", "white", "red", "blue", "green", "navy", "gray", "grey",
    "brown", "pink", "purple", "yellow", "orange", "beige", "cream",
    "maroon", "teal", "olive", "coral", "mint", "lavender", "tan",
    "khaki", "indigo", "violet", "gold", "silver", "bronze", "burgundy",
    "charcoal", "chocolate", "crimson", "cyan", "emerald", "fuchsia",
    "ivory", "magenta", "mustard", "peach", "plum", "rose", "ruby",
    "salmon", "sapphire", "scarlet", "turquoise", "wine",
}


def detect_intent(message: str) -> Optional[str]:
    msg_lower = message.lower().strip()

    # ── Purchase check (uses re.search — matches anywhere in message) ──
    # Run this FIRST so "I want to order a shirt" is purchase, not order_tracking
    if re.search(_PURCHASE_PATTERN, msg_lower):
        return "purchase"

    # ── Other intents (use re.match — anchored to start of string) ──
    for intent, pattern in _INTENT_PATTERNS.items():
        if re.match(pattern, msg_lower):
            return intent
    return None


def extract_size(message: str) -> Optional[str]:
    """Extract clothing size from user message."""
    msg_lower = message.lower().strip()

    # Direct size mentions
    for size_variant, normalized in _SIZE_MAP.items():
        pattern = r'\b' + re.escape(size_variant) + r'\b'
        if re.search(pattern, msg_lower):
            return normalized

    # "size S" / "size M" etc
    size_match = re.search(r'\bsize\s+([a-z]{1,3})\b', msg_lower)
    if size_match:
        raw = size_match.group(1)
        if raw in _SIZE_MAP:
            return _SIZE_MAP[raw]

    return None


def extract_color(message: str) -> Optional[str]:
    """Extract color name from user message."""
    msg_lower = message.lower().strip()
    for color in _COLOR_SET:
        pattern = r'\b' + re.escape(color) + r'\b'
        if re.search(pattern, msg_lower):
            return color.capitalize()
    return None


# ====================================================================
#  AUTH: Extract user from token
# ====================================================================

def get_user_from_token(access_token: str, db: Session) -> Optional[User]:
    """Decode JWT token and return User or None."""
    try:
        from jose import JWTError, jwt
        payload = jwt.decode(
            access_token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id = payload.get("user_id")
        if not user_id:
            return None
        user = db.query(User).filter(User.id == user_id).first()
        return user
    except Exception as e:
        logger.warning(f"Token decode failed: {e}")
        return None


# ====================================================================
#  PURCHASE HANDLER
# ====================================================================

async def handle_purchase_intent(
    user_msg: str,
    user: User,
    db: Session,
) -> dict:
    """
    Fully automated purchase handler.
    1. Search for the product (RAG then SQL fallback)
    2. Extract size/color from message
    3. Add to cart
    4. Return action data
    """
    # Step 1: Find the product
    candidates = await asyncio.to_thread(search_products_rag, user_msg)
    found_product = None

    if candidates:
        found_product = candidates[0]
    else:
        db_products = await asyncio.to_thread(db_search_fallback, user_msg, db)
        if db_products:
            found_product = {
                "product_id": db_products[0].id,
                "title": db_products[0].title,
                "price": db_products[0].price,
                "img_url": db_products[0].img_url,
                "sizes": db_products[0].get_sizes(),
                "colors": db_products[0].get_colors(),
                "slug": db_products[0].slug,
            }

    if not found_product:
        return {
            "success": False,
            "error": "not_found",
            "product_title": None,
            "message": "I searched but couldn't find that product. Could you describe it differently?",
        }

    # Step 2: Extract size and color
    size = extract_size(user_msg)
    color = extract_color(user_msg)

    product_id = found_product["product_id"]
    product_title = found_product["title"]
    available_sizes = found_product.get("sizes", [])
    available_colors = found_product.get("colors", [])

    # Validate size
    if size and available_sizes and size not in available_sizes:
        size = available_sizes[0]  # fall back to first available

    # Validate color
    if color and available_colors:
        # Check if extracted color exists in available colors (case-insensitive)
        color_match = next(
            (c for c in available_colors if c.lower() == color.lower()),
            None
        )
        if color_match:
            color = color_match
        else:
            color = None  # color not available for this product

    # Step 3: Add to cart
    try:
        # Check if item already exists
        existing = (
            db.query(CartItem)
            .filter(
                CartItem.user_id == user.id,
                CartItem.product_id == product_id,
                CartItem.size == size,
                CartItem.color == color,
            )
            .first()
        )

        if existing:
            existing.quantity += 1
        else:
            cart_item = CartItem(
                user_id=user.id,
                product_id=product_id,
                quantity=1,
                size=size,
                color=color,
            )
            db.add(cart_item)

        db.commit()

        size_str = f" (Size: {size})" if size else ""
        color_str = f" ({color})" if color else ""
        details = f"{product_title}{size_str}{color_str}"

        return {
            "success": True,
            "error": None,
            "product_title": product_title,
            "product_id": product_id,
            "size": size,
            "color": color,
            "message": f"✅ Added **{details}** to your cart!",
            "cart_url": "/cart",
            "product_url": f"/products/{product_id}",
        }
    except Exception as e:
        logger.error(f"Cart add error: {e}")
        db.rollback()
        return {
            "success": False,
            "error": "db_error",
            "product_title": product_title,
            "message": "Sorry, I couldn't add the item to your cart due to a technical issue. Please try again.",
        }


_INTENT_RESPONSES = {
    "greeting": (
        "Welcome to SHOP.CO! \n\n"
        "I'm your AI shopping assistant. I can help you find the perfect outfit!\n\n"
        "Try asking me:\n"
        "- \"Show me t-shirts\"\n"
        "- \"What's under $150?\"\n"
        "- \"Do you have skinny jeans?\"\n"
        "- \"What's new this week?\"\n"
        "- \"Add the black t-shirt to my cart\"\n\n"
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
        "- **Buy** -- \"Add the black hoodie to my cart\" or \"I'll take the jeans\"\n\n"
        "Just chat naturally and I'll handle the rest!"
    ),
    "thanks": (
        "You're welcome! Happy shopping at SHOP.CO! \n\n"
        "Come back anytime if you need help finding or buying something!"
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
        "- Use code **DISCOUNT10** -> **$30 OFF** your order\n"
        "- Free delivery on all orders over $100\n\n"
        "Want me to show you products under a certain budget?"
    ),
}


# ====================================================================
#  PURCHASE SYSTEM PROMPT EXTENSION
# ====================================================================

_PURCHASE_SYSTEM_INSTRUCTION = (
    "\n\n## PURCHASE CAPABILITY\n"
    "- When a customer says 'buy', 'add to cart', 'I'll take it', 'purchase', or similar — "
    "you can automatically add the product to their cart.\n"
    "- If they mention a product without a size, ask \"Which size would you like?\"\n"
    "- If they mention a product without a color preference, that's fine — just proceed.\n"
    "- **You do NOT need to ask for confirmation** — the system handles it automatically.\n"
    "- After adding, confirm: \"I've added [product] to your cart!\"\n"
    "- If the user just says 'yes' or 'buy it' after a recommendation, the system will add the recommended product.\n"
)

_SYSTEM_PROMPT_BASE = (
    "You are a friendly, enthusiastic shopping assistant for SHOP.CO, a premium clothing store. "
    "Your goal is to help customers find and buy the perfect products.\n\n"
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


# ====================================================================
#  LLM GENERATION
# ====================================================================

async def generate_with_gemini(system_prompt: str, user_msg: str) -> Optional[str]:
    if not genai_client or not gemini_available:
        return None

    _genai_types = _import_genai_types()
    if _genai_types is None:
        logger.warning("google.genai.types not available")
        return None

    try:
        full_prompt = f"{system_prompt}\n\nCustomer: {user_msg}\nAssistant:"
        response = await asyncio.to_thread(
            genai_client.models.generate_content,
            model=GEMINI_MODEL,
            contents=full_prompt,
            config=_genai_types.GenerateContentConfig(
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


async def generate_response(user_msg: str, context: str, is_purchase: bool = False) -> str:
    system_prompt = _SYSTEM_PROMPT_BASE

    if is_purchase:
        system_prompt += _PURCHASE_SYSTEM_INSTRUCTION

    if context:
        system_prompt += f"\n\n## RELEVANT PRODUCTS\n{context}"
    else:
        system_prompt += (
            "\n\n## RELEVANT PRODUCTS\nNo specific products matched the query. "
            "Suggest the customer browse categories or ask what they're looking for."
        )

    reply = await query_openrouter(system_prompt, user_msg)
    if reply:
        return reply

    logger.info("OpenRouter failed, trying Gemini fallback...")
    reply = await generate_with_gemini(system_prompt, user_msg)
    if reply:
        return reply

    return (
        "I'm having a temporary connection issue with my AI engine. "
        "Please try again in a moment, or browse our products directly!"
    )


# ====================================================================
#  RAG PIPELINE
# ====================================================================

async def rag_pipeline(user_msg: str, db: Session, is_purchase: bool = False) -> str:
    candidates = await asyncio.to_thread(search_products_rag, user_msg)

    if candidates:
        context = build_rag_context(candidates)
        reply = await generate_response(user_msg, context, is_purchase)
        return reply

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
        reply = await generate_response(user_msg, simple_context, is_purchase)
        return reply

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
    access_token: Optional[str] = None
    history: Optional[List[dict]] = None


class ChatResponse(BaseModel):
    reply: str
    action: Optional[dict] = None


# ====================================================================
#  API ENDPOINTS
# ====================================================================

@router.get("/status")
def chatbot_status():
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
    global index_ready
    _qdrant_models = _import_qdrant_models()
    index_ready = False
    if qdrant_client:
        try:
            qdrant_client.delete_collection(COLLECTION_NAME)
        except Exception:
            pass
        if _qdrant_models:
            try:
                qdrant_client.create_collection(
                    collection_name=COLLECTION_NAME,
                    vectors_config=_qdrant_models.VectorParams(
                        size=EMBEDDING_SIZE,
                        distance=_qdrant_models.Distance.COSINE,
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
    Main chat endpoint with purchase automation.
    1. Quick intent detection for fast replies
    2. Purchase intent → auto-add to cart (requires auth)
    3. Full RAG pipeline for everything else
    """
    msg = req.message.strip()
    if not msg:
        return ChatResponse(reply="Please say something!")

    # ── Detect intent ──
    intent = detect_intent(msg)

    # ── PURCHASE INTENT ──
    if intent == "purchase":
        # Need authentication
        user = None
        if req.access_token:
            user = get_user_from_token(req.access_token, db)

        if not user:
            return ChatResponse(
                reply=(
                    "I'd love to help you buy that!\n\n"
                    "But first, please **Sign in** so I can add items to your cart. "
                    "Click the **Sign In** button in the top-right corner and come back to me!"
                )
            )

        # Check if message actually specifies a product or is just "buy" / "add to cart"
        purchase_words_removed = re.sub(_PURCHASE_PATTERN, '', msg.lower()).strip()
        # Also remove common filler words
        purchase_words_removed = re.sub(r'\b(please|me|for|the|a|an|to|in|some|can|could|i|want|need|would|like|this|that|it|you|my|with|and|or|how)\b', '', purchase_words_removed).strip()

        if not purchase_words_removed or len(purchase_words_removed) < 2:
            # No product specified — suggest products
            trending = await asyncio.to_thread(search_products_rag, "trending products clothing")
            if trending:
                top = trending[0]
                return ChatResponse(
                    reply=(
                        "Sure! What would you like to buy? 😊\n\n"
                        f"🔥 **{top['title']}** is trending right now at **${top['price']}**!\n\n"
                        "Tell me which product you want, like:\n"
                        "- \"Add the black t-shirt\"\n"
                        "- \"Buy that hoodie\"\n"
                        "- \"I'll take the jeans in size M\""
                    )
                )
            return ChatResponse(
                reply=(
                    "What would you like to buy? 🛍️\n\n"
                    "Just tell me the product name, like:\n"
                    "- \"Add the black t-shirt\"\n"
                    "- \"Buy those sneakers\"\n"
                    "- \"I want the skinny jeans\""
                )
            )

        # Process the purchase
        result = await handle_purchase_intent(msg, user, db)

        if result["success"]:
            # Generate a friendly LLM response to accompany the cart action
            product_info = result.get("product_title", "")
            size_str = f" in size {result['size']}" if result.get("size") else ""
            color_str = f" ({result['color']})" if result.get("color") else ""
            detail = f"{product_info}{color_str}{size_str}"

            # Use RAG to find context for the reply
            candidates = await asyncio.to_thread(search_products_rag, msg)
            context = build_rag_context(candidates) if candidates else ""
            llm_reply = await generate_response(
                f"I want to confirm that {detail} was just added to my cart. Give a friendly confirmation message.",
                context,
                is_purchase=True,
            )

            return ChatResponse(
                reply=llm_reply or result["message"],
                action={
                    "type": "add_to_cart",
                    "title": result["product_title"],
                    "product_id": result["product_id"],
                    "size": result.get("size"),
                    "color": result.get("color"),
                    "cart_url": "/cart",
                    "product_url": result.get("product_url"),
                }
            )
        else:
            if result.get("error") == "not_found":
                return ChatResponse(
                    reply=result["message"],
                )
            return ChatResponse(
                reply=result["message"],
            )

    # ── INTENT DETECTION (fast replies) ──
    if intent and intent in _INTENT_RESPONSES:
        if intent in ("greeting", "help"):
            candidates = await asyncio.to_thread(
                search_products_rag, "trending products clothing"
            )
            if candidates:
                top = candidates[0]
                extra = (
                    f"\n\n🔥 Hot pick: **{top['title']}** — just **${top['price']}**! "
                    f"Want to know more?"
                )
                return ChatResponse(reply=_INTENT_RESPONSES[intent] + extra)
        return ChatResponse(reply=_INTENT_RESPONSES[intent])

    # ── FULL RAG PIPELINE ──
    reply = await rag_pipeline(msg, db)
    return ChatResponse(reply=reply)
