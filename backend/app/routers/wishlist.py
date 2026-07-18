from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Product, User, WishlistItem
from app.schemas import WishlistItemResponse, WishlistResponse

router = APIRouter()


@router.get("", response_model=WishlistResponse)
def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == current_user.id)
        .order_by(WishlistItem.created_at.desc())
        .all()
    )
    wishlist_items = []
    for item in items:
        product = item.product
        if not product:
            continue
        wishlist_items.append(
            WishlistItemResponse(
                id=item.id,
                product_id=product.id,
                title=product.title,
                price=product.price,
                old_price=product.old_price,
                img_url=product.img_url,
                rating=product.rating or 4.5,
                created_at=item.created_at,
            )
        )
    return WishlistResponse(items=wishlist_items, total=len(wishlist_items))


@router.post("/{product_id}")
def add_to_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if already in wishlist
    existing = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == product_id,
        )
        .first()
    )
    if existing:
        return {"message": "Already in wishlist", "id": existing.id}

    wishlist_item = WishlistItem(
        user_id=current_user.id,
        product_id=product_id,
    )
    db.add(wishlist_item)
    db.commit()
    db.refresh(wishlist_item)

    return {"message": "Added to wishlist", "id": wishlist_item.id}


@router.delete("/{product_id}")
def remove_from_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == product_id,
        )
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")

    db.delete(item)
    db.commit()

    return {"message": "Removed from wishlist"}


@router.get("/check/{product_id}")
def check_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Check if a product is in the user's wishlist."""
    item = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == product_id,
        )
        .first()
    )
    return {"in_wishlist": item is not None, "id": item.id if item else None}


@router.delete("", response_model=dict)
def clear_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(WishlistItem).filter(WishlistItem.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Wishlist cleared"}
