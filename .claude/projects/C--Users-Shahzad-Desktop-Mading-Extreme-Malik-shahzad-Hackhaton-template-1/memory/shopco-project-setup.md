---
name: shopco-project-setup
description: Complete SHOP.CO e-commerce full-stack project reference
metadata:
  type: project
  type: reference
---

# SHOP.CO — Full-Stack E-Commerce Marketplace

**Brand:** SHOP.CO — Clothing & Accessories Marketplace
**Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS — deployed on Vercel
**Backend:** FastAPI (Python 3.13) + SQLAlchemy — deployed on Railway (Docker)
**Database:** PostgreSQL (Neon/Railway) with SQLite fallback for local dev
**Auth:** JWT (pyjose + bcrypt) — localStorage token — Google OAuth integration
**Payments:** Stripe (PaymentElement + PaymentIntent)
**AI Chatbot:** Google Gemini embeddings → Qdrant Cloud vector search → SQL fallback → OpenRouter/Gemini LLM

## Quick Start
- Frontend: `npm run dev` (port 3000)
- Backend: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload` (port 8000)
- Admin login: email=admin@shop.co, password=admin123

## Key Env Files
- `backend/.env` — DATABASE_URL, GEMINI_API_KEY, QDRANT_URL, QDRANT_API_KEY, JWT_SECRET, OPENROUTER_API_KEY, STRIPE_SECRET_KEY
- `.env.local` — NEXT_PUBLIC_API_URL, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, NEXT_PUBLIC_GOOGLE_CLIENT_ID

## Project Structure
- `src/` — Next.js frontend (app router pages, components, lib, sanity integration)
- `backend/` — FastAPI backend (models, routers, schemas, auth, seed data)
- `scripts/` — Data import scripts, SERP API fetcher
- `public/` — Product images, card logos, homepage assets
- `Documentation/` — Business docs, technical docs, performance reports

## Core Features
- ~50 seed products across 10 categories (new_arrivals, t-shirts, shirts, pants, shorts, outerwear, hoodies, dresses, activewear, top_selling)
- AI chatbot with purchase automation (add to cart via chat)
- Stripe payment with custom premium UI
- Two-step checkout (shipping → payment)
- Admin dashboard with stats, CRUD for products/orders/users
- Notification system for order status updates
- Live search with debounced dropdown + search results page
- Cart syncs from localStorage (guests) to server (authenticated users)
- Promo code: DISCOUNT10 → $30 off
- Delivery fee: $15

## Backend API
- `/api/products` — Product listing with filters (category, search, price range, size, color, rating, pagination)
- `/api/cart` — Cart CRUD (requires auth)
- `/api/orders` — Order creation, listing, tracking
- `/api/chatbot` — AI chat (public, purchase requires auth)
- `/api/payments` — Stripe PaymentIntent + payment confirmation
- `/api/users` — Signup, signin, Google auth, profile
- `/api/admin` — Admin dashboard + management
- Full API docs: `backend/app/schemas.py` for all Pydantic models

## Deployment URLs
- Backend API: https://malik-shahzad-hackhaton-template-1-production.up.railway.app
- API Health: /api/health
- Sanity Studio: /studio

## Important Notes
- The `ai` package and Clerk are in package.json but auth uses custom JWT
- Images served from `/public/products/` (36 product images)
- Cart items have unique constraint on (user_id, product_id, size, color)
- Order statuses: pending → processing → shipped → delivered → cancelled
- RAG chatbot indexes products as vectors on startup (background thread)
- Read [[CLAUDE.md]] at project root for the full comprehensive reference

## Implemented Improvements (July 2026)
- **Wishlist:** Full backend (model, schemas, router) + frontend page + header link
- **Stock Management:** Stock validated & decremented on order; restored on cancellation
- **Password Reset:** Forgot/reset endpoints + frontend pages + link on signin
- **User Order Cancellation:** Cancel endpoint (pending/processing only) with stock restore + notification
- **Tax Calculation:** 8% tax added to orders (field in model/schemas)
- **CORS Security:** Restricted in production (PostgreSQL env), permissive in dev (SQLite)
- **Error Boundaries:** Custom 404 page + global error.tsx with retry
- **SEO Metadata:** generateMetadata for product detail pages
- **Image Optimization:** Removed `unoptimized` from all product Image components
- **Admin Analytics:** Monthly sales bar chart + top products list + stats dashboard
- **Promo Codes (DB-driven):** New PromoCode model, admin CRUD page, API validation, seed data
- **Cash on Delivery (COD):** New payment method option in checkout + backend endpoint
- **Notifications:** Added read-all + delete endpoints
- **Testing:** pytest test suite with 14+ tests (health, auth, products, cart, admin, promocodes)
