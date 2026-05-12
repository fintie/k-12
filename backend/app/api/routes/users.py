from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import UserListResponse, UserRead
from app.services.auth_service import get_user_by_id, list_users

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=UserListResponse)
def list_users_endpoint(
    role: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return {"users": list_users(db, role=role)}


@router.get("/{user_id}", response_model=UserRead)
def get_user_endpoint(user_id: UUID, db: Session = Depends(get_db)):
    user = get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user