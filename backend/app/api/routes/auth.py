from uuid import UUID
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.core.security import decode_access_token
from app.db.session import get_db
from app.schemas.user import AuthResponse, UserLogin, UserRegister, MeResponse
from app.services.auth_service import get_user_by_id, login_user, register_user

router = APIRouter(prefix="/auth", tags=["auth"])


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization.split(" ", 1)[1]

    try:
        payload = decode_access_token(token)
        user_id = UUID(payload["sub"])
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc

    user = get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user


@router.post("/register", response_model=AuthResponse)
def register_endpoint(payload: UserRegister, db: Session = Depends(get_db)):
    try:
        return register_user(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/login", response_model=AuthResponse)
def login_endpoint(payload: UserLogin, db: Session = Depends(get_db)):
    try:
        return login_user(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


@router.get("/me", response_model=MeResponse)
def me_endpoint(current_user=Depends(get_current_user)):
    return {"user": current_user}