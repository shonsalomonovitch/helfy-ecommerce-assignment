# AI Interactions — Helfy E-Commerce Client

Documents how AI tools were used during frontend implementation.

**AI Tool**: Claude Code (claude-sonnet-4-6) via Anthropic CLI
**Model**: claude-sonnet-4-6

---

## Phase 1 — Project Setup, Routing, Layout, Placeholder Pages

**Prompt summary**: Set up React 19 + TypeScript + Vite + Tailwind CSS v4, configure React Router v7, create layout components (Navbar, Footer, PageContainer), scaffold all page placeholders, write README.

**AI contribution**:
- Created `Navbar.tsx`, `Footer.tsx`, `PageContainer.tsx`
- Created placeholder pages: HomePage, ProductDetailsPage, CartPage, CheckoutPage, AccountPage, OrdersPage, LoginPage, SignupPage, NotFoundPage
- Configured `App.tsx` with `BrowserRouter` and `Routes`
- Wrote the initial `README.md` with project structure and route table

**Manual review**: Confirmed Vite config, Tailwind plugin setup, and tsconfig were correct before proceeding.

---

## Phase 2 — API Client, Auth Types, AuthContext

**Prompt summary**: Create the API layer (apiClient with token interceptor), auth types, authApi, and AuthContext with persistent token validation.

**AI contribution**:
- `src/api/apiClient.ts` — Axios instance, request interceptor reading token from localStorage
- `src/api/authApi.ts` — `login()`, `signup()`, `getCurrentUser()`
- `src/types/auth.types.ts` — `User`, `AuthContextValue`, request/response interfaces
- `src/context/AuthContext.tsx` — `AuthProvider`, `useAuth()`, token validation on mount

**Key decision**: The response interceptor was intentionally left passive (no redirect on 401) to avoid a redirect loop during the `/api/auth/me` check on mount.

---

## Phase 3 — Login, Signup, ProtectedRoute, Auth-Aware Navbar

**Prompt summary**: Build full login and signup pages with client-side validation, ProtectedRoute, and auth-aware Navbar.

**AI contribution**:
- `src/pages/LoginPage.tsx` — email/password form, field validation, redirect-back after login
- `src/pages/SignupPage.tsx` — name/email/password/confirm form, all validation cases
- `src/components/common/ProtectedRoute.tsx` — spinner during loading, redirect to `/login` with `location.state`
- Updated `Navbar.tsx` — Cart, Orders, Account, user name, Logout when authenticated; Login + Sign Up when not
- Updated `App.tsx` — ProtectedRoute wrapping for `/cart`, `/checkout`, `/account`, `/orders`

---

## Phase 4 — Product Catalog, Filters, Product Details

**Prompt summary**: Build the product browsing experience using `GET /api/products` and `GET /api/products/:id`.

**AI contribution**:
- `src/types/product.types.ts` — `Product`, `ProductFilters`
- `src/api/productsApi.ts` — `getProducts()`, `getProductById()` via apiClient
- `src/components/products/ProductCard.tsx` — premium card with image fallback, category badge, price, stock
- `src/components/products/ProductGrid.tsx` — responsive 1/2/3/4 grid with EmptyState
- `src/components/products/ProductFilters.tsx` — search, category select, min/max price, Apply/Clear
- `src/components/common/LoadingState.tsx`, `ErrorState.tsx`, `EmptyState.tsx`
- Updated `src/pages/HomePage.tsx` — hero + catalog with filter wiring and loading/error states
- Updated `src/pages/ProductDetailsPage.tsx` — full product detail layout, 404 handling

---

## Phase 5 — Shopping Cart

**Prompt summary**: Build persistent cart using `GET/POST/PUT/DELETE /api/cart/items`. Add CartContext, cart page, cart item components, and add-to-cart behavior.

**AI contribution**:
- `src/types/cart.types.ts` — `Cart`, `CartItem`, `CartContextValue`
- `src/api/cartApi.ts` — `getCart()`, `addToCart()`, `updateCartItem()`, `removeCartItem()` (each mutation re-fetches cart)
- `src/context/CartContext.tsx` — `CartProvider`, `useCart()`, auth-aware auto-load/clear
- `src/components/cart/CartItem.tsx` — image, quantity controls, subtotal, remove button
- `src/components/cart/CartSummary.tsx` — order summary panel, checkout link
- Updated `src/pages/CartPage.tsx` — full cart UI with all states
- Updated `src/pages/ProductDetailsPage.tsx` — working Add to Cart with spinner + success flash
- Updated `src/components/products/ProductCard.tsx` — compact cart icon button
- Updated `src/components/layout/Navbar.tsx` — live cart badge
- Updated `src/App.tsx` — `CartProvider` added inside `AuthProvider`

---

## Phase 6 — Checkout

**Prompt summary**: Build a 3-step checkout flow creating orders via `POST /api/orders`.

**AI contribution**:
- `src/types/order.types.ts` — `ShippingDetails`, `Order`, `CreateOrderResponse`
- `src/api/ordersApi.ts` — `createOrder()`
- `src/components/checkout/CheckoutStepper.tsx` — 3-step progress indicator
- `src/components/checkout/ShippingForm.tsx` — controlled form, per-field validation, city+country side by side
- `src/components/checkout/OrderReview.tsx` — cart items + backend total + shipping summary + Place Order button
- Updated `src/pages/CheckoutPage.tsx` — 3-step orchestrator with shipping state, order placement, confirmation

---

## Phase 7 — Order History, Account Page

**Prompt summary**: Build account profile and order history pages.

**AI contribution**:
- `src/api/ordersApi.ts` — added `getOrders()`
- `src/types/order.types.ts` — added `OrderItem`; made `items` optional on `Order`
- `src/pages/AccountPage.tsx` — initials avatar, user name/email, quick-link cards, sign out
- `src/pages/OrdersPage.tsx` — order cards with color-coded status badges, nested items, shipping footer

---

## Phase 8 — UI Polish, Responsive Design, Documentation

**Prompt summary**: Polish UI consistency, fix mobile layout, fix minor bugs, write verification docs.

**AI contribution**:
- Fixed `LoadingState.tsx` spinner ring appearance
- Fixed `ProductFilters.tsx` border radius and border color inconsistency
- Fixed `Navbar.tsx` mobile overflow (added responsive spacing, hid Orders on mobile)
- Fixed `NotFoundPage.tsx` button radius consistency
- Fixed `OrdersPage.tsx` `window.location.href` → `useNavigate`
- Fixed `CheckoutPage.tsx` redundant `onClick` on Link, removed unused `useNavigate` import
- Created `docs/frontend-verification.md`
- Created `docs/ai-interactions-client.md`
- Created `docs/manual-interventions-client.md`
- Updated `README.md` with known limitations and complete feature list
