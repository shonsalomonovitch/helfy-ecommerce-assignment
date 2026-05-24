# Client Generation Plan

This document summarizes the AI-driven generation plan for the Helfy e-commerce frontend.

**Source of truth**: `client/plan.md`

The frontend was built using Cline (VS Code extension) via OpenRouter, following a structured phase-by-phase approach. Each phase was implemented and verified before proceeding to the next.

---

## Phase 0: Planning

**Goal**: Create a comprehensive frontend implementation plan before writing any code.

**Output**: `client/plan.md` — 16 sections covering frontend goal, engineering principles, folder structure, API integration plan, authentication flow, product catalog plan, cart plan, checkout plan, account plan, UI/UX standards, state management plan, error/loading strategy, implementation phases, verification checklist, known tradeoffs, and AI implementation rules.

**Why planning first**: The plan established clear architectural decisions (centralized API client, Context over Redux, localStorage JWT, etc.) and prevented ad-hoc decisions during implementation.

---

## Phase 1: Project Setup, Routing, Layout, Placeholder Pages

**Goal**: Establish the complete project scaffold with working routing and layout before adding any features.

**Tasks**:
- Verify Vite + React + TypeScript + Tailwind CSS setup
- Configure `App.tsx` with `BrowserRouter` and all route placeholders
- Create layout components: `Navbar.tsx`, `Footer.tsx`, `PageContainer.tsx`
- Scaffold all page placeholders: HomePage, ProductDetailsPage, CartPage, CheckoutPage, LoginPage, SignupPage, AccountPage, OrdersPage, NotFoundPage
- Write initial `client/README.md`

**Verification**: Dev server starts, all routes navigate without errors, layout renders

---

## Phase 2: API Client and AuthContext

**Goal**: Establish the centralized API layer and global authentication state before building any auth UI.

**Tasks**:
- `src/api/apiClient.ts` — Axios instance with base URL from `VITE_API_URL`, request interceptor for token injection
- `src/api/authApi.ts` — `login()`, `signup()`, `getCurrentUser()`
- `src/types/auth.types.ts` — `User`, `AuthContextValue`, request/response interfaces
- `src/context/AuthContext.tsx` — `AuthProvider`, `useAuth()`, token validation on mount

**Key architectural decision**: The Axios response interceptor clears the token on 401 but does not redirect. The `AuthContext` handles redirect logic to avoid a redirect loop during the initial `GET /api/auth/me` validation on app load.

**Verification**: API client connects to backend, auth context initializes without errors

---

## Phase 3: Authentication Pages and Protected Routes

**Goal**: Build complete login/signup experience and route protection.

**Tasks**:
- `src/pages/LoginPage.tsx` — email/password form with inline validation, redirect-back support via `location.state`
- `src/pages/SignupPage.tsx` — name/email/password/confirm form with all client-side validation cases
- `src/components/common/ProtectedRoute.tsx` — spinner during auth loading, redirect to `/login` with `location.state`
- Update `Navbar.tsx` — auth-aware links (user name + Logout vs Login + Sign Up)
- Update `App.tsx` — wrap protected routes with `ProtectedRoute`

**Verification**: Signup/login work end-to-end, protected routes redirect unauthenticated users, post-login redirect restores intended destination

---

## Phase 4: Product Catalog and Filters

**Goal**: Build the product browsing experience connected to the backend API.

**Tasks**:
- `src/types/product.types.ts` — `Product`, `ProductFilters`
- `src/api/productsApi.ts` — `getProducts(filters)`, `getProductById(id)`
- `src/components/products/ProductCard.tsx` — image with SVG fallback, category badge, price, stock, "View Details" button, cart icon button
- `src/components/products/ProductGrid.tsx` — responsive 1/2/3/4 column grid with `EmptyState`
- `src/components/products/ProductFilters.tsx` — search, category select, min/max price, Apply/Clear
- `src/components/common/LoadingState.tsx`, `ErrorState.tsx`, `EmptyState.tsx`
- Update `src/pages/HomePage.tsx` — hero section + filter wiring + loading/error/empty states
- Update `src/pages/ProductDetailsPage.tsx` — full product layout, 404 handling

**Verification**: Products load from backend, all filters work, loading/error/empty states render correctly

---

## Phase 5: CartContext and Cart Page

**Goal**: Implement persistent cart with backend sync.

**Tasks**:
- `src/types/cart.types.ts` — `Cart`, `CartItem`, `CartContextValue`
- `src/api/cartApi.ts` — `getCart()`, `addToCart()`, `updateCartItem()`, `removeCartItem()` (mutations re-fetch cart)
- `src/context/CartContext.tsx` — `CartProvider`, `useCart()`, auto-load on auth resolve
- `src/components/cart/CartItem.tsx` — quantity controls, subtotal, remove button
- `src/components/cart/CartSummary.tsx` — order summary panel with checkout link
- Update `CartPage.tsx` — full cart UI with all states
- Update `ProductDetailsPage.tsx` — working "Add to Cart" with spinner and success flash
- Update `ProductCard.tsx` — compact cart icon with spinner
- Update `Navbar.tsx` — live cart badge with `itemCount`
- Update `App.tsx` — wrap `CartProvider` inside `AuthProvider`

**Key design decision**: Each cart mutation (add, update, remove) makes a secondary `GET /api/cart` call because the backend mutation endpoints return only the modified item. The full cart state is always fetched fresh from the backend.

**Verification**: Add/update/remove work, cart persists after logout/login, Navbar badge updates live

---

## Phase 6: Checkout Flow

**Goal**: Build a 3-step checkout connecting to `POST /api/orders`.

**Tasks**:
- `src/types/order.types.ts` — `ShippingDetails`, `Order`, `CreateOrderResponse`
- `src/api/ordersApi.ts` — `createOrder(shippingDetails)`
- `src/components/checkout/CheckoutStepper.tsx` — 3-step visual progress indicator
- `src/components/checkout/ShippingForm.tsx` — controlled form, per-field client-side validation
- `src/components/checkout/OrderReview.tsx` — cart items + backend total + shipping summary + Place Order
- Update `src/pages/CheckoutPage.tsx` — 3-step orchestrator with shipping state, spinner, confirmation

**Verification**: Full checkout flow works end-to-end, cart clears after order, confirmation shows order details

---

## Phase 7: Account Profile and Order History

**Goal**: Build the authenticated account section.

**Tasks**:
- `src/api/ordersApi.ts` — add `getOrders()`
- `src/types/order.types.ts` — add `OrderItem`; make `items` optional on `Order`
- `src/pages/AccountPage.tsx` — initials avatar, user info, quick-link cards, sign out
- `src/pages/OrdersPage.tsx` — order cards with color-coded status badges, nested items, shipping footer

**Verification**: Account page shows user info, order history shows past orders with correct details

---

## Phase 8: UI Polish, Responsive Design, Documentation

**Goal**: Finalize the UI for quality and consistency, fix minor issues, and write documentation.

**Tasks**:
- Fixed `LoadingState.tsx` spinner ring appearance
- Fixed `ProductFilters.tsx` border radius and border color inconsistency
- Fixed `Navbar.tsx` mobile overflow (responsive spacing, Orders hidden on mobile)
- Fixed `NotFoundPage.tsx` button radius consistency
- Fixed `OrdersPage.tsx`: replaced `window.location.href` with `useNavigate` (React Router pattern)
- Fixed `CheckoutPage.tsx`: removed redundant `onClick` on `Link`, removed unused `useNavigate` import
- Created `client/docs/frontend-verification.md`
- Created `client/docs/ai-interactions-client.md`
- Created `client/docs/manual-interventions-client.md`
- Updated `client/README.md` with known limitations and full feature table

**Verification**: All responsive breakpoints work, no console errors, verification docs complete
