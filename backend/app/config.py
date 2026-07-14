import os

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Settings(BaseSettings):
    # Database - defaults to SQLite for local dev, but use DATABASE_URL env for PostgreSQL
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

    model_config = SettingsConfigDict(extra="ignore")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # ── Safety net: if pydantic-settings misses any OS env var, grab it ──
        for field_name in self.model_fields:
            env_val = os.environ.get(field_name)
            if env_val is not None and env_val != str(getattr(self, field_name, "")):
                object.__setattr__(self, field_name, env_val)


def _load_settings() -> Settings:
    # ── 1. Try .env file (local dev) ──
    env_path = os.path.join(BACKEND_DIR, ".env")
    if os.path.exists(env_path):
        print(f"⚙️  Loading .env file: {env_path}")
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    key = key.strip()
                    value = value.strip()
                    # Only set if NOT already in OS env (OS env takes priority)
                    if key not in os.environ:
                        os.environ[key] = value

    # ── 2. Load settings (pydantic reads from os.environ) ──
    s = Settings()

    # ── 3. Debug logging ──
    db = s.DATABASE_URL or ""
    print(f"⚙️  DATABASE_URL: {'✅ PostgreSQL' if 'postgresql' in db else '❌ SQLite'}")
    print(f"   GEMINI_API_KEY:    {'✅ Set' if s.GEMINI_API_KEY else '❌ Not set'}")
    print(f"   QDRANT_URL:        {'✅ Set' if s.QDRANT_URL else '❌ Not set'}")
    print(f"   QDRANT_API_KEY:    {'✅ Set' if s.QDRANT_API_KEY else '❌ Not set'}")
    print(f"   JWT_SECRET:        {'✅ Set' if s.JWT_SECRET else '❌ Not set'}")
    print(f"   OPENROUTER_KEY:    {'✅ Set' if s.OPENROUTER_API_KEY else '❌ Not set'}")

    return s


settings = _load_settings()
