import os

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Only use .env file if it exists (it won't exist in Railway/Docker)
_env_file = os.path.join(BACKEND_DIR, ".env")
if not os.path.exists(_env_file):
    _env_file = None


class Settings(BaseSettings):
    # Database - defaults to SQLite for local dev, but use .env for PostgreSQL
    DATABASE_URL: str = f"sqlite:///{os.path.join(BACKEND_DIR, 'shopco.db')}"

    # JWT Auth
    JWT_SECRET: str = "shopco-super-secret-key"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24

    # Google Gemini AI
    GEMINI_API_KEY: str = ""

    # Qdrant Vector DB (Cloud or local)
    QDRANT_URL: str = ""
    QDRANT_API_KEY: str = ""

    # OpenRouter (Fallback LLM)
    OPENROUTER_API_KEY: str = ""

    # Better Auth Secret
    BETTER_AUTH_SECRET: str = ""

    model_config = SettingsConfigDict(
        env_file=_env_file,
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

# Debug: log which env source is being used
if _env_file:
    print(f"⚙️  Loaded settings from .env file: {_env_file}")
else:
    print(f"⚙️  No .env file found — using OS environment variables only")

# Always log the DB URL being used (without exposing full connection string)
db_url_preview = settings.DATABASE_URL
if "://" in db_url_preview:
    db_url_preview = db_url_preview.split("@")[-1] if "@" in db_url_preview else db_url_preview.split("://")[1]
print(f"   DATABASE_URL: {settings.DATABASE_URL[:50]}...")
print(f"   GEMINI_API_KEY: {'✅ Set' if settings.GEMINI_API_KEY else '❌ Not set'}")
print(f"   QDRANT_URL: {'✅ Set' if settings.QDRANT_URL else '❌ Not set'}")
print(f"   QDRANT_API_KEY: {'✅ Set' if settings.QDRANT_API_KEY else '❌ Not set'}")
print(f"   JWT_SECRET: {'✅ Set' if settings.JWT_SECRET else '❌ Not set'}")
print(f"   OPENROUTER_API_KEY: {'✅ Set' if settings.OPENROUTER_API_KEY else '❌ Not set'}")
