from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.user import AuthResponse, UserLogin, UserRegister


def get_user_by_id(db: Session, user_id: UUID) -> User | None:
    return db.get(User, user_id)


def get_user_by_username_and_role(db: Session, username: str, role: str) -> User | None:
    stmt = select(User).where(User.username == username, User.role == role)
    return db.scalars(stmt).first()


def register_user(db: Session, payload: UserRegister) -> AuthResponse:
    existing = get_user_by_username_and_role(db, payload.username, payload.role)
    if existing is not None:
        raise ValueError("Username is already registered for this role")

    user = User(
        username=payload.username,
        password_hash=hash_password(payload.password),
        role=payload.role,
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=str(payload.email) if payload.email else None,
        school=payload.school,
        year_level=payload.year_level,
        preferred_subject=payload.preferred_subject,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id, user.role.value)

    return AuthResponse(access_token=token, user=user)


def login_user(db: Session, payload: UserLogin) -> AuthResponse:
    user = get_user_by_username_and_role(db, payload.username, payload.role)
    if user is None:
        raise ValueError("Invalid username, password, or role")

    if not verify_password(payload.password, user.password_hash):
        raise ValueError("Invalid username, password, or role")

    token = create_access_token(user.id, user.role.value)

    return AuthResponse(access_token=token, user=user)


def list_users(db: Session, role: str | None = None) -> list[User]:
    stmt = select(User).order_by(User.created_at.desc())
    if role:
        stmt = stmt.where(User.role == role)
    return list(db.scalars(stmt).all())