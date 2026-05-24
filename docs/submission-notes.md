# Submission Notes

---

## What Was Built

Helfy is a full-stack e-commerce platform built through a structured AI-assisted development process.

**Backend** (`server/`):
- Node.js + Express + TypeScript REST API
- MySQL database with 5 tables (users, products, cart_items, orders, order_items)
- JWT authentication with bcryptjs password hashing
- Product catalog with search, category, and price filtering
- Persistent shopping cart with server-side price calculation
- Atomic checkout using MySQL transactions
- Order history with nested line items

**Frontend** (`client/`):
- React 19 + TypeScript + Vite + Tailwind CSS v4
- Centralized Axios API client with automatic JWT injection
- Login, signup, logout with persistent token validation
- Product catalog with filters (search, category, min/max price)
- Product detail pages
- Shopping cart (add, update quantity, remove)
- 3-step checkout (shipping → review → confirmation)
- Account profile and order history pages
- Responsive design (mobile, tablet, desktop)

---

## How AI Was Used

The project was built in two stages:

**Backend** (Cline + OpenRouter):
1. A comprehensive plan was generated in `server/plan.md` before writing any code
2. The backend was then implemented phase by phase (7 phases), with each phase verified via curl before proceeding
3. A final review phase standardized error responses and verified security invariants

**Frontend** (Cline + OpenRouter):
1. A comprehensive plan was generated in `client/plan.md`
2. The frontend was implemented in 8 phases, each verified in the browser
3. A final polish phase corrected minor routing patterns and styling inconsistencies

No API keys or credentials are part of the application or this repository.

---

## How the Blueprint Was Structured

The AI blueprint lives in `ai-boilerplate/`:

- `initial.md` — the bootstrap prompt that could initiate this entire project from scratch
- `engineering-guidelines.md` — standards for TypeScript, folder structure, naming, security
- `capability-definitions.md` — 11 reusable domain capabilities with inputs, outputs, and constraints
- `architecture.md` — system design with Mermaid diagrams for auth, cart, and checkout flows
- `server-generation-plan.md` — backend phase summary referencing `server/plan.md`
- `client-generation-plan.md` — frontend phase summary referencing `client/plan.md`
- `ai-working-rules.md` — 14 rules governing AI agent behavior in this codebase

---

## How to Run the App

**Terminal 1 — Backend**:
```bash
cd server
npm install
cp .env.example .env
# Edit .env: set DB_PASSWORD and JWT_SECRET
npm run db:init
npm run dev
# Runs on http://localhost:4000
```

**Terminal 2 — Frontend**:
```bash
cd client
npm install
cp .env.example .env.local
# .env.local should contain: VITE_API_URL=http://localhost:4000
npm run dev
# Runs on http://localhost:5173
```

See `INSTRUCTIONS.md` for detailed setup and troubleshooting.

---

## What Limitations Remain

- No real payment processing (orders created with `status: "pending"`)
- JWT stored in `localStorage` (not httpOnly cookies)
- No refresh token flow
- No automated test suite
- No admin panel
- No pagination on products or orders
- No stock validation at checkout
- No rate limiting
- No email notifications

These are intentional MVP tradeoffs documented throughout the codebase.

---

## No Secrets Included

This repository does not contain:
- Any `.env` file with real credentials
- Any Cline or OpenRouter API key
- Any Cline/OpenRouter API key beyond what is already listed
- Any database passwords
- Any JWT secrets

The `.env.example` files in `server/` and `client/` contain only placeholder values.
