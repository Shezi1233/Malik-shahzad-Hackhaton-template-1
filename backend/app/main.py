import os
import threading
import time

from sqlalchemy import text

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import Base, SessionLocal, engine
from app.models import CartItem, Notification, Order, OrderItem, Product, User
from app.routers import admin, cart, chatbot, notifications, orders, products, users

app = FastAPI(title="SHOP.CO API", version="1.0.0")

# CORS - allow Next.js frontend (any port) + production Vercel domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",  # Allow all origins (including localhost dev servers)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(cart.router, prefix="/api/cart", tags=["Cart"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Chatbot"])

# Serve uploaded files
uploads_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


@app.on_event("startup")
def startup():
    """Initialize database tables, seed data, and RAG engine on startup."""
    print("🚀 SHOP.CO API starting up...")
    print(f"   Database: {settings.DATABASE_URL.split('?')[0][:60]}...")

    # Create all tables and seed — wrapped so app starts even if DB is slow
    # Retry up to 3 times for PostgreSQL (Neon can be slow to wake up)
    max_retries = 3
    db_ok = False
    for attempt in range(1, max_retries + 1):
        try:
            Base.metadata.create_all(bind=engine)
            from app.seed import seed_database
            seed_database()
            print(f"✅ Database initialized and seeded successfully! (attempt {attempt})")
            db_ok = True
            break
        except Exception as e:
            print(f"⚠️  Database init attempt {attempt}/{max_retries} failed: {e}")
            if attempt < max_retries:
                wait = attempt * 2
                print(f"   Retrying in {wait}s...")
                time.sleep(wait)

    if not db_ok:
        print("❌ Database init failed after all retries — app will still serve /api/health")
        print("   DB-dependent endpoints may return errors until DB is available.")

    # Initialize RAG engine in background thread (never blocks startup)
    def _init_rag():
        try:
            from app.routers.chatbot import index_products, init_rag_engine
            init_rag_engine()
            db = SessionLocal()
            try:
                index_products(db)
            finally:
                db.close()
            print("🤖 RAG engine initialized!")
        except Exception as e:
            print(f"⚠️  RAG init failed (non-fatal): {e}")
    threading.Thread(target=_init_rag, daemon=True).start()

    print("✅ SHOP.CO API is ready!")


@app.get("/api/health")
def health():
    """Health check endpoint — always responds so Railway knows the app is alive."""
    db_status = "unknown"
    try:
        # Quick check if DB is reachable
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return {
        "status": "ok",
        "database": db_status,
    }


@app.post("/api/reseed")
def reseed():
    """Delete all data and re-seed the database."""
    db = SessionLocal()
    try:
        db.query(OrderItem).delete()
        db.query(Order).delete()
        db.query(CartItem).delete()
        db.query(Notification).delete()
        db.query(Product).delete()
        db.query(User).delete()
        db.commit()
    except Exception as e:
        db.rollback()
        db.close()
        return {"error": f"Failed to clear data: {str(e)}"}
    db.close()

    # Re-seed
    from app.seed import seed_database
    seed_database()
    return {"message": "Database re-seeded successfully"}
