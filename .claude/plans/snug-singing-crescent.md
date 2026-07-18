# Implementation Plan: SHOP.CO Website Improvements

## Context
Full codebase review revealed ~15 missing features/improvements. User wants all needed fixes implemented. This plan covers the most impactful improvements across security, functionality, and user experience — scoped to be achievable while delivering maximum value.

---

## Phase 1: Critical Fixes (Security + Core Bugs)

### 1.1 Stock Management — Decrement on Order
**Files:** `backend/app/routers/orders.py`, `backend/app/routers/payments.py`, `backend/app/models.py`
- Add `stock` field to Product model (already exists)
- In `orders.py create_order()`: check each cart item product stock >= quantity, then decrement
- In `payments.py confirm_payment()`: same stock check + decrement
- Add `validate_stock()` helper to avoid duplication
- Return 400 error if insufficient stock

### 1.2 CORS Restrict in Production
**File:** `backend/app/main.py`
- Change `allow_origins=["*"]` to check environment
- If production: allow the actual Railway/Vercel domains
- If local dev: keep `["*"]`
- Use `settings.ENVIRONMENT` or env var check

### 1.3 Error Boundaries
**Files:** `src/app/not-found.tsx` (NEW), `src/app/error.tsx` (NEW)
- Create custom 404 page with SHOP.CO branding, helpful links
- Create global error boundary with retry capability
- These are Next.js App Router conventions

---

## Phase 2: Important Features

### 2.1 Wishlist Feature
**Backend:** `backend/app/models.py` (new WishlistItem model), `backend/app/routers/wishlist.py` (NEW)
- New table: wishlist_items (id, user_id FK, product_id FK, created_at)
- CRUD endpoints: GET /wishlist, POST /wishlist, DELETE /wishlist/{id}
- Register router in main.py

**Frontend:** 
- `src/app/wishlist/page.tsx` (NEW) — Wishlist page
- Heart icon toggle on `ProductCard.tsx` and product detail page
- Heart icon in Header with count badge
- Wishlist context or use API directly

### 2.2 SEO Metadata for Products
**File:** `src/app/products/[id]/page.tsx`
- Split into server component for metadata + client component for interactivity
- Add `generateMetadata` function that fetches product and returns title, description, open graph
- Pattern: server component wraps client component

### 2.3 Password Reset Flow
**Backend:** 
- `backend/app/routers/users.py` — Add POST `/users/forgot-password` (generates reset token)
- `backend/app/models.py` — Add `reset_token`, `reset_token_expiry` to User model
- POST `/users/reset-password` endpoint

**Frontend:**
- `src/app/forgot-password/page.tsx` (NEW) — Email input form
- `src/app/reset-password/page.tsx` (NEW) — New password form
- Link on signin page: "Forgot Password?"

### 2.4 User Order Cancellation
**Backend:** `backend/app/routers/orders.py`
- Add PUT `/orders/{order_id}/cancel` endpoint
- Only allow cancel if status is "pending" or "processing"
- Restore stock quantities on cancel
- Create notification

**Frontend:** `src/app/profile/page.tsx`
- Add "Cancel Order" button for pending/processing orders

### 2.5 Tax Calculation
**Backend:** `backend/app/models.py`, `backend/app/schemas.py`, `backend/app/routers/orders.py`, `backend/app/routers/payments.py`
- Add `tax_rate` (default 0.08 = 8%) and `tax_amount` to Order model
- Add tax field to schemas (OrderResponse, etc.)
- Calculate tax as subtotal * tax_rate
- Update total formula: `total = subtotal - discount + delivery_fee + tax_amount`

---

## Phase 3: Moderate Improvements

### 3.1 Image Optimization
**Files:** `src/components/ProductCard.tsx`, `src/app/products/[id]/page.tsx`, `src/app/checkout/page.tsx`, `src/components/Header.tsx`, `next.config.mjs`
- Remove `unoptimized` prop from Image components
- Add proper image remotePatterns to next.config.mjs
- Add `sizes` attribute for responsive images
- Add placeholder blur effect

### 3.2 Admin Analytics Enhancement
**Files:** `src/app/admin/page.tsx`, `backend/app/routers/admin.py`
- Backend: Add monthly revenue, popular products, order trend endpoints
- Frontend: Add simple charts (using SVG/recharts or inline charts)
- Add: monthly sales chart, top products list, order status distribution
- Loading/error/empty states for each chart

### 3.3 DB-Driven Promo Codes
**Backend:** `backend/app/models.py` (new PromoCode model), `backend/app/routers/admin.py`
- New table: promo_codes (id, code, discount_amount, is_active, usage_limit, used_count, expires_at)
- Admin CRUD endpoints for promo codes
- Update checkout logic to query DB instead of hardcoded check

**Frontend:** `src/app/admin/promocodes/page.tsx` (NEW)
- Admin page to manage promo codes (add, toggle active, delete)
- Link in admin sidebar

### 3.4 Cash on Delivery (COD) Payment
**Backend:** `backend/app/routers/payments.py`
- Add POST `/payments/cod-confirm` endpoint
- Creates order directly without Stripe, sets payment_method="cod"
- Creates notification

**Frontend:** `src/app/checkout/page.tsx`
- Add "Cash on Delivery" option alongside Stripe
- If COD selected: skip Stripe, call cod-confirm, show success

---

## Phase 4: Testing + Polish

### 4.1 Testing Setup
**Backend:** 
- `backend/tests/` directory
- `backend/requirements-test.txt` (pytest, httpx)
- `backend/tests/test_products.py` — Product listing tests
- `backend/tests/test_auth.py` — Signup/signin tests
- `backend/tests/test_cart.py` — Cart CRUD tests
- `backend/tests/test_orders.py` — Order flow tests

**Frontend:**
- Jest + React Testing Library setup
- Basic component smoke tests for critical pages

### 4.2 Notifications Enhancement
**File:** `backend/app/routers/notifications.py`
- Add PUT `/notifications/read-all` endpoint
- Add DELETE `/notifications/{id}` endpoint

---

## Implementation Order

| Step | Task | Est. Time | Priority |
|------|------|-----------|----------|
| 1.1 | Stock Management | 45 min | 🔴 Critical |
| 1.2 | CORS Restrict | 15 min | 🔴 Critical |
| 1.3 | Error Boundaries + 404 | 30 min | 🔴 Critical |
| 2.1 | Wishlist Feature | 2 hrs | 🟡 Important |
| 2.2 | SEO Metadata | 30 min | 🟡 Important |
| 2.3 | Password Reset | 1.5 hrs | 🟡 Important |
| 2.4 | User Order Cancel | 45 min | 🟡 Important |
| 2.5 | Tax Calculation | 30 min | 🟡 Important |
| 3.1 | Image Optimization | 30 min | 🟠 Moderate |
| 3.2 | Admin Analytics | 1 hr | 🟠 Moderate |
| 3.3 | Promo Codes DB | 1 hr | 🟠 Moderate |
| 3.4 | COD Payment | 1 hr | 🟠 Moderate |
| 4.1 | Testing Setup | 2 hrs | 🔵 Nice |
| 4.2 | Notifications | 20 min | 🔵 Nice |

**Total Estimated Time:** ~12-14 hours

---

## Verification
After each phase, verify:
1. **Backend:** Start uvicorn, test endpoints via browser/curl
2. **Frontend:** `npm run dev`, check all pages render without errors
3. **Flow tests:** Sign up → Browse → Add to cart → Checkout → Verify stock decremented
4. **Edge cases:** Empty states, error states, loading states for all new components
5. **SEO:** Check product page has proper meta tags in HTML head
6. **Wishlist:** Add/remove items, verify persistence across page reloads
7. **Password reset:** Full flow from forgot → email → reset → sign in
8. **COD:** Place order without Stripe, verify order created with correct status
