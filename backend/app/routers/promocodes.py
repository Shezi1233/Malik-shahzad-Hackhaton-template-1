from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_admin_user
from app.database import get_db
from app.models import PromoCode, User
from app.schemas import (
    PromoCodeCreate,
    PromoCodeResponse,
    PromoCodeUpdate,
    PromoCodeValidate,
    PromoCodeValidateResponse,
)

router = APIRouter()


def _get_discount(code: str, db: Session) -> float:
    """Look up a promo code and return the discount amount, or 0 if invalid."""
    if not code or not code.strip():
        return 0
    promo = (
        db.query(PromoCode)
        .filter(PromoCode.code == code.strip().upper())
        .first()
    )
    if not promo:
        return 0
    if not promo.is_active:
        return 0
    if promo.expires_at and datetime.now(timezone.utc) > promo.expires_at:
        return 0
    if promo.usage_limit > 0 and promo.used_count >= promo.usage_limit:
        return 0
    # Increment usage
    promo.used_count += 1
    db.flush()
    return promo.discount_amount


# ===== PUBLIC ENDPOINT =====

@router.post("/validate", response_model=PromoCodeValidateResponse)
def validate_promo_code(req: PromoCodeValidate, db: Session = Depends(get_db)):
    """Validate a promo code without applying it."""
    promo = db.query(PromoCode).filter(PromoCode.code == req.code.strip().upper()).first()
    if not promo:
        return PromoCodeValidateResponse(valid=False, discount_amount=0, message="Invalid promo code")
    if not promo.is_active:
        return PromoCodeValidateResponse(valid=False, discount_amount=0, message="This promo code is no longer active")
    if promo.expires_at and datetime.now(timezone.utc) > promo.expires_at:
        return PromoCodeValidateResponse(valid=False, discount_amount=0, message="This promo code has expired")
    if promo.usage_limit > 0 and promo.used_count >= promo.usage_limit:
        return PromoCodeValidateResponse(valid=False, discount_amount=0, message="This promo code has reached its usage limit")
    return PromoCodeValidateResponse(
        valid=True,
        discount_amount=promo.discount_amount,
        message=f"Promo code applied! You save ${promo.discount_amount:.0f}",
    )


# ===== ADMIN ENDPOINTS =====

@router.get("", response_model=list[PromoCodeResponse])
def admin_list_promocodes(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    return db.query(PromoCode).order_by(PromoCode.created_at.desc()).all()


@router.post("", response_model=PromoCodeResponse)
def admin_create_promocode(
    req: PromoCodeCreate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    existing = db.query(PromoCode).filter(PromoCode.code == req.code.strip().upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Promo code already exists")
    promo = PromoCode(
        code=req.code.strip().upper(),
        discount_amount=req.discount_amount,
        usage_limit=req.usage_limit,
        is_active=req.is_active,
    )
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return promo


@router.put("/{promo_id}", response_model=PromoCodeResponse)
def admin_update_promocode(
    promo_id: int,
    req: PromoCodeUpdate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    promo = db.query(PromoCode).filter(PromoCode.id == promo_id).first()
    if not promo:
        raise HTTPException(status_code=404, detail="Promo code not found")
    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(promo, key, value)
    db.commit()
    db.refresh(promo)
    return promo


@router.delete("/{promo_id}")
def admin_delete_promocode(
    promo_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    promo = db.query(PromoCode).filter(PromoCode.id == promo_id).first()
    if not promo:
        raise HTTPException(status_code=404, detail="Promo code not found")
    db.delete(promo)
    db.commit()
    return {"message": "Promo code deleted"}
