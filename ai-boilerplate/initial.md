# Bootstrap Prompt — Helfy E-Commerce Platform

You are a senior software engineer. Your task is to build a complete, production-quality full-stack e-commerce platform from scratch, phase by phase.

## Project Identity

**Name**: Helfy E-Commerce Platform
**Purpose**: A modern, premium e-commerce web application with full shopping functionality.

## Stack Requirements

### Backend
- Runtime: Node.js (v16+)
- Framework: Express.js
- Language: TypeScript (strict mode)
- Database: MySQL 8+, via `mysql2/promise` connection pool
- Authentication: JWT (`jsonwebtoken`) + password hashing (`bcryptjs`)
- Environment config: `dotenv`
- CORS: `cors` middleware

### Frontend
- Framework: React 19
- Language: TypeScript
- Build tool: Vite
- Styling: Tailwind CSS
- Routing: React Router
- HTTP client: Axios

## Functional Requirements

### Backend API
- User authentication: signup, login, `GET /api/auth/me`
- Product catalog: list with search/category/price filters, single product detail
- Persistent shopping cart: add, update quantity, remove (server-side ownership)
- Checkout: create order from cart using database prices (never trust frontend prices)
- Order history: list user's orders with nested line items

### Frontend Application
- Public: product catalog with search, category, and price filters; product detail page
- Auth: login, signup, logout with JWT stored in localStorage
- Protected: cart page, multi-step checkout (shipping, review, confirmation), account profile, order history

## Architecture Constraints

- Monorepo layout: `server/` and `client/` at root
- Backend must follow: routes → controllers → services → database (no business logic in controllers)
- All API calls from the frontend must go through a single centralized Axios instance
- No frontend price calculation — always use backend-returned values
- User ownership must be enforced server-side for all cart and order operations
- Secrets must never be committed — use `.env` with `.env.example` as template

## Implementation Method

Build phase by phase. Do not skip phases. Verify each phase before proceeding.

### Backend Phases

1. TypeScript + Express setup, health endpoint, CORS
2. MySQL schema (5 tables: users, products, cart_items, orders, order_items), seed data, `db:init` script
3. Auth module: signup, login, JWT middleware, `GET /api/auth/me`
4. Products module: list with filters, single product
5. Cart module: CRUD with user ownership and server-side price calc
6. Orders module: checkout (atomic transaction), order history
7. Error handling review, documentation, security audit

### Frontend Phases

1. React + TypeScript + Vite + Tailwind setup, routing scaffold, layout components
2. Axios API client with token interceptor, auth types, AuthContext
3. Login, signup, ProtectedRoute, auth-aware Navbar
4. Product catalog (list, filters, detail page)
5. CartContext, cart page, add-to-cart from product pages
6. Multi-step checkout (shipping → review → confirmation)
7. Account profile page, order history page
8. UI polish, responsive design, loading/error/empty states

## Engineering Standards

- Follow `engineering-guidelines.md`
- Reference `capability-definitions.md` for reusable domain patterns
- Reference `architecture.md` for system design
- Document all manual interventions in `docs/manual-interventions.md`
- After each phase, verify functionality before proceeding
- Never expose secrets, tokens, or API keys in any file

## Verification

After each phase, test the added functionality:
- Backend: use curl against `http://localhost:4000`
- Frontend: manually test in browser at `http://localhost:5173`
- Document any deviations or manual fixes

## Output Expectations

At the end of all phases, the repository must include:
- `server/` — complete, working backend
- `client/` — complete, working frontend
- `ai-boilerplate/` — this bootstrap and all engineering documents
- `docs/` — AI interaction log, manual interventions, verification record
- `README.md` — project overview, setup instructions, known limitations
- `INSTRUCTIONS.md` — reviewer quick-start guide
