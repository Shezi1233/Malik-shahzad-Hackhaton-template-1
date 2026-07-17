# Plan: Fully Automated Chatbot — Add to Cart & Purchase

## Context
The chatbot currently only recommends products via text. Users have to manually copy the product name, go to the product page, select size/color, and add to cart. This creates friction. The goal is to make the chatbot **fully actionable**: when a user says "buy this", "add to cart", or "I want the black t-shirt in medium", the chatbot should automatically add the product to their cart — no manual steps needed.

## Requirements
1. User says: "buy this", "add to cart", "I'll take it", "order the blue jeans in large" → chatbot adds product to cart
2. Works with conversation context (if bot just recommended something and user says "buy it")
3. Shows confirmation with product details and cart link
4. Frontend chatbot UI updates to show action buttons (View Cart)
5. Refresh the cart badge in the header after adding items

## Changes

### 1. Backend: `backend/app/routers/chatbot.py`

#### a) Update schemas
```python
class ChatRequest(BaseModel):
    message: str
    access_token: Optional[str] = None
    history: Optional[List[dict]] = None  # past messages for context

class ChatResponse(BaseModel):
    reply: str
    action: Optional[dict] = None  # {type: "add_to_cart", title, product_id, cart_url}
```

#### b) Add purchase processing function
- `get_user_from_token(token, db)` — decode JWT, return User or None
- `extract_size_from_msg(msg)` — regex for size keywords (S/M/L/XL/small/medium/large)
- `extract_color_from_msg(msg)` — regex for color names
- `handle_purchase(msg, token, history, db)` → returns `(product_title, size, color, error)` or `None`
  - Search RAG/SQL for the product
  - Extract size/color from user message
  - If product found and user authenticated: add to `CartItem` table directly
  - Handle existing cart items (increment quantity if same product+size+color)

#### c) New purchase intent patterns
```python
"purchase": r'(buy|purchase|order|get\s+(me|this|that)|add\s+(to|in)\s+cart|i\'?ll\s+take|checkout|place\s+order)'
```

#### d) Update the chat endpoint logic
1. After RAG pipeline generates response, check if user intent is "purchase"
2. If purchase intent + access_token provided:
   - Process the purchase
   - Append confirmation to bot's reply (e.g., "✅ Added Nike T-Shirt (Size: M) to your cart!")
   - Return action data so frontend can show buttons
3. If purchase intent but no token → reply: "Please sign in first to make a purchase"

#### e) Update system prompt
Add instructions about purchase capability:
- LLM should ask for size/color if not specified
- LLM should confirm before purchasing
- The bot can say "I've added it to your cart!" or "Which size would you like?"

### 2. Frontend: `src/components/chatbot.tsx`

#### a) Import useAuth and useCart
- Get `user`, get token from localStorage  
- Get `refetchCart` or a way to trigger cart refresh

#### b) Pass auth token and history with requests
- Read token from localStorage
- Pass last 6 messages as history for context
- `api.post("/chatbot", { message, access_token: token, history })`

#### c) Handle action response
- If `data.action` exists with `type: "add_to_cart"`:
  - Show bot message with confirmation
  - Below the message, show action buttons:
    - "🛒 View Cart" (link to /cart)
    - "Continue Shopping" (link to /all-products)
  - Refresh the cart context so header badge updates

#### d) Enhanced UI
- Style action buttons cleanly in the chat bubble
- Show product info when available
- After successful add-to-cart, the button in header should update

### 3. Frontend: `src/app/checkout/page.tsx` (minor)
- No change needed — the checkout flow already works independently

### 4. Frontend: `src/components/cartContext.tsx` (minor)
- No change needed — the cart context already auto-fetches from API on user change
- After chatbot adds item, next time cart context re-renders it will pick up new items
- But we should expose a `refreshCart` function or the badge will be stale

Actually, let me check: the cart context fetches on mount and on user change. If the chatbot adds an item via backend API, the frontend cart context won't know until it re-fetches. So I need to:

#### Option A: Expose a `fetchCart` from cartContext
Add a `reloadCart` function to the context that re-fetches from API. Chatbot calls it after successful add.

#### Option B: Use `invalidateCache("/cart")` and re-fetch
Simpler — just invalidate cache and the next GET will be fresh.

I'll go with Option A — expose a `reloadCart` function.

## Files to Modify

| File | Changes |
|------|---------|
| `backend/app/routers/chatbot.py` | Add purchase intent, token auth, cart integration, new schemas |
| `src/components/chatbot.tsx` | Pass token/history, handle actions, show buttons, refresh cart |
| `src/components/cartContext.tsx` | Expose `reloadCart` / `fetchCart` function |

## What Won't Change
- No changes to cart router, auth, or models
- No new database tables
- No new API endpoints (just enhanced chatbot endpoint)
- Checkout page stays the same
- Existing chatbot features continue working

## Flow Diagram

```
User: "Add the black t-shirt in medium to my cart"
                      │
                      ▼
Frontend sends: { message, access_token, history }
                      │
                      ▼
Backend receives:
  1. Detect "purchase" intent
  2. Verify access_token → get user
  3. Search RAG for "black t-shirt" → find product
  4. Extract "medium" → size = "M", "black" → color
  5. Add CartItem(user_id, product_id, qty=1, size="M", color="Black")
  6. Return: { reply: "✅ Added...", action: {type: "add_to_cart", ...} }
                      │
                      ▼
Frontend shows:
  - Bot message: "✅ Added Classic Black T-Shirt (Size: M) to your cart!"
  - Buttons: [🛒 View Cart] [Continue Shopping]
  - Cart badge updates → shows +1
```

## Verification

1. Start backend: `cd backend && uvicorn app.main:app --reload`
2. Start frontend: `npm run dev`
3. Sign in with an account that has products in the database
4. Open chatbot and test:
   - "Show me t-shirts" → bot recommends t-shirts
   - "Add the first one to my cart" → should add to cart
   - "Buy the black shirt in medium" → should add with size/color
   - "I'll take it" (after a recommendation) → should add the recommended product
   - Without signing in → should prompt to sign in
5. Verify cart badge updates in header
6. Verify `/cart` page shows the new items
