# Helfy E-Commerce AI-Generated Full Stack Platform

A complete, production-quality e-commerce platform built through a structured AI-guided blueprint process. The backend and frontend were generated phase by phase using AI coding tools, following comprehensive engineering plans and capability definitions.

---

## Overview

Helfy is a full-stack e-commerce web application featuring:

- React frontend with premium Tailwind CSS UI
- Node.js / Express backend with TypeScript
- MySQL database with relational schema
- JWT authentication with bcryptjs password hashing
- Product catalog with search and filtering
- Persistent server-side shopping cart
- Multi-step checkout with atomic order creation
- Account profile and order history

The application was generated through an AI-guided blueprint process where comprehensive plans were written first, then implementation was driven phase by phase with verification at each step.

---

## Repository Structure

```
helfy-ecommerce-assignment/
  client/              # React 19 + TypeScript + Vite + Tailwind CSS frontend
  server/              # Node.js + Express + TypeScript + MySQL backend
  ai-boilerplate/      # AI engineering blueprint (prompts, guidelines, architecture)
  docs/                # AI interaction logs, manual interventions, verification guide
  README.md            # This file
  INSTRUCTIONS.md      # Reviewer quick-start guide
```

---

## Features

### Backend

- JWT authentication (signup, login, `/me` endpoint)
- MySQL schema: users, products, cart_items, orders, order_items
- Product catalog API with search, category, and price range filtering
- Persistent shopping cart with server-side price calculation
- Atomic checkout using MySQL transactions (order + cart clear)
- Order history with nested line items
- Centralized error handling with consistent response format
- Parameterized SQL queries (SQL injection protection)
- User ownership enforcement on all cart and order operations

### Frontend

- Login and signup with client-side validation
- Protected routes (cart, checkout, account, orders require authentication)
- Product catalog with search, category, and price filters
- Product detail pages with "Add to Cart"
- Shopping cart with quantity controls and live totals
- 3-step checkout: Shipping Details → Order Review → Confirmation
- Account profile page with user info
- Order history with color-coded status badges and nested order items
- Responsive layout (mobile, tablet, desktop)
- Loading, error, and empty states throughout

### AI Blueprint

- `ai-boilerplate/initial.md` — bootstrap prompt for full project generation
- `ai-boilerplate/engineering-guidelines.md` — TypeScript, structure, security standards
- `ai-boilerplate/capability-definitions.md` — 11 domain capabilities with inputs/outputs/constraints
- `ai-boilerplate/architecture.md` — system design with Mermaid flow diagrams
- `ai-boilerplate/server-generation-plan.md` — backend phase summary
- `ai-boilerplate/client-generation-plan.md` — frontend phase summary
- `ai-boilerplate/ai-working-rules.md` — 14 rules for AI agents working in this codebase

---

## Tech Stack

### Frontend

| Technology | Version |
|---|---|
| React | 19 |
| TypeScript | ~6.0 |
| Vite | 8 |
| Tailwind CSS | v4 |
| React Router | v7 |
| Axios | ^1.16 |

### Backend

| Technology | Version |
|---|---|
| Node.js | v16+ |
| Express | 5 |
| TypeScript | ~6.0 |
| MySQL | 8+ |
| mysql2/promise | ^3.22 |
| jsonwebtoken | ^9.0 |
| bcryptjs | ^3.0 |
| dotenv | ^17 |

---

## Setup Instructions

### Option A — Docker (recommended)

Requires only [Docker Desktop](https://www.docker.com/products/docker-desktop/). No local Node.js or MySQL needed.

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- MySQL: localhost:3306

The database is initialised and seeded automatically on first start. If port 4000 or 5173 is already in use, stop your local dev servers first.

---

### Option B — Manual

#### Prerequisites

- Node.js v16 or higher
- MySQL v8 or higher running locally
- npm

#### Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` and set your MySQL password and a strong JWT secret:

```env
PORT=4000
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=helfy_ecommerce
JWT_SECRET=your_strong_random_secret
JWT_EXPIRES_IN=7d
```

Initialize the database (creates tables and seeds 12 sample products):

```bash
npm run db:init
```

Start the development server:

```bash
npm run dev
# Backend runs on http://localhost:4000
```

#### Frontend

```bash
cd client
npm install
cp .env.example .env.local
```

`client/.env.local` should contain:

```env
VITE_API_URL=http://localhost:4000
```

Start the development server:

```bash
npm run dev
# Frontend runs on http://localhost:5173
```

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `4000` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | — |
| `DB_NAME` | Database name | `helfy_ecommerce` |
| `JWT_SECRET` | Token signing key | — |
| `JWT_EXPIRES_IN` | Token TTL | `7d` |

### Frontend (`client/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend base URL | `http://localhost:4000` |

---

## Manual Verification

See `docs/verification.md` for a complete step-by-step verification guide including curl commands for the backend and browser steps for the frontend.

For the detailed backend checklist: `server/docs/backend-verification.md`
For the detailed frontend checklist: `client/docs/frontend-verification.md`

---

## AI Workflow

This project was built through a structured AI-guided process:

1. **Planning phase**: Comprehensive plans written before any code (`server/plan.md`, `client/plan.md`)
2. **Phase-by-phase generation**: Each capability implemented and verified separately
3. **Review phase**: Error consistency and security audits after implementation
4. **Documentation phase**: Interaction logs, intervention records, and verification guides

**Tools used**:
- Cline (VS Code extension) + OpenRouter — backend generation
- Cline + OpenRouter — frontend generation

For the full interaction log: `docs/ai-interactions.md`
For the full AI blueprint: `ai-boilerplate/`

---

## Manual Interventions

Key manual fixes applied during development:

**Backend**:
- Standardized error response format (added `code` field to all error responses)
- Improved error middleware for production safety (strip stack traces)
- Verified all SQL queries use parameterized placeholders
- Confirmed password hashes never returned in API responses
- Confirmed user ownership enforced on all cart/order operations

**Frontend**:
- Fixed `OrdersPage.tsx`: replaced `window.location.href` with React Router `useNavigate`
- Fixed `CheckoutPage.tsx`: removed redundant `onClick` on `Link` component
- Minor styling fixes (spinner appearance, filter borders, Navbar mobile overflow)
- Prettier auto-formatting accepted for two files

For the complete record: `docs/manual-interventions.md`

---

## Known Limitations

| Limitation | Notes |
|---|---|
| No payment provider | Orders created with `status: "pending"` only |
| No admin panel | Products managed via SQL seed script only |
| No refresh token flow | Users must re-login after JWT expires (7 days) |
| JWT in localStorage | MVP approach — httpOnly cookies recommended for production |
| No automated test suite | Manual verification only |
| No product pagination | All products returned in one request |
| No stock validation at checkout | Stock shown but not enforced during order creation |
| No rate limiting | Not suitable for production without rate limiting |
| No email notifications | No order confirmation emails |

---

## Security Notes

- Secrets are not committed. `.env` files are gitignored.
- `.env.example` files contain only placeholder values.
- The Cline/OpenRouter API key is not part of the application.
- The Cline/OpenRouter API key is not part of the application.
- Passwords are hashed with bcryptjs (10 rounds) and never stored or returned in plain text.
- All SQL queries use parameterized placeholders.
- Product prices are calculated server-side; frontend-provided prices are never trusted.

---

## License

ISC
