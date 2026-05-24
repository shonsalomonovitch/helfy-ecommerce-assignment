# Verification Guide

Step-by-step verification guide for the Helfy E-Commerce Platform.

For the detailed backend verification checklist, see `server/docs/backend-verification.md`.
For the detailed frontend verification checklist, see `client/docs/frontend-verification.md`.

---

## Prerequisites

- Node.js v16 or higher
- MySQL v8 or higher, running locally
- npm

---

## Backend Verification

### 1. Setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` and set your actual `DB_PASSWORD` and a strong `JWT_SECRET`.

### 2. Start MySQL

```bash
# macOS with Homebrew
brew services start mysql

# Or verify it is running
mysql -u root -p -e "SELECT 1"
```

### 3. Initialize Database

```bash
npm run db:init
```

Expected: Creates `helfy_ecommerce` database, 5 tables, seeds 12 products.

### 4. Build TypeScript

```bash
npm run build
```

Expected: Completes with zero errors. `dist/` directory is created.

### 5. Start Dev Server

```bash
npm run dev
```

Expected: Server starts on `http://localhost:4000`. Database connects on startup.

### 6. Backend Smoke Tests

```bash
# Health check
curl http://localhost:4000/api/health
# Expected: {"status":"ok","message":"Server is running"}

# Signup
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
# Expected: { token, user: { id, name, email } }

# Products (no auth required)
curl http://localhost:4000/api/products
# Expected: { products: [...] } with 12 items

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
# Expected: { token, user }

# Save token and test protected routes
TOKEN="<token from login>"

curl http://localhost:4000/api/cart \
  -H "Authorization: Bearer $TOKEN"
# Expected: { cart: { items: [], total: 0 } }

curl -X POST http://localhost:4000/api/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"quantity":2}'
# Expected: { message, cart: { items: [...], total: ... } }

curl -X POST http://localhost:4000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shipping_name":"Test User","shipping_address":"123 Main St","shipping_city":"New York","shipping_country":"USA"}'
# Expected: { message, order: { id, total_amount, status, ... } }

curl http://localhost:4000/api/orders \
  -H "Authorization: Bearer $TOKEN"
# Expected: { orders: [{ id, items: [...], ... }] }
```

### Backend Verification Status

| Check | Status |
|---|---|
| `npm run build` — zero TypeScript errors | Verified |
| `npm run dev` — server starts on port 4000 | Verified |
| `npm run db:init` — creates tables and seeds data | Verified |
| Health check returns 200 | Verified |
| Signup returns token and user | Verified |
| Login returns token and user | Verified |
| Duplicate email returns 409 | Verified |
| Invalid credentials return 401 | Verified |
| GET /api/auth/me with token returns user | Verified |
| GET /api/auth/me without token returns 401 | Verified |
| GET /api/products returns 12 products | Verified |
| Category, search, price filters work | Verified |
| GET /api/products/99999 returns 404 | Verified |
| Cart add/update/remove work | Verified |
| Cart totals computed server-side | Verified |
| Checkout creates order, clears cart | Verified |
| Order history returns nested items | Verified |
| password_hash never appears in responses | Verified |
| Cart/orders filter by authenticated user only | Verified |
| `npm start` (production build) | Pending final manual run |
| Transaction rollback on mid-checkout failure | Pending deliberate failure injection |
| JWT expiry after JWT_EXPIRES_IN | Pending token expiry wait |

---

## Frontend Verification

### 1. Setup

```bash
cd client
npm install
cp .env.example .env.local
```

`.env.local` must contain:
```
VITE_API_URL=http://localhost:4000
```

### 2. Build

```bash
npm run build
```

Expected: Completes with zero TypeScript errors.

### 3. Start Dev Server

```bash
npm run dev
```

Expected: Client starts at `http://localhost:5173`.

### 4. Manual Frontend Verification

| Action | Expected |
|---|---|
| Visit `http://localhost:5173` | Hero + product grid loads |
| Search/filter products | Grid updates correctly |
| Click "View Details" | Product detail page loads |
| Visit `/signup` | Signup form renders |
| Sign up with valid data | Redirected to home, Navbar shows name |
| Visit `/login` | Login form renders |
| Login with valid credentials | Redirected to home |
| Visit `/cart` while logged out | Redirected to `/login` |
| Add product to cart | Badge updates in Navbar |
| Open cart page | Items show with quantity controls |
| Update quantity | Subtotal and total update |
| Remove item | Item disappears |
| Proceed to checkout | Step 1 (Shipping) renders |
| Fill shipping, continue | Step 2 (Review) shows cart and shipping |
| Place order | Step 3 (Confirmation) shows order ID |
| Visit `/orders` | Order appears with line items |
| Visit `/account` | User name, email, initials avatar |
| Logout | Navbar switches to Login + Sign Up |
| Refresh with valid token | User stays logged in |

### Frontend Verification Status

| Check | Status |
|---|---|
| `npm run build` — zero TypeScript errors | Verified |
| `npm run dev` — client starts at port 5173 | Verified |
| Product catalog loads from backend | Verified |
| Filters (search, category, price) work | Verified |
| Signup and login work end-to-end | Verified |
| Protected routes redirect when unauthenticated | Verified |
| Cart add/update/remove work | Verified |
| Navbar badge updates live | Verified |
| Checkout 3-step flow works | Verified |
| Order confirmation shows order ID | Verified |
| Order history shows orders with items | Verified |
| Account page shows user info | Verified |
| Logout clears state and badge | Verified |
| Responsive layout on mobile/tablet/desktop | Verified |
| No console errors during normal flows | Pending final manual run |

---

## End-to-End Happy Path

Run with both servers running:

1. Open `http://localhost:5173`
2. Sign up as a new user
3. Browse products — try search and category filters
4. Open a product detail page, click "Add to Cart"
5. Open cart — verify item appears with correct price
6. Proceed to checkout — fill shipping form
7. Review step — verify items and total match cart
8. Place order — confirmation appears with order ID
9. Navigate to `/orders` — order appears with line items
10. Navigate to `/account` — user info displayed
11. Logout — Navbar switches to Login + Sign Up

---

## Known Limitations

- No real payment processing — orders are created with `status: "pending"` only
- JWT stored in `localStorage` (not httpOnly cookies)
- No refresh token flow — users must re-login after JWT expires (default: 7 days)
- No product pagination — all products load at once
- No stock validation at checkout — stock displayed but not enforced
- No automated test suite — manual verification only
- No admin panel — products managed via SQL seed only
- No rate limiting on API endpoints
- No email notifications for orders
