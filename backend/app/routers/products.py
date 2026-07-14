import json
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product
from app.schemas import ProductListResponse, ProductResponse

router = APIRouter()


def _product_to_response(p: Product) -> ProductResponse:
    """Convert Product ORM to ProductResponse with proper list fields."""
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


@router.get("", response_model=ProductListResponse)
def list_products(
    category: str = Query(None, description="Filter by category"),
    search: str = Query(None, description="Search by title"),
    min_price: Optional[float] = Query(None, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    sizes: Optional[str] = Query(None, description="Comma-separated sizes (e.g. S,M,L)"),
    colors: Optional[str] = Query(None, description="Comma-separated color hex values (e.g. #4F4631,#31344F)"),
    rating: Optional[float] = Query(None, description="Minimum rating filter"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Product)

    if category:
        query = query.filter(Product.category == category)

    if search:
        query = query.filter(Product.title.ilike(f"%{search}%"))

    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if rating is not None:
        query = query.filter(Product.rating >= rating)

    if sizes:
        size_list = [s.strip() for s in sizes.split(",") if s.strip()]
        if size_list:
            # Filter products whose JSON sizes field contains any of the selected sizes
            size_filters = []
            for size in size_list:
                size_filters.append(Product.sizes.ilike(f'%"{size}"%'))
            query = query.filter(or_(*size_filters))

    if colors:
        color_list = [c.strip() for c in colors.split(",") if c.strip()]
        if color_list:
            # Filter products whose JSON colors field contains any of the selected colors
            color_filters = []
            for color in color_list:
                color_filters.append(Product.colors.ilike(f'%{color}%'))
            query = query.filter(or_(*color_filters))

    total = query.count()
    products = query.offset((page - 1) * page_size).limit(page_size).all()

    return ProductListResponse(
        products=[_product_to_response(p) for p in products],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/search", response_model=ProductListResponse)
def search_products(
    q: str = Query("", description="Search query"),
    db: Session = Depends(get_db),
):
    query = db.query(Product).filter(Product.title.ilike(f"%{q}%"))
    products = query.all()
    return ProductListResponse(
        products=[_product_to_response(p) for p in products],
        total=len(products),
        page=1,
        page_size=len(products) or 1,
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return _product_to_response(product)
