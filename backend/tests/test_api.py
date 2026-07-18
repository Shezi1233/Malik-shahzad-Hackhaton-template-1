"""Basic API tests for SHOP.CO backend."""
import os
import sys
import pytest
from fastapi.testclient import TestClient

# Add parent directory to path so we can import app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Set test environment variables before importing app
os.environ["DATABASE_URL"] = "sqlite:///./test_shopco.db"
os.environ["JWT_SECRET"] = "test-secret-key-for-testing"
os.environ["GEMINI_API_KEY"] = ""
os.environ["OPENROUTER_API_KEY"] = ""

from app.main import app
from app.database import Base, engine, SessionLocal
from app.models import Product, User, PromoCode
from app.auth import hash_password

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    """Create tables and seed test data before each test, clean up after."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # Create admin user
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        admin = User(
            username="admin",
            email="admin@test.com",
            hashed_password=hash_password("admin123"),
            is_admin=True,
        )
        db.add(admin)
        db.flush()

    # Create test user
    test_user = db.query(User).filter(User.username == "testuser").first()
    if not test_user:
        test_user = User(
            username="testuser",
            email="test@example.com",
            hashed_password=hash_password("testpass123"),
        )
        db.add(test_user)
        db.flush()

    # Create test products
    if db.query(Product).count() == 0:
        products = [
            Product(title="Test T-Shirt", slug="test-t-shirt", price=50, img_url="/test1.png", category="t-shirts"),
            Product(title="Test Jeans", slug="test-jeans", price=80, img_url="/test2.png", category="pants"),
        ]
        db.add_all(products)
        db.flush()

    # Create DISCOUNT10 promo code
    if not db.query(PromoCode).filter(PromoCode.code == "DISCOUNT10").first():
        db.add(PromoCode(code="DISCOUNT10", discount_amount=30, is_active=True, usage_limit=100))
        db.flush()

    db.commit()
    db.close()

    yield

    # Cleanup after test
    Base.metadata.drop_all(bind=engine)
    # Remove test database file
    db_path = os.path.join(os.path.dirname(__file__), "..", "test_shopco.db")
    if os.path.exists(db_path):
        os.remove(db_path)


def get_token():
    """Helper to get auth token for test user."""
    response = client.post("/api/users/signin", json={
        "email": "test@example.com",
        "password": "testpass123",
    })
    return response.json().get("access_token", "")


def get_admin_token():
    """Helper to get auth token for admin user."""
    response = client.post("/api/users/signin", json={
        "email": "admin@test.com",
        "password": "admin123",
    })
    return response.json().get("access_token", "")


class TestHealth:
    def test_health_endpoint(self):
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"


class TestAuth:
    def test_signup(self):
        response = client.post("/api/users/signup", json={
            "username": "newuser",
            "email": "new@example.com",
            "password": "newpass123",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "new@example.com"

    def test_signin_success(self):
        response = client.post("/api/users/signin", json={
            "email": "test@example.com",
            "password": "testpass123",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data

    def test_signin_invalid_password(self):
        response = client.post("/api/users/signin", json={
            "email": "test@example.com",
            "password": "wrongpassword",
        })
        assert response.status_code == 401

    def test_signup_duplicate_email(self):
        response = client.post("/api/users/signup", json={
            "username": "another",
            "email": "test@example.com",
            "password": "pass123",
        })
        assert response.status_code == 400


class TestProducts:
    def test_list_products(self):
        response = client.get("/api/products")
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        assert len(data["products"]) >= 2

    def test_get_product(self):
        response = client.get("/api/products/1")
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Test T-Shirt"

    def test_get_nonexistent_product(self):
        response = client.get("/api/products/9999")
        assert response.status_code == 404

    def test_search_products(self):
        response = client.get("/api/products/search?q=jeans")
        assert response.status_code == 200
        data = response.json()
        assert len(data["products"]) > 0
        assert "Jeans" in data["products"][0]["title"]


class TestCart:
    def test_add_to_cart(self):
        token = get_token()
        response = client.post(
            "/api/cart",
            json={"product_id": 1, "quantity": 2},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) > 0

    def test_add_to_cart_unauthorized(self):
        response = client.post(
            "/api/cart",
            json={"product_id": 1, "quantity": 1},
        )
        assert response.status_code == 401


class TestAdmin:
    def test_admin_dashboard(self):
        token = get_admin_token()
        response = client.get(
            "/api/admin/dashboard",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_products" in data
        assert "total_orders" in data

    def test_admin_dashboard_unauthorized(self):
        token = get_token()
        response = client.get(
            "/api/admin/dashboard",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 403


class TestPromoCodes:
    def test_validate_valid_code(self):
        response = client.post("/api/promocodes/validate", json={"code": "DISCOUNT10"})
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["discount_amount"] == 30

    def test_validate_invalid_code(self):
        response = client.post("/api/promocodes/validate", json={"code": "INVALID"})
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False
        assert data["discount_amount"] == 0

    def test_admin_create_promo_code(self):
        token = get_admin_token()
        response = client.post(
            "/api/promocodes",
            json={"code": "SUMMER50", "discount_amount": 50, "usage_limit": 10},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == "SUMMER50"
        assert data["discount_amount"] == 50
