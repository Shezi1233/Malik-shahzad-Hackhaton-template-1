import os

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ── Hard dump: directly read from OS env BEFORE pydantic touches anything ──
_raw_db = os.environ.get("DATABASE_URL", "")
_raw_qdrant_url = os.environ.get("QDRANT_URL", "")
_raw_qdrant_key = os.environ.get("QDRANT_API_KEY", "")
_raw_gemini = os.environ.get("GEMINI_API_KEY", "")
_raw_jwt = os.environ.get("JWT_SECRET", "")
_raw_openrouter = os.environ.get("OPENROUTER_API_KEY", "")
_raw_bauth = os.environ.get("BETTER_AUTH_SECRET", "")
_raw_google = os.environ.get("GOOGLE_CLIENT_ID", "")

print("=" * 60)
print("🔍 RAW os.environ READ (before pydantic):")
print(f"   DATABASE_URL:       {'✅ FOUND' if _raw_db else '❌ NOT FOUND'} (len={len(_raw_db)})")
print(f"   QDRANT_URL:         {'✅ FOUND' if _raw_qdrant_url else '❌ NOT FOUND'} (len={len(_raw_qdrant_url)})")
print(f"   QDRANT_API_KEY:     {'✅ FOUND' if _raw_qdrant_key else '❌ NOT FOUND'} (len={len(_raw_qdrant_key)})")
print(f"   GEMINI_API_KEY:     {'✅ FOUND' if _raw_gemini else '❌ NOT FOUND'} (len={len(_raw_gemini)})")
print(f"   JWT_SECRET:         {'✅ FOUND' if _raw_jwt else '❌ NOT FOUND'} (len={len(_raw_jwt)})")
print(f"   OPENROUTER_API_KEY: {'✅ FOUND' if _raw_openrouter else '❌ NOT FOUND'} (len={len(_raw_openrouter)})")
print(f"   GOOGLE_CLIENT_ID:   {'✅ FOUND' if _raw_google else '❌ NOT FOUND'} (len={len(_raw_google)})")

# Show all env var names (no values!) to debug
print(f"\n📋 ALL env var names ({len(os.environ)} total):")
for k in sorted(os.environ.keys()):
    if k.startswith(("DATABASE", "QDRANT", "GEMINI", "JWT", "OPENROUTER", "BETTER_", "GOOGLE", "RAILWAY", "PORT")):
        print(f"   {k}")
print("=" * 60)


class Settings(BaseSettings):
    DATABASE_URL: str = f"sqlite:///{os.path.join(BACKEND_DIR, 'shopco.db')}"
    JWT_SECRET: str = "shopco-super-secret-key"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    GEMINI_API_KEY: str = ""
    QDRANT_URL: str = ""
    QDRANT_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    BETTER_AUTH_SECRET: str = ""
    GOOGLE_CLIENT_ID: str = ""
    STRIPE_SECRET_KEY: str = ""

    model_config = SettingsConfigDict(extra="ignore")


def _load_settings() -> Settings:
    # ── 1. Try .env file (local dev only) ──
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
                    if key not in os.environ:
                        os.environ[key] = value

    # ── 2. Load with pydantic ──
    s = Settings()

    # ── 3. EXPLICIT OVERRIDE: directly from os.environ ──
    # This ensures Railway env vars ALWAYS win, even if pydantic misses them
    direct_overrides = {
        "DATABASE_URL": os.environ.get("DATABASE_URL"),
        "QDRANT_URL": os.environ.get("QDRANT_URL"),
        "QDRANT_API_KEY": os.environ.get("QDRANT_API_KEY"),
        "GEMINI_API_KEY": os.environ.get("GEMINI_API_KEY"),
        "JWT_SECRET": os.environ.get("JWT_SECRET"),
        "OPENROUTER_API_KEY": os.environ.get("OPENROUTER_API_KEY"),
        "BETTER_AUTH_SECRET": os.environ.get("BETTER_AUTH_SECRET"),
        "GOOGLE_CLIENT_ID": os.environ.get("GOOGLE_CLIENT_ID"),
        "STRIPE_SECRET_KEY": os.environ.get("STRIPE_SECRET_KEY"),
    }

    for field_name, env_val in direct_overrides.items():
        if env_val is not None and env_val.strip():
            object.__setattr__(s, field_name, env_val.strip())
            print(f"✅ Direct override: {field_name} set from os.environ")

    # ── 4. Debug logging ──
    db = s.DATABASE_URL or ""
    pg = "postgresql" in db or "postgres" in db
    print(f"⚙️  DATABASE_URL: {'✅ PostgreSQL' if pg else '❌ SQLite'} ({db[:60]}...)")
    print(f"   GEMINI_API_KEY:    {'✅ Set' if s.GEMINI_API_KEY else '❌ Not set'}")
    print(f"   QDRANT_URL:        {'✅ Set' if s.QDRANT_URL else '❌ Not set'}")
    print(f"   QDRANT_API_KEY:    {'✅ Set' if s.QDRANT_API_KEY else '❌ Not set'}")
    print(f"   JWT_SECRET:        {'✅ Set' if s.JWT_SECRET else '❌ Not set'}")
    print(f"   OPENROUTER_KEY:    {'✅ Set' if s.OPENROUTER_API_KEY else '❌ Not set'}")
    print(f"   GOOGLE_CLIENT_ID:  {'✅ Set' if s.GOOGLE_CLIENT_ID else '❌ Not set'}")

    return s


settings = _load_settings()
