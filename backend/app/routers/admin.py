import json
import os
import re
import shutil
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.auth import get_admin_user
from app.database import get_db
from app.models import CartItem, Notification, Order, OrderItem, Product, User
from app.schemas import (
    AdminOrderUpdate,
    AdminProductCreate,
    AdminProductUpdate,
    DashboardResponse,
    OrderItemResponse,
    OrderResponse,
    ProductResponse,
    UserAdminResponse,
)

router = APIRouter()


# ===== HELPERS =====

def _product_to_response(p: Product) -> ProductResponse:
    import json
    return ProductResponse(
        id=p.id,
        title=p.title,
        slug=p.slug,
        description=p.description,
        price=p.price,
        old_price=p.old_price,
        category=p.category,
        img_url=p.img_url,
        img1=p.img1,
        img2=p.img2,
        img3=p.img3,
        rating=p.rating or 4.5,
        colors=json.loads(p.colors) if p.colors else [],
        sizes=json.loads(p.sizes) if p.sizes else [],
        stock=p.stock or 10,
    )


def _build_order_response(order: Order) -> OrderResponse:
    return OrderResponse(
        id=order.id,
        status=order.status,
        subtotal=order.subtotal,
        discount=order.discount,
        delivery_fee=order.delivery_fee,
        total=order.total,
        shipping_name=order.shipping_name,
        shipping_email=order.shipping_email,
        shipping_address=order.shipping_address,
        shipping_city=order.shipping_city,
        shipping_postal_code=order.shipping_postal_code,
        shipping_country=order.shipping_country,
        payment_method=order.payment_method,
        created_at=order.created_at,
        items=[
            OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                title=item.title,
                price=item.price,
                quantity=item.quantity,
                size=item.size,
                color=item.color,
            )
            for item in order.items
        ],
    )


def _slugify(text: str) -> str:
    """Convert text to URL-friendly slug."""
    slug = text.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug[:200]


def _ensure_unique_slug(db: Session, slug: str) -> str:
    """Make slug unique by appending a number if needed."""
    original = slug
    counter = 1
    while db.query(Product).filter(Product.slug == slug).first():
        slug = f"{original}-{counter}"
        counter += 1
    return slug


# ===== DASHBOARD =====

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()
    total_users = db.query(User).count()

    revenue_result = db.query(func.coalesce(func.sum(Order.total), 0)).scalar()
    total_revenue = float(revenue_result) if revenue_result else 0.0

    recent_orders = (
        db.query(Order)
        .order_by(Order.created_at.desc())
        .limit(10)
        .all()
    )

    return DashboardResponse(
        total_products=total_products,
        total_orders=total_orders,
        total_users=total_users,
        total_revenue=total_revenue,
        recent_orders=[_build_order_response(o) for o in recent_orders],
    )


# ===== PRODUCT MANAGEMENT =====

@router.get("/products", response_model=list[ProductResponse])
def admin_list_products(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    products = db.query(Product).order_by(Product.id.desc()).all()
    return [_product_to_response(p) for p in products]


@router.post("/products", response_model=ProductResponse)
def admin_create_product(
    req: AdminProductCreate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    slug = _ensure_unique_slug(db, _slugify(req.title))

    product = Product(
        title=req.title,
        slug=slug,
        price=req.price,
        old_price=req.old_price,
        stock=req.stock or 10,
        category=req.category or "new_arrivals",
        description=req.description or f"Shop the latest {req.title} at SHOP.CO. Premium quality meets modern style.",
        img_url=req.img_url or "/product1.png",
        img1=req.img_url or "/detail1.png",
        img2="/detail2.png",
        img3=req.img_url or "/product1.png",
        colors=req.colors or '["#4F4631","#314F4A","#31344F"]',
        sizes=req.sizes or '["S","M","L","XL"]',
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    return _product_to_response(product)


@router.put("/products/{product_id}", response_model=ProductResponse)
def admin_update_product(
    product_id: int,
    req: AdminProductUpdate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return _product_to_response(product)


@router.delete("/products/{product_id}")
def admin_delete_product(
    product_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Delete associated cart items and order items first
    db.query(CartItem).filter(CartItem.product_id == product_id).delete()
    db.query(OrderItem).filter(OrderItem.product_id == product_id).delete()
    db.delete(product)
    db.commit()

    return {"message": f"Product #{product_id} deleted successfully"}


# ===== ORDER MANAGEMENT =====

@router.get("/orders", response_model=list[OrderResponse])
def admin_list_orders(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return [_build_order_response(o) for o in orders]


@router.put("/orders/{order_id}/status", response_model=OrderResponse)
def admin_update_order_status(
    order_id: int,
    req: AdminOrderUpdate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    valid_statuses = {"pending", "processing", "shipped", "delivered", "cancelled"}
    if req.status.lower() not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
        )

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    old_status = order.status
    order.status = req.status.lower()
    db.commit()
    db.refresh(order)

    # Create notification for the user about status change
    notification = Notification(
        user_id=order.user_id,
        title="Order Status Updated",
        message=f"Your order #{order.id} has been updated from '{old_status}' to '{req.status}'.",
    )
    db.add(notification)
    db.commit()

    return _build_order_response(order)


# ===== IMAGE UPLOAD =====

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "public", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


@router.post("/upload-image")
def admin_upload_image(
    file: UploadFile = File(...),
    admin: User = Depends(get_admin_user),
):
    ext = os.path.splitext(file.filename or ".png")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Generate unique filename
    filename = f"product_{uuid.uuid4().hex[:12]}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)

    url = f"/uploads/{filename}"
    return {"url": url, "filename": filename}


# ===== USER MANAGEMENT =====

@router.get("/users", response_model=list[UserAdminResponse])
def admin_list_users(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    users = db.query(User).order_by(User.id.desc()).all()
    return [UserAdminResponse.model_validate(u) for u in users]


@router.delete("/users/{user_id}")
def admin_delete_user(
    user_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    # Don't allow deleting yourself
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Delete associated data
    db.query(CartItem).filter(CartItem.user_id == user_id).delete()
    db.query(Notification).filter(Notification.user_id == user_id).delete()

    # Delete order items for user's orders, then orders
    order_ids = [o.id for o in db.query(Order).filter(Order.user_id == user_id).all()]
    if order_ids:
        db.query(OrderItem).filter(OrderItem.order_id.in_(order_ids)).delete()
        db.query(Order).filter(Order.user_id == user_id).delete()

    db.delete(user)
    db.commit()

    return {"message": f"User #{user_id} deleted successfully"}
