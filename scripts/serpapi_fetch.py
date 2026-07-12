"""
SerpAPI Product Fetcher
=======================
Fetches real clothing products from Google Shopping via SerpAPI,
downloads images, updates database, and re-indexes Qdrant.
"""

import json
import logging
import os
import re
import sys
import time
import urllib.request
from pathlib import Path

from serpapi import Client

# Add backend directory to path
BACKEND_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "backend",
)
sys.path.insert(0, BACKEND_DIR)

# Load .env file manually before importing app modules
env_path = os.path.join(BACKEND_DIR, ".env")
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip())
                if key.strip() == "DATABASE_URL":
                    os.environ["DATABASE_URL"] = value.strip()

from app.auth import hash_password
from app.database import SessionLocal
from app.models import Notification, Product, User

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("serpapi-fetcher")

SERPAPI_KEY = "89871a67cee8413261464282c75ceaf19e4e78ecae7031445e746acb3a12169a"

# Categories → search queries
CATEGORIES = {
    "new_arrivals": [
        "trendy graphic t-shirt men",
        "casual button down shirt men",
        "summer linen shirt men",
    ],
    "top_selling": [
        "slim fit jeans men",
        "cargo shorts men",
        "classic polo shirt men",
    ],
    "you_might_also_like": [
        "casual hoodie men",
        "sports jacket men",
        "denim jacket men",
    ],
}

# Public directory for images
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")

# Template descriptions for different categories
DESCRIPTION_TEMPLATES = {
    "t-shirt": "A stylish {title} crafted from premium cotton for all-day comfort. Perfect for casual outings and everyday wear.",
    "shirt": "This {title} offers a refined look with premium fabric and tailored fit. Ideal for both casual and semi-formal occasions.",
    "jeans": "These {title} provide the perfect blend of style and comfort. Made with quality denim for lasting wear.",
    "shorts": "Stay comfortable with these {title}. Designed for warm weather with a relaxed fit and breathable fabric.",
    "polo": "Elevate your wardrobe with this {title}. Classic design meets modern comfort for a versatile look.",
    "hoodie": "This {title} combines streetwear style with cozy comfort. A wardrobe essential for cooler days.",
    "jacket": "Make a statement with this {title}. Premium materials and expert craftsmanship for a standout look.",
    "default": "Shop the latest {title} at SHOP.CO. Premium quality meets modern style for the fashion-forward customer.",
}

COLOR_OPTIONS = [
    ["#4F4631", "#314F4A", "#31344F"],
    ["#31344F", "#4F4631", "#314F4A"],
    ["#314F4A", "#31344F", "#4F4631"],
    ["#E8D5C4", "#2C3E50", "#8E44AD"],
    ["#1A1A2E", "#16213E", "#0F3460"],
    ["#2D3436", "#636E72", "#B2BEC3"],
    ["#6C5B7B", "#C06C84", "#F67280"],
    ["#355C7D", "#6C5B7B", "#C06C84"],
]

SIZE_OPTIONS = [
    ["S", "M", "L", "XL"],
    ["S", "M", "L", "XL", "XXL"],
    ["M", "L", "XL"],
]


def get_description(title: str, category: str) -> str:
    """Generate a realistic product description."""
    title_lower = title.lower()
    for keyword, template in DESCRIPTION_TEMPLATES.items():
        if keyword in title_lower:
            return template.format(title=title)
    return DESCRIPTION_TEMPLATES["default"].format(title=title)


def get_slug(title: str) -> str:
    """Generate URL slug from title."""
    slug = title.lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"\s+", "-", slug.strip())
    return slug[:100]


def download_image(url: str, filename: str) -> str:
    """Download image from URL to public directory. Returns the relative path."""
    try:
        filepath = os.path.join(PUBLIC_DIR, filename)
        urllib.request.urlretrieve(url, filepath)
        return f"/{filename}"
    except Exception as e:
        logger.warning(f"  ⚠️ Could not download {filename}: {e}")
        return "/product1.png"  # fallback


def fetch_products_for_category(search_query: str, num: int = 5) -> list:
    """Fetch products from Google Shopping via SerpAPI."""
    client = Client(api_key=SERPAPI_KEY)

    results = client.search(
        engine="google_shopping",
        q=search_query,
        num=num,
        gl="us",
        hl="en",
    )

    shopping_results = results.get("shopping_results", [])
    logger.info(f"  📦 Found {len(shopping_results)} results for '{search_query}'")

    products = []
    for item in shopping_results[:num]:
        title = item.get("title", "Unknown Product")
        price = item.get("extracted_price", 29.99)
        thumbnail = item.get("thumbnail", "")

        # Some items have multiple image thumbnails
        images = []
        if thumbnail:
            images.append(thumbnail)

        products.append(
            {
                "title": title.upper(),
                "price": float(price),
                "thumbnail": thumbnail,
                "images": images,
                "source": item.get("source", ""),
            }
        )

    return products


def clear_existing_data(db: SessionLocal):
    """Clear all existing products, orders, cart items."""
    from app.models import CartItem, Notification, Order, OrderItem, Product

    logger.info("🗑️  Clearing existing data...")
    db.query(OrderItem).delete()
    db.query(Order).delete()
    db.query(CartItem).delete()
    db.query(Notification).delete()
    db.query(Product).delete()
    # Don't delete users
    db.commit()
    logger.info("✅ Existing data cleared")


def seed_from_serpapi(db: SessionLocal):
    """Main function: fetch real products from SerpAPI and seed the database."""
    all_products = []
    color_idx = 0
    size_idx = 0
    product_number = 1

    for category, queries in CATEGORIES.items():
        logger.info(f"\n{'='*60}")
        logger.info(f"📂 Category: {category}")
        logger.info(f"{'='*60}")

        for query in queries:
            logger.info(f"\n  🔍 Searching: '{query}'")
            products = fetch_products_for_category(query, num=4)

            for p in products:
                # Generate unique slug
                slug = f"{get_slug(p['title'])}-{product_number}"

                # Images
                img_url = f"/products/product_{product_number}.png"
                img1 = f"/products/product_{product_number}_a.png"
                img2 = f"/products/product_{product_number}_b.png"
                img3 = f"/products/product_{product_number}_c.png"

                # Download main image
                if p["thumbnail"]:
                    local_path = f"products/product_{product_number}.png"
                    os.makedirs(os.path.join(PUBLIC_DIR, "products"), exist_ok=True)
                    download_image(p["thumbnail"], local_path)

                # Generate old_price (original price before discount)
                old_price = round(p["price"] * (1 + 0.15 + (hash(p["title"]) % 40) / 100), 2)

                # Rating
                rating = round(4.0 + (hash(p["title"]) % 10) / 10, 1)
                if rating > 5.0:
                    rating = 5.0

                # Colors and sizes
                colors = COLOR_OPTIONS[color_idx % len(COLOR_OPTIONS)]
                sizes = SIZE_OPTIONS[size_idx % len(SIZE_OPTIONS)]
                color_idx += 1
                size_idx += 1

                # Description
                description = get_description(p["title"], category)

                # Create product
                product = Product(
                    title=p["title"],
                    slug=slug,
                    price=p["price"],
                    old_price=old_price if old_price > p["price"] else None,
                    description=description,
                    category=category,
                    img_url=img_url,
                    img1=img1,
                    img2=img2,
                    img3=img3,
                    rating=rating,
                    colors=json.dumps(colors),
                    sizes=json.dumps(sizes),
                    stock=10 + (hash(p["title"]) % 20),
                )

                db.add(product)
                db.flush()
                all_products.append(product)

                logger.info(
                    f"  ✅ #{product_number:2d} {p['title'][:45]:45s} | "
                    f"${p['price']:>6.2f} | ⭐{rating} | {p['source']}"
                )

                product_number += 1
                time.sleep(0.3)  # Small delay to avoid hitting rate limits

    db.commit()
    logger.info(f"\n{'='*60}")
    logger.info(f"✅ TOTAL: {len(all_products)} products seeded from SerpAPI!")
    logger.info(f"{'='*60}")

    return all_products


def ensure_admin_user(db: SessionLocal):
    """Ensure admin user exists for seeding."""
    admin = db.query(User).filter(User.email == "admin@shop.co").first()
    if not admin:
        from app.auth import hash_password

        admin = User(
            username="admin",
            email="admin@shop.co",
            hashed_password=hash_password("admin123"),
            is_admin=True,
            full_name="Admin",
        )
        db.add(admin)
        db.commit()
        db.flush()
        logger.info("👤 Admin user created")

    # Ensure notifications exist
    existing = db.query(Notification).count()
    if existing == 0:
        notifications = [
            Notification(
                user_id=admin.id,
                title="Welcome to SHOP.CO!",
                message="Welcome! Start exploring our latest collection and enjoy shopping.",
            ),
            Notification(
                user_id=admin.id,
                title="New Arrivals",
                message="Check out our newest collection - fresh styles just landed!",
            ),
        ]
        db.add_all(notifications)
        db.commit()
        logger.info("🔔 Default notifications created")

    return admin


def reindex_qdrant(db: SessionLocal):
    """Re-index all products in Qdrant Cloud."""
    try:
        from app.routers.chatbot import index_products, init_rag_engine

        logger.info("\n🔄 Initializing RAG engine...")
        init_rag_engine()
        logger.info("📤 Indexing products in Qdrant Cloud...")
        index_products(db)
        logger.info("✅ Qdrant re-indexed!")
    except Exception as e:
        logger.warning(f"⚠️ Qdrant re-index not available (server needs restart): {e}")


def main():
    logger.info("=" * 60)
    logger.info("  🛍️  SERPAPI REAL PRODUCT FETCHER")
    logger.info("=" * 60)
    logger.info(f"  📁 Public dir: {PUBLIC_DIR}")
    logger.info(f"  🔑 SerpAPI: {'✅ Configured' if SERPAPI_KEY else '❌ Missing'}")

    db = SessionLocal()
    try:
        # Step 1: Ensure admin user
        ensure_admin_user(db)

        # Step 2: Clear old products
        clear_existing_data(db)

        # Step 3: Fetch and seed real products
        seed_from_serpapi(db)

        # Step 4: Re-index Qdrant
        reindex_qdrant(db)

    finally:
        db.close()

    logger.info("\n" + "=" * 60)
    logger.info("  🎉 DONE! Real products added to database!")
    logger.info(f"  Public images in: {PUBLIC_DIR}")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
