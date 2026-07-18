from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Product, Review, User
from app.schemas import ReviewCreate, ReviewResponse, ReviewStats

router = APIRouter()


@router.get("/product/{product_id}", response_model=list[ReviewResponse])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(Review)
        .filter(Review.product_id == product_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    result = []
    for r in reviews:
        username = r.user.username if r.user else "Anonymous"
        result.append(ReviewResponse(
            id=r.id,
            product_id=r.product_id,
            user_id=r.user_id,
            username=username,
            rating=r.rating,
            title=r.title,
            comment=r.comment,
            created_at=r.created_at,
        ))
    return result


@router.get("/product/{product_id}/stats", response_model=ReviewStats)
def get_product_review_stats(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.product_id == product_id).all()
    total = len(reviews)
    if total == 0:
        return ReviewStats(average_rating=0, total_reviews=0, distribution={})

    avg = sum(r.rating for r in reviews) / total
    dist = {i: 0 for i in range(1, 6)}
    for r in reviews:
        dist[r.rating] = dist.get(r.rating, 0) + 1

    return ReviewStats(
        average_rating=round(avg, 1),
        total_reviews=total,
        distribution=dist,
    )


@router.post("", response_model=ReviewResponse)
def create_review(
    req: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if req.rating < 1 or req.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    product = db.query(Product).filter(Product.id == req.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = (
        db.query(Review)
        .filter(
            Review.user_id == current_user.id,
            Review.product_id == req.product_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")

    review = Review(
        user_id=current_user.id,
        product_id=req.product_id,
        rating=req.rating,
        title=req.title,
        comment=req.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return ReviewResponse(
        id=review.id,
        product_id=review.product_id,
        user_id=review.user_id,
        username=current_user.username,
        rating=review.rating,
        title=review.title,
        comment=review.comment,
        created_at=review.created_at,
    )
