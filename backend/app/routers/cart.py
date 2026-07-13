from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import CartItem, Product, User
from app.schemas import CartItemCreate, CartItemResponse, CartItemUpdate, CartResponse

router = APIRouter()


def _get_cart_response(user_id: int, db: Session) -> CartResponse:
    """Helper to build cart response with product details."""
    items = db.query(CartItem).filter(CartItem.user_id == user_id).all()
    cart_items = []
    total = 0.0
    for item in items:
        product = item.product
        if not product:
            continue
        price = product.price
        total += price * item.quantity
        cart_items.append(
            CartItemResponse(
                id=item.id,
                product_id=product.id,
                title=product.title,
                img_url=product.img_url,
                price=price,
                quantity=item.quantity,
                size=item.size,
                color=item.color,
            )
        )
    return CartResponse(items=cart_items, total=total)


@router.get("", response_model=CartResponse)
def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _get_cart_response(current_user.id, db)


@router.post("", response_model=CartResponse)
def add_to_cart(
    req: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify product exists
    product = db.query(Product).filter(Product.id == req.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if item already exists in cart
    existing = (
        db.query(CartItem)
        .filter(
            CartItem.user_id == current_user.id,
            CartItem.product_id == req.product_id,
            CartItem.size == req.size,
            CartItem.color == req.color,
        )
        .first()
    )

    if existing:
        existing.quantity += req.quantity
    else:
        cart_item = CartItem(
            user_id=current_user.id,
            product_id=req.product_id,
            quantity=req.quantity,
            size=req.size,
            color=req.color,
        )
        db.add(cart_item)

    db.commit()
    return _get_cart_response(current_user.id, db)


@router.put("/{item_id}", response_model=CartResponse)
def update_cart_item(
    item_id: int,
    req: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart_item = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.user_id == current_user.id)
        .first()
    )
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if req.quantity is not None:
        if req.quantity <= 0:
            db.delete(cart_item)
        else:
            cart_item.quantity = req.quantity
    if req.size is not None:
        cart_item.size = req.size
    if req.color is not None:
        cart_item.color = req.color

    db.commit()
    return _get_cart_response(current_user.id, db)


@router.delete("/{item_id}", response_model=CartResponse)
def remove_from_cart(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart_item = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.user_id == current_user.id)
        .first()
    )
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(cart_item)
    db.commit()
    return _get_cart_response(current_user.id, db)


@router.delete("", response_model=dict)
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Cart cleared"}
