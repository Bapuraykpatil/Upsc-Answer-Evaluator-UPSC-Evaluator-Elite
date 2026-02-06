# backend/config.py

from __future__ import annotations

from functools import lru_cache
from typing import List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central app configuration.
    Reads from environment variables and optional `.env`.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- App ---
    PROJECT_NAME: str = "upsc_answer_evaluator"
    ENV: str = Field(default="dev", description="dev | staging | prod")
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # --- Security / JWT ---
    SECRET_KEY: str = "CHANGE_ME_IN_ENV"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # --- CORS ---
    # Example in .env:
    # CORS_ORIGINS=["http://localhost:5500","http://127.0.0.1:5500","http://192.168.0.105:5500"]
    CORS_ORIGINS: List[str] = Field(default_factory=lambda: ["*"])

    # --- Database ---
    # Prefer providing DATABASE_URL directly (SQLite for dev recommended)
    DATABASE_URL: Optional[str] = None

    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres"
    DB_NAME: str = "upsc_answer_evaluator"

    DB_ECHO: bool = False
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_RECYCLE: int = 1800

    # --- Redis / Queue ---
    REDIS_URL: str = "redis://localhost:6379/0"

    # --- Storage ---
    STORAGE_DIR: str = "storage"

    # --- OTP ---
    OTP_EXPIRE_MINUTES: int = 5
    OTP_RESEND_COOLDOWN_SECONDS: int = 60
    OTP_MAX_ATTEMPTS: int = 5
    OTP_DEBUG_ECHO: bool = False

    # --- SMTP (for real OTP email) ---
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "UPSC Evaluator <no-reply@example.com>"

    @property
    def sqlalchemy_database_uri(self) -> str:
        """
        Returns an ASYNC SQLAlchemy URL.
        If DATABASE_URL is provided, uses it.
        Else builds a default Postgres async URL.
        """
        if self.DATABASE_URL:
            return self.DATABASE_URL

        return (
            f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
