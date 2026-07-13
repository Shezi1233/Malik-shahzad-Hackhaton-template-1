import os
import threading

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import Base, SessionLocal, engine
from app.models import CartItem, Notification, Order, OrderItem, Product, User
from app.routers import admin, cart, chatbot, notifications, orders, products, users
from app.seed import seed_database

# Create all tables
Base.metadata.create_all(bind=engine)

# Seed initial data
seed_database()

app = FastAPI(title="SHOP.CO API", version="1.0.0")

# CORS - allow Next.js frontend (any port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    """Initialize RAG engine in background thread so server starts fast."""
    def _init_rag():
        from app.routers.chatbot import index_products, init_rag_engine
        init_rag_engine()
        db = SessionLocal()
        try:
            index_products(db)
        finally:
            db.close()
    threading.Thread(target=_init_rag, daemon=True).start()


@app.get("/api/health")
def health():
    return {"status": "ok"}


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
    seed_database()
    return {"message": "Database re-seeded successfully"}
