from datetime import datetime
from typing import Literal
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


UserRoleLiteral = Literal["student", "tutor", "admin"]


class UserRegister(BaseModel):
    username: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6)
    role: UserRoleLiteral

    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None

    school: str | None = None
    year_level: str | None = None
    preferred_subject: str | None = None


class UserLogin(BaseModel):
    username: str
    password: str
    role: UserRoleLiteral


class UserRead(BaseModel):
    id: UUID
    username: str
    role: UserRoleLiteral

    first_name: str | None
    last_name: str | None
    email: str | None

    school: str | None
    year_level: str | None
    preferred_subject: str | None

    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class UserListResponse(BaseModel):
    users: list[UserRead]


class MeResponse(BaseModel):
    user: UserRead