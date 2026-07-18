import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.config import settings
from app.database import get_db
from app.models import User
from app.schemas import (
    GoogleAuthRequest,
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


@router.post("/google-auth", response_model=TokenResponse)
def google_auth(req: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Authenticate (or create account) with a Google access token.
    Uses access_token to fetch user info from Google's userinfo endpoint.
    """
    import httpx

    # Fetch user info from Google using the access_token
    try:
        with httpx.Client(timeout=15) as client:
            resp = client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {req.access_token}"},
            )
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=401,
                    detail=f"Google token verification failed: {resp.text[:200]}",
                )
            google_data = resp.json()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Google verification failed: {e}")

    # Validate token audience (client ID) if configured
    if settings.GOOGLE_CLIENT_ID and google_data.get("aud") and google_data["aud"] != settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Token audience mismatch")

    email = google_data.get("email", "")
    google_sub = google_data.get("sub", "")
    google_name = google_data.get("name", "")

    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")

    # Find existing user by email, or create a new one
    user = db.query(User).filter(User.email == email).first()

    if not user:
        # Derive a username from the email
        base_username = email.split("@")[0]
        username = base_username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}{counter}"
            counter += 1

        user = User(
            username=username,
            email=email,
            hashed_password=hash_password(f"google_{google_sub}"),
            full_name=google_name or None,
            avatar_url=google_data.get("picture", None),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Generate JWT
    token = create_access_token({
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
    })

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
