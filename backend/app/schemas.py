from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel


# ===== USER SCHEMAS =====
class UserSignupRequest(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = None


class UserSigninRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    avatar_url: Optional[str] = None
    is_admin: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ===== PRODUCT SCHEMAS =====
class ProductResponse(BaseModel):
    id: int
    title: str
    slug: str
    description: Optional[str] = None
    price: float
    old_price: Optional[float] = None
    category: Optional[str] = None
    img_url: str
    img1: Optional[str] = None
    img2: Optional[str] = None
    img3: Optional[str] = None
    rating: float = 4.5
    colors: list = []
    sizes: list = []
    stock: int = 10

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    page_size: int


# ===== CART SCHEMAS =====
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1
    size: Optional[str] = None
    color: Optional[str] = None


class CartItemUpdate(BaseModel):
    quantity: Optional[int] = None
    size: Optional[str] = None
    color: Optional[str] = None


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    title: str
    img_url: str
    price: float
    quantity: int
    size: Optional[str] = None
    color: Optional[str] = None

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    items: List[CartItemResponse]
    total: float


# ===== ORDER SCHEMAS =====
class OrderCreateRequest(BaseModel):
    shipping_name: str
    shipping_email: str
    shipping_address: str
    shipping_city: str
    shipping_postal_code: str
    shipping_country: str
    payment_method: str = "creditCard"
    promo_code: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    title: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    size: Optional[str] = None
    color: Optional[str] = None

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    status: str
    subtotal: float
    discount: float
    delivery_fee: float
    tax_amount: float = 0
    total: float
    shipping_name: str
    shipping_email: str
    shipping_address: str
    shipping_city: str
    shipping_postal_code: str
    shipping_country: str
    payment_method: str
    created_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


class OrderTrackResponse(BaseModel):
    id: int
    status: str
    created_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


# ===== GOOGLE AUTH SCHEMAS =====
class GoogleAuthRequest(BaseModel):
    access_token: str


# ===== NOTIFICATION SCHEMAS =====
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    is_read: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    unread_count: int


# ===== ADMIN SCHEMAS =====
class AdminProductCreate(BaseModel):
    title: str
    price: float
    old_price: Optional[float] = None
    stock: int = 10
    category: str = "new_arrivals"
    description: Optional[str] = None
    img_url: str = "/product1.png"
    colors: Optional[str] = '["#4F4631","#314F4A","#31344F"]'
    sizes: Optional[str] = '["S","M","L","XL"]'


class AdminProductUpdate(BaseModel):
    title: Optional[str] = None
    price: Optional[float] = None
    old_price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    description: Optional[str] = None


class AdminOrderUpdate(BaseModel):
    status: str  # pending, processing, shipped, delivered, cancelled


class MonthlySales(BaseModel):
    month: str  # "2024-01"
    total: float


class TopProduct(BaseModel):
    id: int
    title: str
    total_sold: int
    revenue: float


class DashboardResponse(BaseModel):
    total_products: int
    total_orders: int
    total_users: int
    total_revenue: float
    recent_orders: List[OrderResponse] = []
    monthly_sales: List[MonthlySales] = []
    top_products: List[TopProduct] = []


class UserAdminResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    is_admin: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ===== WISHLIST SCHEMAS =====
class WishlistItemResponse(BaseModel):
    id: int
    product_id: int
    title: str
    price: float
    old_price: Optional[float] = None
    img_url: str
    rating: float = 4.5
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WishlistResponse(BaseModel):
    items: List[WishlistItemResponse]
    total: int


# ===== PASSWORD RESET SCHEMAS =====
class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# ===== PROMO CODE SCHEMAS =====
class PromoCodeCreate(BaseModel):
    code: str
    discount_amount: float
    usage_limit: int = 0
    is_active: bool = True


class PromoCodeUpdate(BaseModel):
    discount_amount: Optional[float] = None
    usage_limit: Optional[int] = None
    is_active: Optional[bool] = None


class PromoCodeResponse(BaseModel):
    id: int
    code: str
    discount_amount: float
    is_active: bool = False
    usage_limit: int = 0
    used_count: int = 0
    expires_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PromoCodeValidate(BaseModel):
    code: str


class PromoCodeValidateResponse(BaseModel):
    valid: bool
    discount_amount: float = 0
    message: str = ""
