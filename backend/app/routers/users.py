from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.database import get_db
from app.models import User
from app.schemas import (
    TokenResponse,
    UserResponse,
    UserSigninRequest,
    UserSignupRequest,
    UserUpdateRequest,
)

router = APIRouter()


@router.post("/signup", response_model=TokenResponse)
def signup(req: UserSignupRequest, db: Session = Depends(get_db)):
    # Check if email already exists
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check if username already exists
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    # Create user
    user = User(
        username=req.username,
        email=req.email,
        hashed_password=hash_password(req.password),
        full_name=req.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate token
    token = create_access_token(
        {"user_id": user.id, "username": user.username, "email": user.email}
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/signin", response_model=TokenResponse)
def signin(req: UserSigninRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(
        {"user_id": user.id, "username": user.username, "email": user.email}
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.put("/profile", response_model=UserResponse)
def update_profile(
    req: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)
