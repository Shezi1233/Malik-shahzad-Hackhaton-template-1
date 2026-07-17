import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.models import CartItem, Order, Product

router = APIRouter()
stripe.api_key = settings.STRIPE_SECRET_KEY


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
    payment_intent_id: str,
    shipping: dict,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Confirm payment and create order after Stripe payment succeeds."""
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

    # Calculate totals
    subtotal = 0.0
    for item in cart_items:
        if item.product:
            subtotal += item.product.price * item.quantity

    discount = 0
    promo = shipping.get("promo_code", "")
    if promo and promo.strip().upper() == "DISCOUNT10":
        discount = 30

    delivery_fee = 15
    total = subtotal - discount + delivery_fee

    # Create order
    order = Order(
        user_id=current_user.id,
        status="processing",
        subtotal=subtotal,
        discount=discount,
        delivery_fee=delivery_fee,
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
