import os

from pydantic_settings import BaseSettings

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


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

    class Config:
        env_file = os.path.join(BACKEND_DIR, ".env")


settings = Settings()
