# SHOP.CO — Full-Stack E-Commerce Marketplace

## Project Overview
A full-stack e-commerce platform for clothing and accessories with AI-powered chatbot, Stripe payments, admin dashboard, vector search (RAG) for product discovery, and Sanity CMS integration.

**Brand name:** SHOP.CO
**Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
**Backend:** FastAPI (Python) + SQLAlchemy + PostgreSQL/SQLite
**Deployment:** Frontend on Vercel, Backend on Railway

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router, Pages Router hybrid)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3.4 + `tailwindcss-animate`
- **State:** Redux Toolkit + React Context (Auth, Cart)
- **UI Libraries:** Radix UI primitives (accordion, dialog, dropdown, slider, etc.), Framer Motion, Lucide Icons, Embla Carousel
- **Payment:** Stripe (react-stripe-js, stripe-js)
- **AI SDK:** `ai` package + custom API integration via Vercel AI SDK
- **CMS:** Sanity (next-sanity, @sanity/vision)
- **Misc:** shadcn/ui style components, nprogress loading bar, sonner toasts, react-markdown + remark-gfm, styled-components, framer-motion

### Backend (Python FastAPI)
- **Server:** Uvicorn (ASGI)
- **Framework:** FastAPI
- **ORM:** SQLAlchemy 2.0 (DeclarativeBase)
- **Database:** PostgreSQL (Railway/Neon) with SQLite fallback for local dev
- **Auth:** JWT (python-jose) + bcrypt password hashing
- **AI/RAG:** Google Gemini (embeddings + generation), Qdrant Cloud (vector DB), OpenRouter (fallback LLM)
- **Payment:** Stripe SDK
- **Async HTTP:** httpx

### Infrastructure
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Railway (Docker-based)
- **Vector DB:** Qdrant Cloud
- **LLM APIs:** Google Gemini API, OpenRouter
- **Images:** Sanity CDN (cdn.sanity.io), local `/public/products/`
- **Auth Provider:** Clerk (listed in deps but Google OAuth + JWT used instead)

---

## Project Structure

```
/
├── src/                          # Next.js frontend
│   ├── app/                      # App Router pages
│   │   ├── page.tsx              # Home page (Hero, Products, Sell, Dress, Reviews, Chatbot)
│   │   ├── layout.tsx            # Root layout (AuthProvider, CartProvider, Header, Footer)
│   │   ├── globals.css           # Global styles (Tailwind + CSS vars)
│   │   ├── all-products/         # Product listing with filters
│   │   ├── products/[id]/        # Product detail page
│   │   ├── products/sell.tsx     # Top selling products
│   │   ├── cart/                 # Cart page
│   │   ├── checkout/             # Checkout with Stripe
│   │   ├── checkout/success/     # Payment success redirect
│   │   ├── signin/               # Sign in (email + Google)
│   │   ├── usersignup/           # User registration
│   │   ├── profile/              # User profile + order history
│   │   ├── admin/                # Admin dashboard
│   │   ├── admin/orders/         # Admin order management
│   │   ├── admin/products/       # Admin product management
│   │   ├── admin/users/          # Admin user management
│   │   ├── search/               # Search results page
│   │   ├── casual/               # On-sale / casual page
│   │   ├── ordertracking/        # Order tracking
│   │   └── studio/               # Sanity Studio embedded
│   ├── components/               # Shared components
│   │   ├── authContext.tsx        # Auth context (signup, signin, signout, token mgmt)
│   │   ├── cartContext.tsx        # Cart context (localStorage for guests, API for authed)
│   │   ├── chatbot.tsx           # Floating AI chatbot widget
│   │   ├── Header.tsx            # Nav header with search, cart badge, auth
│   │   ├── footer.tsx            # Footer
│   │   ├── Hero.tsx              # Homepage hero banner
│   │   ├── ProductCard.tsx       # Product card component
│   │   ├── StripeProvider.tsx    # Stripe Elements wrapper
│   │   ├── GoogleSignIn.tsx      # Google OAuth component
│   │   ├── PrivateRoute.tsx      # Auth guard
│   │   ├── AdminRoute.tsx        # Admin guard
│   │   ├── anouncement.tsx       # Top announcement bar
│   │   ├── notifications.tsx     # Notification bell + dropdown
│   │   ├── search.tsx            # Search component
│   │   ├── couresel.tsx          # Customer reviews carousel
│   │   ├── dress.tsx             # Browse by dress style section
│   │   ├── dressstyle.tsx        # Dress style grid
│   │   ├── products.tsx          # Product listing section (home page)
│   │   └── ui/                   # shadcn/ui components (~23 files)
│   ├── lib/                      # Utility libraries
│   │   ├── api.ts                # API client (fetch wrapper, auth headers, caching)
│   │   ├── cache.ts              # In-memory API cache with TTL
│   │   └── utils.ts              # cn() utility (clsx + tailwind-merge)
│   ├── sanity/                   # Sanity CMS integration
│   │   ├── env.ts                # Sanity env vars
│   │   ├── lib/client.ts         # Sanity client
│   │   ├── lib/image.ts          # Sanity image URL builder
│   │   ├── lib/live.ts           # Sanity live preview
│   │   └── schemaTypes/          # Sanity schemas (product.ts)
│   └── hooks/                    # Custom React hooks
├── backend/                      # FastAPI backend
│   ├── app/
│   │   ├── main.py               # FastAPI app, CORS, routers, startup seeding, RAG init
│   │   ├── config.py             # Settings (env-based, with debug logging)
│   │   ├── database.py           # SQLAlchemy engine, session, Base
│   │   ├── models.py             # ORM models (User, Product, CartItem, Order, OrderItem, Notification)
│   │   ├── schemas.py            # Pydantic schemas (request/response models)
│   │   ├── auth.py               # JWT auth (hash_password, verify_password, create_token, get_current_user)
│   │   ├── seed.py               # Database seeder (~50 products across 10 categories + admin user)
│   │   └── routers/
│   │       ├── users.py          # Signup, signin, Google auth, profile CRUD
│   │       ├── products.py       # Product listing with filters (price, size, color, search, pagination)
│   │       ├── cart.py           # Cart CRUD (add, update, remove, clear)
│   │       ├── orders.py         # Order creation, listing, tracking
│   │       ├── payments.py       # Stripe PaymentIntent + payment confirmation
│   │       ├── admin.py          # Admin dashboard, product/order/user management, image upload
│   │       ├── chatbot.py        # RAG chatbot (Gemini→Qdrant→SQL→OpenRouter pipeline)
│   │       └── notifications.py  # Notification system
│   ├── Dockerfile                # Python 3.13-slim Docker image
│   ├── requirements.txt          # Python deps
│   └── shopco.db                 # SQLite database (local dev)
├── scripts/
│   ├── importData.mjs            # Product data import script
│   └── serpapi_fetch.py          # SERP API data fetch
├── public/
│   ├── products/                 # 36 product images (product_1.png ... product_36.png)
│   ├── images/                   # Hero/homepage images
│   ├── cards/                    # Payment card logos
│   └── *                         # Misc images (detail, dress styles, footers)
├── Documentation/                # Project documentation
├── CLAUDE.md                     # THIS FILE - Project reference
├── DataTypes.ts                  # Shared data type definitions
├── next.config.mjs               # Next.js config (image remotePatterns for Sanity, Google, Railway)
├── tailwind.config.ts            # Tailwind config with CSS vars, animations
├── components.json               # shadcn/ui config
├── sanity.config.ts              # Sanity Studio config
├── sanity.cli.ts                 # Sanity CLI config
├── railway.json                  # Railway deploy config (Docker)
└── .env.local                    # Frontend environment variables
```

---

## API Routes (FastAPI Backend)

### Public (No Auth)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/debug/config` | Debug env vars |
| POST | `/api/users/signup` | Register new user |
| POST | `/api/users/signin` | Sign in (email/password) |
| POST | `/api/users/google-auth` | Google OAuth sign in/up |
| GET | `/api/products` | List products (with filters: search, category, price, size, color, rating, page) |
| GET | `/api/products/search` | Search products by query |
| GET | `/api/products/{id}` | Get single product |
| POST | `/api/reseed` | Reseed database |
| POST | `/api/seed-products` | Direct seed products |
| POST | `/api/chatbot` | Chat with AI (no auth required, but purchase needs token) |
| GET | `/api/chatbot/status` | Chatbot system status |
| POST | `/api/chatbot/reindex` | Reindex RAG vectors |
| POST | `/api/payments/create-payment-intent` | Create Stripe PaymentIntent |

### Auth Required
| Method | Path | Description |
|--------|------|-------------|
| GET/PUT | `/api/users/profile` | Get/update profile |
| GET/POST/PUT/DELETE | `/api/cart` | Cart CRUD |
| POST/GET | `/api/orders` | Create order, list orders |
| GET | `/api/orders/{id}` | Get order |
| GET | `/api/orders/{id}/track` | Track order (no auth) |
| POST | `/api/payments/confirm` | Confirm payment + create order |
| GET/PUT | `/api/notifications` | List/update notifications |

### Admin Required
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| CRUD | `/api/admin/products` | Product management |
| GET/PUT | `/api/admin/orders` | Order management |
| GET/DELETE | `/api/admin/users` | User management |
| POST | `/api/admin/upload-image` | Image upload |

---

## Key Frontend Pages & Components

| Page/Route | Component | Description |
|------------|-----------|-------------|
| `/` | `page.tsx` | Home page (Hero, Products, Top Sell, Dress Styles, Reviews, Chatbot) |
| `/all-products` | `page.tsx` | Filterable product listing (category, price, size, color, rating) |
| `/products/[id]` | `page.tsx` | Product detail (images, sizes, colors, add to cart) |
| `/cart` | `page.tsx` | Cart with order summary, promo code, proceed to checkout |
| `/checkout` | `page.tsx` | 2-step checkout (shipping → Stripe payment) |
| `/checkout/success` | `page.tsx` | Payment success confirmation |
| `/signin` | `page.tsx` | Sign-in with email + Google OAuth |
| `/usersignup` | `page.tsx` | User registration |
| `/profile` | `page.tsx` | Profile edit + order history |
| `/admin` | `page.tsx` | Admin dashboard (stats, recent orders) |
| `/admin/orders` | `page.tsx` | Manage orders |
| `/admin/products` | `page.tsx` | Manage products |
| `/admin/users` | `page.tsx` | Manage users |
| `/search` | `page.tsx` | Search results |
| `/casual` | `page.tsx` | On-sale/casual page |
| `/ordertracking` | `page.tsx` | Order tracking by ID |
| `/studio` | `page.tsx` | Sanity CMS embedded studio |

---

## Database Models (SQLAlchemy)

### User
- `id` (PK), `username` (unique), `email` (unique), `hashed_password`, `full_name`, `phone`, `address`, `city`, `postal_code`, `country`, `avatar_url`, `is_admin` (default false), `created_at`
- Relations: cart_items, orders, notifications

### Product
- `id` (PK), `title`, `slug` (unique), `description`, `price`, `old_price`, `category`, `img_url`, `img1`-`img3`, `rating` (default 4.5), `colors` (JSON string), `sizes` (JSON string), `stock`, `created_at`
- Relations: cart_items, order_items

### CartItem
- `id` (PK), `user_id` (FK), `product_id` (FK), `quantity`, `size`, `color`, `created_at`
- **UniqueConstraint:** (user_id, product_id, size, color)

### Order
- `id` (PK), `user_id` (FK), `status` (pending/processing/shipped/delivered/cancelled), `subtotal`, `discount`, `delivery_fee` (default $15), `total`, `shipping_name/email/address/city/postal_code/country`, `payment_method`, `stripe_payment_intent_id`, `payment_status`, `created_at`

### OrderItem
- `id` (PK), `order_id` (FK), `product_id` (FK), `title`, `price`, `quantity`, `size`, `color`

### Notification
- `id` (PK), `user_id` (FK), `title`, `message`, `is_read`, `created_at`

---

## Product Categories
The product catalog has ~50 products across these categories:
- `new_arrivals` (8 products)
- `t-shirts` (8)
- `shirts` (7)
- `pants` (7)
- `shorts` (5)
- `outerwear` (6)
- `hoodies` (5)
- `dresses` (5)
- `activewear` (5)
- `top_selling` (8)
- `you_might_also_like` (6)

---

## AI Chatbot System

### Architecture (Layered)
1. **Intent Detection** (regex-based, fast response): greeting, help, thanks, contact, discount, purchase
2. **Purchase Handler** (for "buy/add to cart" intent): auto-detects product, extracts size/color, adds to cart
3. **RAG Semantic Search** (Gemini embeddings → Qdrant Cloud): product similarity search
4. **SQL Fallback** (keyword search on title/description)
5. **LLM Response Generation**: OpenRouter (primary) → Gemini (fallback) → hardcoded fallback

### Key Files
- `backend/app/routers/chatbot.py` — All chatbot logic (~1000 lines)
- `src/components/chatbot.tsx` — Frontend chatbot widget with action buttons

### Purchase Flow
1. User says "buy X" / "add to cart"
2. Backend detects purchase intent → searches products (RAG → SQL)
3. Extracts size/color from message
4. Validates against available options
5. Adds to cart via DB
6. Returns action payload → frontend updates cart badge

---

## Auth System

### Flow
1. **Sign up:** POST `/api/users/signup` → returns JWT + user object
2. **Sign in:** POST `/api/users/signin` → returns JWT + user object
3. **Google OAuth:** POST `/api/users/google-auth` → accepts Google access_token → creates/finds user → returns JWT
4. **Token Storage:** `localStorage` (access_token, user)
5. **API Auth:** Bearer token in `Authorization` header (via `api.ts`)

### Auth Guards (Frontend)
- `PrivateRoute.tsx` — redirects to /signin if not authenticated
- `AdminRoute.tsx` — checks user.is_admin

### Cart Sync
- **Guests:** localStorage-based cart
- **Authenticated:** Server-side cart (SQLAlchemy)
- **On Login:** Local cart synced to server, then localStorage cleared

---

## Payment Flow (Stripe)

1. User fills shipping details → "Continue to Payment"
2. Frontend calls `/payments/create-payment-intent` → gets client_secret
3. Renders Stripe `PaymentElement` (via `StripeProvider.tsx`)
4. User submits → Stripe redirects to `/checkout/success`
5. After redirect, backend `/payments/confirm` is called to:
   - Verify PaymentIntent
   - Create Order + OrderItems from cart
   - Clear the cart
   - Return order confirmation

**Promo Code:** `DISCOUNT10` → $30 off

---

## Environment Variables (Frontend - .env.local)
```
NEXT_PUBLIC_API_URL=<Railway backend URL>/api
NEXT_PUBLIC_SANITY_PROJECT_ID=your-sanity-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<Google OAuth client ID>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<Stripe publishable key>
```

## Environment Variables (Backend)
- `DATABASE_URL` — PostgreSQL (Railway) or SQLite fallback
- `JWT_SECRET` — JWT signing key
- `GEMINI_API_KEY` — Google Gemini API key
- `QDRANT_URL` / `QDRANT_API_KEY` — Qdrant Cloud vector DB
- `OPENROUTER_API_KEY` — OpenRouter LLM fallback
- `STRIPE_SECRET_KEY` — Stripe secret key
- `GOOGLE_CLIENT_ID` — For Google OAuth token validation

---

## Key Features
- 🔍 **Live search** with debounced dropdown + results page
- 🤖 **AI chatbot** with RAG product discovery + purchase automation
- 🛒 **Cart** with localStorage sync for guests → server on login
- 💳 **Stripe payments** with custom UI and promo codes
- 👤 **Auth** with email/password + Google OAuth
- 🛡️ **Admin dashboard** with stats, product/order/user management
- 🔔 **Notifications** for order status changes
- 📱 **Responsive** mobile-first design with Tailwind
- ⚡ **Lazy loading** with Next.js dynamic imports + skeleton screens
- 🎨 **Sanity CMS** integration for content management
- 📦 **Docker** deployment on Railway

---

## Common Commands
```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Backend
cd backend && uvicorn app.main:app --reload  # Start FastAPI (port 8000)

# Import data
npm run import-product  # Run scripts/importData.mjs
```

## Deploy URLs
- **Frontend:** (Vercel)
- **Backend API:** `https://malik-shahzad-hackhaton-template-1-production.up.railway.app`
- **API Health:** `https://malik-shahzad-hackhaton-template-1-production.up.railway.app/api/health`
- **Sanity Studio:** `/studio`

## Railway Build
- Builder: Docker (backend/Dockerfile)
- Health check: `/api/health`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}`
