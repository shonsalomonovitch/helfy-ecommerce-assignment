# Capability Definitions

Reusable domain capabilities for the Helfy E-Commerce platform. Each capability describes a bounded feature area, its responsibilities, and constraints.

---

## 1. Authentication Capability

**Purpose**: Manage user accounts, password security, and JWT-based session state.

**Inputs**:
- Signup: `{ name, email, password }`
- Login: `{ email, password }`
- Me: Bearer token in `Authorization` header

**Outputs**:
- Signup/Login: `{ token, user: { id, name, email } }`
- Me: `{ user: { id, name, email, created_at } }`

**Backend files**:
- `src/services/auth.service.ts` — signup, login, getCurrentUser
- `src/controllers/auth.controller.ts`
- `src/routes/auth.routes.ts`
- `src/middleware/auth.middleware.ts`
- `src/types/auth.types.ts`
- `src/types/express.d.ts` — `req.user` type extension

**Frontend files**:
- `src/api/authApi.ts`
- `src/context/AuthContext.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/SignupPage.tsx`
- `src/components/common/ProtectedRoute.tsx`

**Expected behavior**:
- Password hashed with bcryptjs (10 rounds)
- JWT signed with `JWT_SECRET`, expires per `JWT_EXPIRES_IN`
- Duplicate email returns 409
- Invalid credentials return 401
- Protected routes return 401 if token missing or invalid
- `AuthContext` validates token on app mount by calling `GET /api/auth/me`
- `ProtectedRoute` shows spinner during auth loading, redirects to `/login` when unauthenticated

**Constraints**:
- Password hash never returned in any API response
- User ID always comes from `req.user`, never from request body
- Token stored in `localStorage` (MVP approach)

---

## 2. Product Catalog Capability

**Purpose**: Browse, search, and filter the product inventory.

**Inputs**:
- List: optional query params `search`, `category`, `minPrice`, `maxPrice`
- Detail: product `id` in URL path

**Outputs**:
- List: `{ products: Product[] }`
- Detail: `{ product: Product }`

**Backend files**:
- `src/services/product.service.ts`
- `src/controllers/product.controller.ts`
- `src/routes/product.routes.ts`
- `src/types/product.types.ts`
- `src/db/seed.sql` — 12 sample products

**Frontend files**:
- `src/api/productsApi.ts`
- `src/pages/HomePage.tsx`
- `src/pages/ProductDetailsPage.tsx`
- `src/components/products/ProductCard.tsx`
- `src/components/products/ProductGrid.tsx`
- `src/components/products/ProductFilters.tsx`

**Expected behavior**:
- No authentication required
- Filters are optional and combinable
- Search matches product name and description
- Category filter is exact match
- Price range filter is inclusive
- Invalid price range (min > max) returns 400
- Non-existent product ID returns 404
- Non-numeric product ID returns 400

**Constraints**:
- No frontend price calculation
- All filters sent as query parameters to `GET /api/products`
- Product card shows fallback SVG if image fails to load
- Out-of-stock products disable the "Add to Cart" button

---

## 3. Cart Capability

**Purpose**: Maintain a persistent, user-scoped shopping cart stored in the database.

**Inputs**:
- Add: `{ product_id, quantity }`
- Update: `{ quantity }` with `productId` in URL
- Remove: `productId` in URL
- Get: Bearer token (user inferred from token)

**Outputs**:
- All operations: `{ cart: { items: CartItem[], total: number } }`

**Backend files**:
- `src/services/cart.service.ts`
- `src/controllers/cart.controller.ts`
- `src/routes/cart.routes.ts` (all routes protected)
- `src/types/cart.types.ts`

**Frontend files**:
- `src/api/cartApi.ts`
- `src/context/CartContext.tsx`
- `src/pages/CartPage.tsx`
- `src/components/cart/CartItem.tsx`
- `src/components/cart/CartSummary.tsx`

**Expected behavior**:
- All cart endpoints require authentication (401 if no token)
- Adding a product already in cart increases its quantity
- Updating to quantity 0 removes the item
- Cart total and item subtotals calculated server-side from `products.price`
- `CartContext` auto-loads cart on login, clears on logout
- Navbar badge shows `itemCount` (sum of all item quantities)

**Constraints**:
- All cart queries filter by `req.user.userId`
- Product prices fetched from `products` table, never from request body
- Frontend never calculates subtotals or totals

---

## 4. Checkout / Order Capability

**Purpose**: Convert the cart into a committed order using an atomic database transaction.

**Inputs**:
- Create order: `{ shipping_name, shipping_address, shipping_city, shipping_country }`
- List orders: Bearer token only

**Outputs**:
- Create: `{ message, order: Order }`
- List: `{ orders: Order[] }` (each with nested `items`)

**Backend files**:
- `src/services/order.service.ts`
- `src/controllers/order.controller.ts`
- `src/routes/order.routes.ts` (all protected)
- `src/types/order.types.ts`

**Frontend files**:
- `src/api/ordersApi.ts`
- `src/pages/CheckoutPage.tsx`
- `src/components/checkout/CheckoutStepper.tsx`
- `src/components/checkout/ShippingForm.tsx`
- `src/components/checkout/OrderReview.tsx`

**Expected behavior**:
- Checkout is a 3-step flow: Shipping → Review → Confirmation
- Shipping form validates all 4 fields client-side before advancing
- Prices for order total are fetched from the database at order creation time
- Order creation is atomic: insert order + insert order_items + clear cart — all or nothing
- Cart is cleared in the frontend after successful order confirmation
- Empty cart at `/checkout` redirects to cart page

**Constraints**:
- All shipping fields must be non-empty and non-whitespace
- Empty cart returns 400
- Order line items store a snapshot of `product_name` and `product_price` at time of order
- User ID always from `req.user`, never from request body

---

## 5. Account / Order History Capability

**Purpose**: Display the authenticated user's profile and past orders.

**Inputs**:
- Account: user already in `AuthContext` (no extra API call)
- Orders: Bearer token (calls `GET /api/orders`)

**Outputs**:
- Account: user name, email, member-since date from `AuthContext`
- Orders: order cards with nested line items, status, and shipping info

**Backend files**:
- (Shared with Checkout / Order Capability)

**Frontend files**:
- `src/pages/AccountPage.tsx`
- `src/pages/OrdersPage.tsx`

**Expected behavior**:
- Both pages require authentication
- Account page derives initials avatar from user name
- Order cards show color-coded status badges (pending=yellow, processing=blue, shipped=purple, delivered=green, cancelled=red)
- Empty order history shows "You haven't placed any orders yet." with a shopping link

**Constraints**:
- Order total displayed from `total_amount` (backend-calculated, not recomputed)
- Orders are only those belonging to the authenticated user

---

## 6. Database Schema and Seed Capability

**Purpose**: Initialize the MySQL database with the correct schema and sample data.

**Files**:
- `src/db/schema.sql` — 5 tables: users, products, cart_items, orders, order_items
- `src/db/seed.sql` — 12 sample products across categories (Electronics, Fashion, Home, Fitness, Accessories)
- `src/db/init-db.ts` — initialization script, run via `npm run db:init`
- `src/config/db.ts` — connection pool

**Expected behavior**:
- `npm run db:init` creates the database if it does not exist, creates tables, and seeds products
- Re-running the script is safe (uses `IF NOT EXISTS` and `INSERT IGNORE`)
- Foreign key constraints enforce referential integrity
- `cart_items` has a UNIQUE constraint on `(user_id, product_id)`

**Constraints**:
- Prices are `DECIMAL(10, 2)` in database
- Order items store a snapshot (product name and price at time of order)
- All credentials come from environment variables — no hardcoded connection strings

---

## 7. API Integration Capability

**Purpose**: Provide a single, consistent HTTP communication layer for the frontend.

**Files**:
- `src/api/apiClient.ts` — Axios instance, base URL, request/response interceptors
- `src/api/authApi.ts`
- `src/api/productsApi.ts`
- `src/api/cartApi.ts`
- `src/api/ordersApi.ts`

**Expected behavior**:
- `apiClient` reads `VITE_API_URL` from environment
- Request interceptor injects `Authorization: Bearer <token>` if token exists in `localStorage`
- Response interceptor clears token on 401 but does not redirect (to avoid redirect loops)
- No component calls `axios` directly

**Constraints**:
- Base URL must come from `import.meta.env.VITE_API_URL`
- Never hardcode `http://localhost:4000` in components

---

## 8. UI Composition Capability

**Purpose**: Provide reusable layout and common UI components.

**Files**:
- `src/components/layout/Navbar.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/PageContainer.tsx`
- `src/components/common/LoadingState.tsx`
- `src/components/common/ErrorState.tsx`
- `src/components/common/EmptyState.tsx`
- `src/components/common/ProtectedRoute.tsx`

**Expected behavior**:
- Navbar is auth-aware: shows user name + Logout when authenticated, Login + Sign Up when not
- Navbar shows cart badge with live item count
- Navbar waits for `AuthContext.loading === false` before rendering auth-sensitive links (prevents flash)
- `PageContainer` provides consistent horizontal padding and max-width

**Constraints**:
- All layout components use Tailwind utility classes only
- No custom CSS except Tailwind directives in `index.css`

---

## 9. Error / Loading / Empty State Capability

**Purpose**: Provide consistent, user-friendly feedback for all async operations.

**Components**:
- `LoadingState` — spinner during data fetching
- `ErrorState` — error message with optional retry button
- `EmptyState` — icon + message for zero-result scenarios

**Expected behavior**:
- Every page that fetches data shows a loading state while the request is in flight
- Network or API errors show `ErrorState` with a "Try Again" / "Retry" button
- Empty results (no products, empty cart, no orders) show `EmptyState` with a contextual message and action link

**Constraints**:
- Raw error objects from Axios are never displayed to users
- Error messages must be human-readable

---

## 10. Documentation Capability

**Purpose**: Ensure the project is understandable, reproducible, and auditable.

**Files**:
- `server/plan.md` — backend source of truth
- `client/plan.md` — frontend source of truth
- `server/README.md` — backend API reference and setup
- `client/README.md` — frontend features and setup
- `ai-boilerplate/` — this bootstrap and all engineering documents
- `docs/ai-interactions.md` — tools, models, and prompts
- `docs/manual-interventions.md` — all human fixes with justification
- `docs/verification.md` — step-by-step verification guide
- `docs/final-review.md` — technical review summary
- `docs/submission-notes.md` — submission summary
- `README.md` — root project overview
- `INSTRUCTIONS.md` — reviewer quick-start

**Constraints**:
- No secrets in any documentation file
- No unverified claims (do not mark checklist items as complete unless they were verified)

---

## 11. Verification Capability

**Purpose**: Confirm that each phase of implementation is correct before proceeding.

**Methods**:
- Backend: curl commands against `http://localhost:4000`
- Frontend: manual browser testing at `http://localhost:5173`
- TypeScript: `npm run build` must pass with zero errors

**Verification targets**:
- Happy path for each feature
- Auth and ownership rules (401 without token, 403 cross-user access)
- Error cases (missing fields, invalid IDs, empty cart)
- Security invariants (no password hashes in responses, no server-side price trust of frontend)

**Constraints**:
- Do not advance to the next phase if the current phase fails verification
- Document any failures or deviations in `docs/manual-interventions.md`
