"""VibeKeeper backend configuration.

Uses pydantic-settings so values can be provided through environment variables or
an optional .env file at the project root. The singleton ``settings`` object is
imported by the rest of the backend modules to access configuration in a type-
safe way.
"""

from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env"""

    # ---------------------------------------------------------------------
    # General
    # ---------------------------------------------------------------------
    app_name: str = "VibeKeeper"
    debug: bool = False

    # ------------------------------------------------------------------
    # Database
    # ------------------------------------------------------------------
    database_url: str = "sqlite+aiosqlite:///occasions.db"

    # ------------------------------------------------------------------
    # AI / LiteLLM
    # ------------------------------------------------------------------
    litellm_api_key: str
    litellm_model: str = "gpt-4o-mini"

    # ------------------------------------------------------------------
    # Authentication / JWT
    # ------------------------------------------------------------------
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24

    # ------------------------------------------------------------------
    # OAuth placeholders (future work)
    # ------------------------------------------------------------------
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


# Cache the object so ``settings`` is created once per interpreter process.
@lru_cache(maxsize=1)
def _get_settings() -> Settings:  # pragma: no cover – trivial
    return Settings()  # type: ignore[arg-type]


settings: Settings = _get_settings()
