from datetime import datetime

from app.auth import hash_password
from app.database import SessionLocal
from app.models import Notification, Product, User


def seed_database():
    db = SessionLocal()
    try:
        # Update existing products with correct image paths if already seeded
        existing_count = db.query(Product).count()
        if existing_count > 0:
            # Fix image paths in existing products
            products = db.query(Product).all()
            for p in products:
                old_img = p.img_url
                # Map missing files to existing ones
                if old_img in ["/product2.png", "/product3.png", "/product4.png"]:
                    p.img_url = "/product1.png"
                if "Frame" in (old_img or ""):
                    p.img_url = "/images/sell.png"
                if p.img1 in ["/product2.png", "/product3.png", "/product4.png"]:
                    p.img1 = "/detail1.png"
                if p.img2 in ["/product2.png", "/product3.png", "/product4.png"]:
                    p.img2 = "/detail2.png"
                if old_img != p.img_url or "Frame" in (old_img or ""):
                    p.img3 = p.img_url
            db.commit()
            print(f"Fixed image paths for {existing_count} existing products!")
            return

        admin = User(
            username="admin",
            email="admin@shop.co",
            hashed_password=hash_password("admin123"),
            is_admin=True,
            full_name="Admin",
        )
        db.add(admin)
        db.flush()

        products_data = [
            # New Arrivals
            Product(
                title="T-SHIRT WITH TAPE DETAILS",
                slug="t-shirt-with-tape-details",
                price=140,
                img_url="/product1.png",
                img1="/detail1.png",
                img2="/detail2.png",
                img3="/product1.png",
                description="A stylish t-shirt with unique tape detailing along the shoulders. Perfect for a casual day out.",
                category="new_arrivals",
                rating=4.5,
                colors='["#4F4631","#314F4A","#31344F"]',
                sizes='["S","M","L","XL"]',
            ),
            Product(
                title="SKINNY FIT JEANS",
                slug="skinny-fit-jeans",
                price=120,
                old_price=200,
                img_url="/product1.png",
                img1="/detail1.png",
                img2="/detail2.png",
                img3="/detail3.png",
                description="Slim-fit jeans with a flattering cut and comfortable stretch. A great pair to complement your casual wardrobe.",
                category="new_arrivals",
                rating=4.5,
                colors='["#314F4A","#31344F","#4F4631"]',
                sizes='["S","M","L","XL"]',
            ),
            Product(
                title="CHECKERED SHIRT",
                slug="checkered-shirt",
                price=120,
                img_url="/detail1.png",
                img1="/detail1.png",
                img2="/detail2.png",
                img3="/detail3.png",
                description="A trendy checkered shirt for a laid-back, yet stylish look. Made from soft fabric for all-day comfort.",
                category="new_arrivals",
                rating=4.5,
                colors='["#31344F","#4F4631","#314F4A"]',
                sizes='["S","M","L","XL"]',
            ),
            Product(
                title="SLEEVE STRIPED T-SHIRT",
                slug="sleeve-striped-t-shirt",
                price=120,
                old_price=200,
                img_url="/detail2.png",
                img1="/detail1.png",
                img2="/detail2.png",
                img3="/detail3.png",
                description="This striped t-shirt adds a sporty touch with its bold sleeve design. A versatile piece for any casual occasion.",
                category="new_arrivals",
                rating=4.5,
                colors='["#4F4631","#314F4A","#31344F"]',
                sizes='["S","M","L","XL"]',
            ),
            # Top Selling
            Product(
                title="VERTICAL STRIPED SHIRT",
                slug="vertical-striped-shirt",
                price=212,
                old_price=232,
                img_url="/images/sell.png",
                img1="/detail1.png",
                img2="/detail2.png",
                img3="/images/sell.png",
                description="A classic vertical striped shirt that pairs well with both jeans and dress pants. A stylish option for every season.",
                category="top_selling",
                rating=4.5,
                colors='["#4F4631","#314F4A","#31344F"]',
                sizes='["S","M","L","XL"]',
            ),
            Product(
                title="COURAGE GRAPHIC T-SHIRT",
                slug="courage-graphic-t-shirt",
                price=145,
                img_url="/images/sell2.png",
                img1="/detail1.png",
                img2="/detail2.png",
                img3="/images/sell2.png",
                description="A bold graphic tee featuring an inspiring 'Courage' message. Perfect for making a statement while staying comfortable.",
                category="top_selling",
                rating=4.5,
                colors='["#31344F","#4F4631","#314F4A"]',
                sizes='["S","M","L","XL"]',
            ),
            Product(
                title="LOOSE FIT BERMUDA SHORTS",
                slug="loose-fit-bermuda-shorts",
                price=80,
                img_url="/images/sell.png",
                img1="/detail1.png",
                img2="/detail2.png",
                img3="/detail3.png",
                description="Relaxed-fit bermuda shorts that are perfect for warm weather. A must-have for comfort during the summer months.",
                category="top_selling",
                rating=4.5,
                colors='["#314F4A","#31344F","#4F4631"]',
                sizes='["S","M","L","XL"]',
            ),
            Product(
                title="FADED SKINNY JEANS",
                slug="faded-skinny-jeans",
                price=210,
                img_url="/images/sell2.png",
                img1="/detail1.png",
                img2="/detail2.png",
                img3="/detail3.png",
                description="Skinny jeans with a trendy faded look, offering a sleek fit and ultimate comfort for daily wear.",
                category="top_selling",
                rating=4.5,
                colors='["#4F4631","#31344F","#314F4A"]',
                sizes='["S","M","L","XL"]',
            ),
            # You Might Also Like
            Product(
                title="Polo with Contrast Trims",
                slug="polo-with-contrast-trims",
                price=212,
                old_price=242,
                img_url="/images/sell.png",
                img1="/detail1.png",
                img2="/detail2.png",
                img3="/images/sell.png",
                description="A stylish polo shirt with contrast trims, perfect for both casual and semi-formal occasions.",
                category="you_might_also_like",
                rating=4.5,
                colors='["#4F4631","#314F4A","#31344F"]',
                sizes='["S","M","L","XL"]',
            ),
            Product(
                title="Gradient Graphic T-shirt",
                slug="gradient-graphic-t-shirt",
                price=145,
                img_url="/images/sell2.png",
                img1="/detail1.png",
                img2="/detail2.png",
                img3="/images/sell2.png",
                description="A modern graphic tee featuring a gradient design, adding a pop of color and creativity to your outfit.",
                category="you_might_also_like",
                rating=4.5,
                colors='["#31344F","#4F4631","#314F4A"]',
                sizes='["S","M","L","XL"]',
            ),
            Product(
                title="Polo with Tipping Details",
                slug="polo-with-tipping-details",
                price=180,
                img_url="/product1.png",
                img1="/detail1.png",
                img2="/detail2.png",
                img3="/product1.png",
                description="A polo shirt with tipping details along the collar and sleeves for a refined, sporty look.",
                category="you_might_also_like",
                rating=4.5,
                colors='["#4F4631","#31344F","#314F4A"]',
                sizes='["S","M","L","XL"]',
            ),
            Product(
                title="Black Striped T-shirt",
                slug="black-striped-t-shirt",
                price=120,
                old_price=150,
                img_url="/detail1.png",
                img1="/detail1.png",
                img2="/detail2.png",
                img3="/detail3.png",
                description="A sleek black striped t-shirt that adds a subtle edge to your casual look. Perfect for day-to-night wear.",
                category="you_might_also_like",
                rating=4.5,
                colors='["#314F4A","#4F4631","#31344F"]',
                sizes='["S","M","L","XL"]',
            ),
        ]

        db.add_all(products_data)
        db.flush()

        notifications = [
            Notification(
                user_id=admin.id,
                title="Welcome to SHOP.CO!",
                message="Welcome! Start exploring our latest collection and enjoy shopping.",
            ),
            Notification(
                user_id=admin.id,
                title="New Arrivals",
                message="Check out our newest collection - fresh styles just landed!",
            ),
            Notification(
                user_id=admin.id,
                title="Summer Sale",
                message="Enjoy up to 40% off on selected items. Limited time offer!",
            ),
        ]
        db.add_all(notifications)
        db.commit()
        print("Database seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()
