from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import CartItem, Notification, Order, OrderItem, Product, User
from app.routers.promocodes import _get_discount
from app.schemas import (
    OrderCreateRequest,
    OrderItemResponse,
    OrderResponse,
    OrderTrackResponse,
)


def validate_and_decrement_stock(db: Session, cart_items: list) -> float:
    """Validate stock availability and decrement. Returns subtotal."""
    subtotal = 0.0
    for item in cart_items:
        product = item.product
        if not product:
            raise HTTPException(status_code=400, detail=f"Product not found for cart item #{item.id}")
        if product.stock is not None and item.quantity > product.stock:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.title}'. Available: {product.stock}, requested: {item.quantity}",
            )
        # Decrement stock
        if product.stock is not None:
            product.stock -= item.quantity
        subtotal += product.price * item.quantity
    return subtotal

router = APIRouter()


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


@router.post("", response_model=OrderResponse)
def create_order(
    req: OrderCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Get user's cart items
    cart_items = (
        db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    )
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Validate stock & calculate subtotal
    subtotal = validate_and_decrement_stock(db, cart_items)

    # Look up promo code from DB
    discount = _get_discount(req.promo_code or "", db)

    delivery_fee = 15
    total = subtotal - discount + delivery_fee

    # Create order
    order = Order(
        user_id=current_user.id,
        status="pending",
        subtotal=subtotal,
        discount=discount,
        delivery_fee=delivery_fee,
        total=total,
        shipping_name=req.shipping_name,
        shipping_email=req.shipping_email,
        shipping_address=req.shipping_address,
        shipping_city=req.shipping_city,
        shipping_postal_code=req.shipping_postal_code,
        shipping_country=req.shipping_country,
        payment_method=req.payment_method,
    )
    db.add(order)
    db.flush()

    # Create order items from cart items
    for cart_item in cart_items:
        product = cart_item.product
        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            title=product.title,
            price=product.price,
            quantity=cart_item.quantity,
            size=cart_item.size,
            color=cart_item.color,
        )
        db.add(order_item)

    # Clear cart
    for item in cart_items:
        db.delete(item)

    # Create notification
    notification = Notification(
        user_id=current_user.id,
        title="Order Placed",
        message=f"Your order #{order.id} has been placed successfully!",
    )
    db.add(notification)

    db.commit()
    db.refresh(order)

    return _build_order_response(order)


@router.get("", response_model=list[OrderResponse])
def list_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    orders = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return [_build_order_response(o) for o in orders]


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _build_order_response(order)


@router.get("/{order_id}/track", response_model=OrderTrackResponse)
def track_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return OrderTrackResponse(
        id=order.id,
        status=order.status,
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


def restore_stock_for_order(order: Order, db: Session):
    """Restore product stock when an order is cancelled."""
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product and product.stock is not None:
            product.stock += item.quantity
    db.flush()


@router.put("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel an order if it's still pending or processing."""
    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status not in ("pending", "processing"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel order in '{order.status}' status. Only 'pending' or 'processing' orders can be cancelled.",
        )

    old_status = order.status
    order.status = "cancelled"

    # Restore product stock
    restore_stock_for_order(order, db)

    db.commit()
    db.refresh(order)

    # Create notification
    notification = Notification(
        user_id=current_user.id,
        title="Order Cancelled",
        message=f"Your order #{order.id} has been cancelled.",
    )
    db.add(notification)
    db.commit()

    return _build_order_response(order)
