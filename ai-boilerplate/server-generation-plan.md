# Server Generation Plan

This document summarizes the AI-driven generation plan for the Helfy e-commerce backend.

**Source of truth**: `server/plan.md`

The backend was built using Cline (AI coding assistant) via OpenRouter, following a structured phase-by-phase approach. Each phase was implemented and verified before proceeding to the next.

---

## Phase 0: Planning

**Goal**: Create a comprehensive backend implementation plan before writing any code.

**Output**: `server/plan.md` — 14 sections covering database schema, API contracts, authentication strategy, cart strategy, order/checkout strategy, error handling, environment configuration, engineering principles, implementation phases, and verification checklist.

**Why planning first**: The plan became the source of truth for all subsequent phases. Clear upfront design prevented architectural drift and kept each phase focused.

---

## Phase 1: TypeScript + Express Setup

**Goal**: Convert the project to TypeScript, configure the development environment, and establish a working Express server.

**Tasks**:
- Install TypeScript dependencies (`typescript`, `ts-node-dev`, `@types/*`)
- Create `tsconfig.json` with `strict` mode, `target: ES2020`, `outDir: dist/`
- Convert `src/index.js` to `src/index.ts`
- Create `src/app.ts` for Express configuration and CORS setup
- Create health endpoint: `GET /api/health`
- Update `package.json` scripts: `dev`, `build`, `start`, `db:init`

**Verification**: `npm run dev` starts server, `GET /api/health` returns `{"status":"ok","message":"Server is running"}`

---

## Phase 2: Database Setup

**Goal**: Establish MySQL connection pooling and create the full database schema with seed data.

**Tasks**:
- Create `src/config/db.ts` with `mysql2/promise` connection pool
- Create `src/db/schema.sql` defining 5 tables: `users`, `products`, `cart_items`, `orders`, `order_items`
- Create `src/db/seed.sql` with 12 sample products across 5 categories
- Create `src/db/init-db.ts` script to initialize database
- Add `db:init` npm script

**Key design decisions**:
- `cart_items` has UNIQUE constraint on `(user_id, product_id)` to prevent duplicate rows
- `order_items` stores `product_name` and `product_price` as snapshots at order time
- Prices stored as `DECIMAL(10, 2)` for precision
- All foreign keys use `ON DELETE CASCADE`

**Verification**: `npm run db:init` creates database, tables, and seeds 12 products

---

## Phase 3: Authentication Module

**Goal**: Implement user signup, login, and JWT-protected route middleware.

**Tasks**:
- `src/types/auth.types.ts` — User, JWTPayload, SignupRequest, LoginRequest
- `src/types/express.d.ts` — extend Express `Request` with `user?: { userId, email }`
- `src/services/auth.service.ts` — signup (bcrypt hash), login (bcrypt compare), getCurrentUser
- `src/controllers/auth.controller.ts`
- `src/middleware/auth.middleware.ts` — verify JWT, attach `req.user`
- `src/routes/auth.routes.ts`

**Security requirements enforced**:
- bcryptjs with 10 salt rounds
- `password_hash` never returned in API responses
- 409 on duplicate email (not 400 — precise error code)
- 401 on invalid credentials without revealing which field is wrong

**Verification**: Signup returns token, login returns token, `GET /api/auth/me` with token returns user profile

---

## Phase 4: Products Module

**Goal**: Implement the product catalog with optional filtering.

**Tasks**:
- `src/types/product.types.ts`
- `src/services/product.service.ts` — getProducts with dynamic SQL for optional filters, getProductById
- `src/controllers/product.controller.ts`
- `src/routes/product.routes.ts`

**Filter implementation**:
- Filters are optional and combinable
- `search` uses `LIKE %term%` on name and description
- `category` is an exact match
- `minPrice` / `maxPrice` are validated (400 if min > max)
- Non-numeric product ID returns 400

**Verification**: All 12 seeded products return, filters narrow results correctly, `GET /api/products/99999` returns 404

---

## Phase 5: Cart Module

**Goal**: Implement user-scoped persistent cart with server-side price calculation.

**Tasks**:
- `src/types/cart.types.ts`
- `src/services/cart.service.ts` — getCart (JOIN with products), addItem (INSERT ON DUPLICATE KEY UPDATE), updateItem, removeItem
- `src/controllers/cart.controller.ts`
- `src/routes/cart.routes.ts` — all routes protected with `authMiddleware`

**Key requirements**:
- All queries filter by `userId` from `req.user` — never from request body
- Cart totals and subtotals computed from `products.price`, not from any request data
- Adding an existing product increases quantity (no duplicate rows)
- Updating to quantity 0 removes the item

**Verification**: Add, update, remove operations work; totals are accurate; unauthenticated requests return 401

---

## Phase 6: Orders / Checkout Module

**Goal**: Implement atomic order creation from cart and order history retrieval.

**Tasks**:
- `src/types/order.types.ts`
- `src/services/order.service.ts` — createOrder (transaction), getOrders (with nested items)
- `src/controllers/order.controller.ts`
- `src/routes/order.routes.ts` — all protected

**Transaction sequence** (atomic, all-or-nothing):
1. Fetch cart items with current product prices from DB
2. Validate cart is not empty
3. `BEGIN TRANSACTION`
4. `INSERT INTO orders`
5. `INSERT INTO order_items` (with price snapshot)
6. `DELETE FROM cart_items` WHERE user_id = userId
7. `COMMIT` (or `ROLLBACK` on any error)
8. Release connection

**Verification**: Order created, cart cleared, order history returns nested items, totals match

---

## Phase 7: Error Handling and Documentation

**Goal**: Finalize consistent error responses, add production safety, and complete documentation.

**Tasks**:
- Review all controllers for consistent error response format `{ error: { message, code, status } }`
- Add error codes to all responses that were missing them
- Improve `error.middleware.ts` for production safety (no stack traces)
- Write comprehensive `server/README.md` with API reference and curl examples
- Create `server/docs/manual-interventions.md`
- Create `server/docs/ai-interactions-server.md`
- Create `server/docs/backend-verification.md`

**Verification**: All error cases return consistent format; TypeScript compiles without errors; README is complete

---

## Final Backend Audit

After Phase 7, a senior engineer review was performed:

- Confirmed all SQL queries use parameterized placeholders
- Confirmed `password_hash` never appears in any response
- Confirmed user ownership enforced on all cart and order queries
- Confirmed transaction rollback on checkout failure
- Confirmed CORS configured for specific frontend origin
- Confirmed `.env` in `.gitignore`, `.env.example` has only placeholders

**Result**: Backend verified as production-ready for MVP with documented limitations (no payment provider, no rate limiting, no automated tests, no pagination, no refresh tokens).
