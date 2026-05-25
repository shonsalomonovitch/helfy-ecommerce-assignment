# Helfy E-Commerce — React Client

The frontend for the Helfy e-commerce platform. Built with React, TypeScript, Vite, and Tailwind CSS.

## Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js v16 or higher
- The backend server running on `http://localhost:4000` (see `server/README.md`)

### Installation

```bash
cd client
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
```

`.env.local` is gitignored. Edit it if your backend runs on a different port or host.

### Running the Development Server

```bash
npm run dev
```

The client will start at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:4000` |

All environment variables must be prefixed with `VITE_` to be accessible in the browser. Never put secrets in these variables.

## Implemented Features

| Feature | Route | Auth |
|---|---|---|
| Product catalog with search, category, price filters | `/` | Public |
| Product detail page | `/products/:id` | Public |
| User signup | `/signup` | Public |
| User login | `/login` | Public |
| Shopping cart — add, update quantity, remove | `/cart` | Required |
| 3-step checkout — shipping, review, confirmation | `/checkout` | Required |
| Account profile | `/account` | Required |
| Order history with nested items | `/orders` | Required |

## Known Limitations

- **No payment processing** — orders are created with `status: "pending"` only; no Stripe/PayPal integration
- **JWT in localStorage** — the token is stored in `localStorage`. Production apps should use `httpOnly` cookies to prevent XSS access
- **No refresh tokens** — when the 7-day JWT expires, the user must log in again
- **No product pagination** — all products load at once; will be slow with large catalogs
- **No inventory check at checkout** — stock is displayed but not validated server-side during the order creation flow
- **No order status updates** — orders stay `pending`; no admin UI exists to change status
- **Add-to-cart from card uses React Router navigation** — if the user is not authenticated, clicking the cart icon redirects to `/login` without preserving the intended product URL in location.state

## Project Structure

```
client/
├── src/
│   ├── main.tsx                    # React entry point
│   ├── App.tsx                     # Root component with routing
│   ├── index.css                   # Global styles (Tailwind)
│   ├── components/
│   │   └── layout/
│   │       ├── Navbar.tsx          # Top navigation bar
│   │       ├── Footer.tsx          # Page footer
│   │       └── PageContainer.tsx   # Consistent page wrapper
│   └── pages/
│       ├── HomePage.tsx            # / — Hero + product catalog
│       ├── ProductDetailsPage.tsx  # /products/:id
│       ├── CartPage.tsx            # /cart
│       ├── CheckoutPage.tsx        # /checkout
│       ├── LoginPage.tsx           # /login
│       ├── SignupPage.tsx          # /signup
│       ├── AccountPage.tsx         # /account
│       ├── OrdersPage.tsx          # /orders
│       └── NotFoundPage.tsx        # * (404)
├── .env.example                    # Environment variable template
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Routes

| Path | Page | Auth Required |
|---|---|---|
| `/` | HomePage | No |
| `/products/:id` | ProductDetailsPage | No |
| `/cart` | CartPage | Yes ✅ |
| `/checkout` | CheckoutPage | Yes ✅ |
| `/login` | LoginPage | No |
| `/signup` | SignupPage | No |
| `/account` | AccountPage | Yes ✅ |
| `/orders` | OrdersPage | Yes ✅ |
| `*` | NotFoundPage | No |

## API Layer

All HTTP requests go through `src/api/apiClient.ts`, which is a single Axios instance. This is the only place the base URL is set.

### How it works

```
VITE_API_URL (env var)
       ↓
src/api/apiClient.ts   ← Axios instance, token interceptor
       ↓
src/api/authApi.ts     ← login(), signup(), getCurrentUser()
       ↓
src/context/AuthContext.tsx  ← React state, useAuth() hook
       ↓
Components              ← useAuth() for user state and actions
```

### Token injection

`apiClient` has a request interceptor that reads `localStorage.getItem('token')` before every request. If a token exists, it adds `Authorization: Bearer <token>` automatically. No component needs to handle this manually.

### AuthContext behavior

On app load, `AuthProvider` checks `localStorage` for a saved token. If one exists, it calls `GET /api/auth/me` to validate it:
- **Valid token** → sets `user` and `isAuthenticated: true`
- **Invalid/expired token** → clears localStorage, sets `user: null`
- **No token** → skips the request, sets `user: null` immediately

`loading` is `true` during this initial check and becomes `false` once it resolves. The Navbar waits for `loading: false` before rendering auth-dependent links — this prevents the Login/Signup links from flashing before the user check completes.

### Using auth in pages (Phase 3+)

```tsx
import { useAuth } from '../context/AuthContext';

function SomePage() {
  const { user, isAuthenticated, login, signup, logout, loading } = useAuth();
  // ...
}
```

### Token storage

The JWT token is stored in `localStorage` under the key `token`. This is an MVP decision. Production apps should consider `httpOnly` cookies for XSS protection.

## Running with the Backend

### Option A — Docker (recommended)

From the project root, one command starts everything (MySQL, server, client):

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

No local Node.js or MySQL required.

### Option B — Manual

Start both servers simultaneously:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Runs on http://localhost:4000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

The client reads `VITE_API_URL` from `.env.local`. If that file doesn't exist, it falls back to `http://localhost:4000`.

## Implementation Phases

## Authentication Flow

### Login
1. User submits email + password on `/login`
2. `LoginPage` calls `login()` from `useAuth()`
3. `AuthContext` calls `POST /api/auth/login` via `authApi`
4. On success: token saved to `localStorage`, user state set
5. Navbar updates to show user name + Logout
6. User is redirected to home (or back to the protected page they came from)

### Signup
1. User submits name + email + password + confirm on `/signup`
2. Client validates all fields before submitting
3. `SignupPage` calls `signup()` from `useAuth()`
4. `AuthContext` calls `POST /api/auth/signup` via `authApi`
5. On success: token saved, user state set, redirect to home

### Logout
1. User clicks Logout in Navbar
2. `logout()` clears `localStorage` and resets user state
3. Navbar immediately switches back to Login + Sign Up
4. User is redirected to home

### Protected Routes
`ProtectedRoute` wraps `/cart`, `/checkout`, `/account`, `/orders`.

Behavior:
- While auth loading → shows a centered spinner
- Not authenticated → redirects to `/login`, preserving the intended URL in `location.state`
- Authenticated → renders the page

After login, the user is sent back to the page they originally tried to visit.

## Implementation Phases

- **Phase 1** ✅: Project setup, routing, layout, placeholder pages
- **Phase 2** ✅: API client, auth types, AuthContext, token interceptor
- **Phase 3** ✅: Login page, signup page, ProtectedRoute, auth-aware Navbar
- **Phase 4** ✅: Product catalog, search, and filtering
- **Phase 5** ✅: Shopping cart — add, update, remove
- **Phase 6** ✅: Checkout and order creation
- **Phase 7** ✅: Order history, account page

## Account & Order History (Phase 7)

### AccountPage (`/account`)

Reads the authenticated user from `useAuth()`. Displays:
- Avatar with initials derived from the user's name
- Full name, email, and member-since date
- Quick-link cards to Order History and Shopping Cart
- Sign out button (calls `logout()` from `AuthContext`)

No API call is made — the user object was already fetched during the initial auth check on app load.

### OrdersPage (`/orders`)

Calls `getOrders()` → `GET /api/orders` on mount. The backend returns orders sorted newest-first, each with nested `items`.

Each order card shows:
- Order ID and date
- Status badge (color-coded: pending → yellow, processing → blue, shipped → purple, delivered → green, cancelled → red)
- Order total from `total_amount` (backend-calculated, not recomputed)
- Nested line items with name, unit price × quantity, and line subtotal
- Shipping recipient and address in the card footer

### Phase 7 verification steps

| Action | Expected result |
|---|---|
| Visit `/account` | User name, email, and initials avatar displayed |
| Click "Order History" | Navigates to `/orders` |
| Click "Sign out" | Logged out |
| Visit `/orders` with no prior orders | "You haven't placed any orders yet." |
| Place an order then visit `/orders` | Order card shows ID, total, status, items |
| Status badge | Correct color for each status value |

## Manual Verification

Start the backend first:
```bash
cd server && npm run dev   # http://localhost:4000
```

Then start the client:
```bash
cd client && npm run dev   # http://localhost:5173
```

### Phase 3 verification steps

| Action | Expected result |
|---|---|
| Visit `/login` | Clean login form renders |
| Visit `/signup` | Clean signup form renders |
| Submit login with empty fields | Inline validation errors appear |
| Submit login with wrong password | "Invalid email or password" error shown |
| Submit login with correct credentials | Redirected to home, Navbar shows user name |
| Logout | Navbar shows Login + Sign Up, redirected home |
| Visit `/cart` while logged out | Redirected to `/login` |
| Visit `/checkout` while logged out | Redirected to `/login` |
| Visit `/account` while logged out | Redirected to `/login` |
| Visit `/orders` while logged out | Redirected to `/login` |
| Visit `/cart` while logged in | Page renders (placeholder) |
| Visit `/login` while logged in | Redirected to home |
| Visit `/signup` while logged in | Redirected to home |
| Signup with mismatched passwords | "Passwords do not match" shown |
| Signup with password < 6 chars | "Password must be at least 6 characters" shown |
| Signup with a duplicate email | Backend error message shown in form |
| Refresh page with valid token | User stays logged in, Navbar shows name |
| Refresh page with expired/invalid token | Silently logged out, Navbar shows Login |

## Product Catalog (Phase 4)

### How products are loaded

On `HomePage` mount, `getProducts()` is called with no filters. The result populates the product grid. When filters are applied or cleared, `getProducts(filters)` is called again and the grid re-renders.

All HTTP calls go through `src/api/productsApi.ts` → `src/api/apiClient.ts`. No component calls `axios` directly for data fetching.

### Product filtering

`ProductFilters` manages its own local input state (search, category, minPrice, maxPrice). When the user clicks "Apply Filters", it calls `onApplyFilters(filters)` on the parent `HomePage`, which re-fetches products with those params.

Filter params sent to `GET /api/products`:

| Param | Type | Notes |
|---|---|---|
| `search` | string | Partial match on name/description |
| `category` | string | Must match a seed category exactly |
| `minPrice` | string | Numeric string, inclusive |
| `maxPrice` | string | Numeric string, inclusive |

Only non-empty values are included in the query string. "All" category is treated as no filter.

"Clear Filters" resets all inputs and reloads all products.

### Product details

`/products/:id` reads `id` from the URL and calls `getProductById(id)`.

- **Loading** → spinner
- **404** → friendly "Product Not Found" message with a back link
- **Network error** → `ErrorState` with retry
- **Success** → full product layout (image, name, description, price, stock, placeholder "Add to Cart" button)

The "Add to Cart" button is present but disabled/non-functional — real cart logic is Phase 5.

### Backend dependency

The product API requires the backend to be running:

```bash
cd server && npm run dev   # http://localhost:4000
```

`VITE_API_URL` in `.env.local` must point to the backend. If the file is missing, it defaults to `http://localhost:4000`.

## Shopping Cart (Phase 5)

### How the cart works

`CartContext` wraps the entire app (inside `AuthProvider`). On auth resolve it fetches the cart if the user is authenticated, or clears state on logout. All components that need cart data call `useCart()`.

Cart API calls:

| Function | HTTP | Notes |
|---|---|---|
| `getCart()` | `GET /api/cart` | Returns `{ cart: { items, total } }` |
| `addToCart(id, qty)` | `POST /api/cart/items` + re-fetch | Backend returns only the cart_item, so a second GET follows |
| `updateCartItem(id, qty)` | `PUT /api/cart/items/:id` + re-fetch | Same pattern |
| `removeCartItem(id)` | `DELETE /api/cart/items/:id` + re-fetch | Same pattern |

Quantity controls in `CartItem`: decrement to 0 triggers removal. The `CartContext.updateQuantity` function routes `quantity <= 0` to `removeCartItem`.

The "Add to Cart" button on `ProductDetailsPage` shows a spinner while adding and a green "Added to Cart!" confirmation for 1.5 s. The compact cart icon on `ProductCard` works the same way. Both redirect unauthenticated users to `/login`.

The Navbar shows a blue badge on the Cart link with the live `itemCount` (sum of all item quantities). It disappears when the cart is empty or on logout.

## Checkout (Phase 6)

### How the checkout flow works

`CheckoutPage` is a single protected page that manages a 3-step flow entirely in local state:

| Step | Component | Purpose |
|---|---|---|
| 1 | `ShippingForm` | Collects and validates shipping details |
| 2 | `OrderReview` | Shows cart items, totals, shipping summary, and the Place Order button |
| 3 | Inline confirmation | Shows order ID, total, status, and ship-to from the backend response |

`CheckoutStepper` always renders at the top showing step progress.

### Shipping validation

`ShippingForm` validates all four fields client-side before calling `onSubmit`. Fields are trimmed before validation and before being sent to the backend. Submitting with empty fields shows inline error messages per field. Navigating back to step 1 restores the previously entered values.

### Order creation

When the user clicks "Place Order" in `OrderReview`, `CheckoutPage` calls `createOrder(shippingDetails)` from `ordersApi.ts` → `POST /api/orders`. The backend:
1. Validates shipping fields
2. Reads current cart from the database
3. Fetches product prices from the database (never trusts frontend)
4. Creates the order and order_items records
5. Clears the user's cart

On success: `clearCartState()` syncs the frontend (Navbar badge → 0, CartPage → empty). The returned order object is displayed on the confirmation screen.

On failure: the error message from `err.response?.data?.error?.message` is shown inline in `OrderReview`. Form data is preserved so the user can retry without re-entering everything.

### Backend dependency

- Backend must run on `http://localhost:4000`
- User must be authenticated (token in `localStorage`)
- Cart must not be empty when hitting `/checkout`

### Phase 6 verification steps

| Action | Expected result |
|---|---|
| Visit `/checkout` while logged out | Redirected to `/login` |
| Visit `/checkout` with empty cart | "Your cart is empty" message with Continue Shopping link |
| Visit `/checkout` with items | Step 1 (Shipping) renders with CheckoutStepper |
| Submit shipping with empty fields | Inline validation errors on each field |
| Fill shipping form, click "Continue to Review" | Step 2 renders, stepper advances, shipping details shown |
| Step 2 shows correct totals | Cart items, subtotals, and total match CartPage values |
| Click "Back to Shipping" | Returns to step 1 with original values preserved |
| Click "Place Order" | Spinner while request is in flight |
| Successful order | Step 3 confirmation shows order ID, status, total, city |
| Navbar cart badge after order | Shows 0 (cart cleared) |
| Visit `/cart` after order | Empty cart state |
| Click "View Orders" on confirmation | Navigates to `/orders` |
| Click "Continue Shopping" on confirmation | Navigates to `/` |
| Backend returns error | Error message shown in OrderReview, form preserved |

### Phase 5 verification steps

| Action | Expected result |
|---|---|
| Visit `/` while logged out, click cart icon on a card | Redirected to `/login` |
| Login, navigate to any product, click "Add to Cart" | Button shows spinner → "Added to Cart!" → Navbar badge updates |
| Open `/cart` | Cart items show image, name, category, unit price, quantity, subtotal |
| Click + on any item | Quantity increases, subtotal and total update |
| Click − on item with quantity 1 | Item is removed |
| Click × on any item | Item is removed |
| Remove all items | Empty state "Your cart is empty." shown |
| Add items, check Navbar | Badge shows correct total quantity |
| Logout | Navbar badge disappears, cart state cleared |
| Login again | Cart reloads from backend (persisted) |
| Backend down | Error state with "Try Again" in cart page |

### Phase 4 verification steps

| Action | Expected result |
|---|---|
| Visit `/` | Hero + product grid loaded from backend |
| Products render | Each card shows image, name, description, category, price, stock |
| Type in Search, click Apply | Grid re-filters to matching products |
| Select a category, click Apply | Only products in that category shown |
| Set minPrice/maxPrice, click Apply | Products in that price range shown |
| Click Clear Filters | All products reload |
| No products match filters | Empty state message shown |
| Backend is down | Error state with "Try Again" button shown |
| Click "View Details" on a card | Navigates to `/products/:id` |
| `/products/:id` loads | Full product detail page with real data |
| Visit `/products/99999` | "Product Not Found" message with back link |
| Image fails to load | SVG placeholder renders (no broken image icon) |

