import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.models import CartItem, Order, Product
from app.routers.orders import validate_and_decrement_stock
from app.routers.promocodes import _get_discount

router = APIRouter()
stripe.api_key = settings.STRIPE_SECRET_KEY


class ConfirmPaymentRequest(BaseModel):
    payment_intent_id: str
    shipping: dict


@router.post("/create-payment-intent")
async def create_payment_intent(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a Stripe PaymentIntent for the user's cart total."""
    cart_items = (
        db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    )
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Calculate total
    subtotal = 0.0
    for item in cart_items:
        if item.product:
            subtotal += item.product.price * item.quantity

    delivery_fee = 15
    total = subtotal + delivery_fee

    # Stripe requires amount in cents
    amount_cents = int(round(total * 100))

    try:
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="usd",
            automatic_payment_methods={"enabled": True},
            metadata={
                "user_id": current_user.id,
                "email": current_user.email,
            },
        )
        return {
            "client_secret": intent.client_secret,
            "amount": total,
            "payment_intent_id": intent.id,
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=str(e.user_message))


@router.post("/confirm")
async def confirm_payment(
    req: ConfirmPaymentRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Confirm payment and create order after Stripe payment succeeds."""
    payment_intent_id = req.payment_intent_id
    shipping = req.shipping

    # Verify the payment intent belongs to this user and succeeded
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e.user_message))

    if intent.status != "succeeded":
        raise HTTPException(status_code=400, detail=f"Payment not completed. Status: {intent.status}")

    if intent.metadata.get("user_id") != str(current_user.id):
        raise HTTPException(status_code=403, detail="Payment intent does not belong to this user")

    # Get cart items
    cart_items = (
        db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    )
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Validate stock & calculate subtotal
    subtotal = validate_and_decrement_stock(db, cart_items)

    discount = _get_discount(shipping.get("promo_code", "") or "", db)

    delivery_fee = 15
    tax_amount = round(subtotal * 0.08, 2)
    total = subtotal - discount + delivery_fee + tax_amount

    # Create order
    order = Order(
        user_id=current_user.id,
        status="processing",
        subtotal=subtotal,
        discount=discount,
        delivery_fee=delivery_fee,
        tax_amount=tax_amount,
        total=total,
        shipping_name=shipping.get("shipping_name", ""),
        shipping_email=shipping.get("shipping_email", ""),
        shipping_address=shipping.get("shipping_address", ""),
        shipping_city=shipping.get("shipping_city", ""),
        shipping_postal_code=shipping.get("shipping_postal_code", ""),
        shipping_country=shipping.get("shipping_country", ""),
        payment_method="stripe",
        stripe_payment_intent_id=payment_intent_id,
        payment_status="paid",
    )
    db.add(order)
    db.flush()

    # Create order items from cart
    for cart_item in cart_items:
        product = cart_item.product
        order_item = {
            "order_id": order.id,
            "product_id": product.id,
            "title": product.title,
            "price": product.price,
            "quantity": cart_item.quantity,
            "size": cart_item.size,
            "color": cart_item.color,
        }
        from app.models import OrderItem
        db.add(OrderItem(**order_item))

    # Clear cart
    for item in cart_items:
        db.delete(item)

    db.commit()
    db.refresh(order)

    return {
        "order_id": order.id,
        "status": "paid",
        "total": total,
        "payment_intent_id": payment_intent_id,
    }




class GuestCartItem(BaseModel):
    product_id: int
    quantity: int = 1
    size: Optional[str] = None
    color: Optional[str] = None


class GuestCheckoutRequest(BaseModel):
    shipping: dict
    cart_items: list[GuestCartItem]


@router.post("/guest-checkout")
def guest_checkout(
    req: GuestCheckoutRequest,
    db: Session = Depends(get_db),
):
    """Checkout without signing in - creates a guest order."""
    if not req.cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    shipping = req.shipping
    subtotal = 0.0

    for item in req.cart_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product #{item.product_id} not found")
        if product.stock is not None and item.quantity > product.stock:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.title}")
        if product.stock is not None:
            product.stock -= item.quantity
        subtotal += product.price * item.quantity

    discount = _get_discount(shipping.get("promo_code", "") or "", db)
    delivery_fee = 15
    tax_amount = round(subtotal * 0.08, 2)
    total = subtotal - discount + delivery_fee + tax_amount

    order = Order(
        user_id=None,
        status="pending",
        subtotal=subtotal,
        discount=discount,
        delivery_fee=delivery_fee,
        tax_amount=tax_amount,
        total=total,
        shipping_name=shipping.get("shipping_name", ""),
        shipping_email=shipping.get("shipping_email", ""),
        shipping_address=shipping.get("shipping_address", ""),
        shipping_city=shipping.get("shipping_city", ""),
        shipping_postal_code=shipping.get("shipping_postal_code", ""),
        shipping_country=shipping.get("shipping_country", ""),
        payment_method="guest_cod",
        payment_status="unpaid",
    )
    db.add(order)
    db.flush()

    for item in req.cart_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            from app.models import OrderItem
            db.add(OrderItem(
                order_id=order.id,
                product_id=product.id,
                title=product.title,
                price=product.price,
                quantity=item.quantity,
                size=item.size,
                color=item.color,
            ))

    db.commit()
    db.refresh(order)
    return {"order_id": order.id, "status": "pending", "total": total, "payment_method": "cod"}


class CODPaymentRequest(BaseModel):
    shipping: dict


@router.post("/cod-confirm")
def confirm_cod_payment(
    req: CODPaymentRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Confirm a Cash on Delivery order."""
    shipping = req.shipping

    # Get cart items
    cart_items = (
        db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    )
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Validate stock & calculate subtotal
    subtotal = validate_and_decrement_stock(db, cart_items)

    discount = _get_discount(shipping.get("promo_code", "") or "", db)

    delivery_fee = 15
    tax_amount = round(subtotal * 0.08, 2)
    total = subtotal - discount + delivery_fee + tax_amount

    # Create order with COD status
    order = Order(
        user_id=current_user.id,
        status="pending",
        subtotal=subtotal,
        discount=discount,
        delivery_fee=delivery_fee,
        tax_amount=tax_amount,
        total=total,
        shipping_name=shipping.get("shipping_name", ""),
        shipping_email=shipping.get("shipping_email", ""),
        shipping_address=shipping.get("shipping_address", ""),
        shipping_city=shipping.get("shipping_city", ""),
        shipping_postal_code=shipping.get("shipping_postal_code", ""),
        shipping_country=shipping.get("shipping_country", ""),
        payment_method="cod",
        payment_status="unpaid",
    )
    db.add(order)
    db.flush()

    # Create order items from cart
    for cart_item in cart_items:
        product = cart_item.product
        order_item = {
            "order_id": order.id,
            "product_id": product.id,
            "title": product.title,
            "price": product.price,
            "quantity": cart_item.quantity,
            "size": cart_item.size,
            "color": cart_item.color,
        }
        from app.models import OrderItem
        db.add(OrderItem(**order_item))

    # Clear cart
    for item in cart_items:
        db.delete(item)

    db.commit()
    db.refresh(order)

    return {
        "order_id": order.id,
        "status": "pending",
        "total": total,
        "payment_method": "cod",
    }
