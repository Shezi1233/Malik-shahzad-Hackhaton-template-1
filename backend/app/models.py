import json
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=_utcnow)

    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    old_price = Column(Float, nullable=True)
    category = Column(String(100), nullable=True)
    img_url = Column(String(500), nullable=False)
    img1 = Column(String(500), nullable=True)
    img2 = Column(String(500), nullable=True)
    img3 = Column(String(500), nullable=True)
    rating = Column(Float, default=4.5)
    colors = Column(Text, default="[]")
    sizes = Column(Text, default='["S","M","L","XL"]')
    stock = Column(Integer, default=10)
    created_at = Column(DateTime, default=_utcnow)

    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")

    def get_colors(self):
        return json.loads(self.colors) if self.colors else []

    def get_sizes(self):
        return json.loads(self.sizes) if self.sizes else []


class CartItem(Base):
    __tablename__ = "cart_items"
    __table_args__ = (
        UniqueConstraint("user_id", "product_id", "size", "color", name="uq_user_product_size_color"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)
    size = Column(String(10), nullable=True)
    color = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=_utcnow)

    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="pending")
    subtotal = Column(Float, nullable=False)
    discount = Column(Float, default=0)
    delivery_fee = Column(Float, default=15)
    total = Column(Float, nullable=False)
    shipping_name = Column(String(200))
    shipping_email = Column(String(255))
    shipping_address = Column(Text)
    shipping_city = Column(String(100))
    shipping_postal_code = Column(String(20))
    shipping_country = Column(String(100))
    payment_method = Column(String(50))
    created_at = Column(DateTime, default=_utcnow)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    title = Column(String(200))
    price = Column(Float)
    quantity = Column(Integer)
    size = Column(String(10), nullable=True)
    color = Column(String(50), nullable=True)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=_utcnow)

    user = relationship("User", back_populates="notifications")
