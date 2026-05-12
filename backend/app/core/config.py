from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "NextGenius K-12 Backend"
    environment: str = "development"

    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/nextgenius_k12"

    media_root: str = "media"
    media_url: str = "/media"

    backend_cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:5173/k-12",
    ]
    
    secret_key: str = "change-this-in-development"
    access_token_expire_minutes: int = 1440
    algorithm: str = "HS256"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()