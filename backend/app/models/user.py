import enum
import uuid
from datetime import datetime
from sqlalchemy import DateTime, Enum, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class UserRole(str, enum.Enum):
    student = "student"
    tutor = "tutor"
    admin = "admin"


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("username", "role", name="uq_users_username_role"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    username: Mapped[str] = mapped_column(String(100), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False)

    first_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    school: Mapped[str | None] = mapped_column(String(255), nullable=True)
    year_level: Mapped[str | None] = mapped_column(String(50), nullable=True)
    preferred_subject: Mapped[str | None] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )