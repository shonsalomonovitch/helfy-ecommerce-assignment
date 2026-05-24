# Reviewer Instructions

Quick-start guide for setting up, running, and reviewing the Helfy E-Commerce Platform.

---

## Quick Start (TL;DR)

```bash
# Terminal 1 — Backend
cd server && npm install && cp .env.example .env
# Edit .env: set DB_PASSWORD and JWT_SECRET
npm run db:init && npm run dev

# Terminal 2 — Frontend
cd client && npm install && cp .env.example .env.local
npm run dev
```

Open `http://localhost:5173` in a browser.

---

## 1. Prerequisites

Before starting, ensure the following are installed and running:

- **Node.js** v16 or higher — `node --version`
- **MySQL** v8 or higher — `mysql --version`
- MySQL server running — `brew services start mysql` (macOS) or `sudo systemctl start mysql` (Linux)
- **npm** — included with Node.js

---

## 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` and fill in the required values:

```env
PORT=4000
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<your MySQL root password>
DB_NAME=helfy_ecommerce
JWT_SECRET=<any strong random string, at least 32 characters>
JWT_EXPIRES_IN=7d
```

---

## 3. Database Initialization

```bash
cd server
npm run db:init
```

This creates the `helfy_ecommerce` database, 5 tables, and seeds 12 sample products.

To verify:

```bash
mysql -u root -p helfy_ecommerce -e "SHOW TABLES;"
mysql -u root -p helfy_ecommerce -e "SELECT id, name, price, category FROM products;"
```

---

## 4. Start the Backend

```bash
cd server
npm run dev
```

Expected output includes: `Server running on port 4000` and `Database connected`.

Verify with:

```bash
curl http://localhost:4000/api/health
# Expected: {"status":"ok","message":"Server is running"}
```

---

## 5. Frontend Setup

In a second terminal:

```bash
cd client
npm install
cp .env.example .env.local
```

Verify `client/.env.local` contains:

```
VITE_API_URL=http://localhost:4000
```

---

## 6. Start the Frontend

```bash
cd client
npm run dev
```

Open `http://localhost:5173` in a browser.

---

## 7. End-to-End Test Flow

Perform this flow to verify all features:

1. Visit `http://localhost:5173`
2. Sign up as a new user (top right)
3. Browse the product catalog — try search and category filters
4. Click "View Details" on a product
5. Click "Add to Cart" — watch the Navbar badge update
6. Open the cart (`/cart`) — verify item appears with correct price
7. Click "Proceed to Checkout"
8. Fill in shipping details (Name, Address, City, Country) and click "Continue"
9. Review your order and click "Place Order"
10. Confirmation screen shows your order ID and total
11. Navigate to "Orders" (`/orders`) — your order appears
12. Navigate to "Account" (`/account`) — your name and email appear
13. Click "Sign out" — Navbar resets to Login + Sign Up

---

## 8. Where to Find the AI Blueprint

The full AI engineering blueprint is in `ai-boilerplate/`:

| File | Purpose |
|---|---|
| `initial.md` | Bootstrap prompt — how to regenerate this project from scratch |
| `engineering-guidelines.md` | TypeScript, structure, naming, security standards |
| `capability-definitions.md` | 11 domain capabilities with inputs, outputs, constraints |
| `architecture.md` | System architecture with Mermaid diagrams |
| `server-generation-plan.md` | Backend phase summary |
| `client-generation-plan.md` | Frontend phase summary |
| `ai-working-rules.md` | 14 rules for AI agents working in this codebase |

---

## 9. Where to Find AI Interaction Docs

| Document | Location |
|---|---|
| Combined AI interactions | `docs/ai-interactions.md` |
| Backend interactions (phase detail) | `server/docs/ai-interactions-server.md` |
| Frontend interactions (phase detail) | `client/docs/ai-interactions-client.md` |
| Backend plan (source of truth) | `server/plan.md` |
| Frontend plan (source of truth) | `client/plan.md` |

---

## 10. Where to Find Manual Interventions

| Document | Location |
|---|---|
| Combined interventions report | `docs/manual-interventions.md` |
| Backend interventions | `server/docs/manual-interventions.md` |
| Frontend interventions | `client/docs/manual-interventions-client.md` |

---

## 11. Verification Guides

| Document | Location |
|---|---|
| Combined verification guide | `docs/verification.md` |
| Backend verification checklist | `server/docs/backend-verification.md` |
| Frontend verification checklist | `client/docs/frontend-verification.md` |

---

## 12. Troubleshooting

### Backend won't start

- Ensure MySQL is running: `brew services list | grep mysql` (macOS)
- Verify `server/.env` exists and has correct `DB_PASSWORD`
- Try: `mysql -u root -p -e "SELECT 1"` to confirm MySQL credentials work

### `npm run db:init` fails

- Confirm MySQL is running
- Confirm `DB_USER` and `DB_PASSWORD` in `.env` are correct
- If the database already exists from a previous run, the script is safe to re-run

### Frontend shows API errors

- Ensure the backend is running on port 4000
- Verify `client/.env.local` contains `VITE_API_URL=http://localhost:4000`
- Check browser DevTools → Network tab for failed requests

### Products don't load

- Confirm `npm run db:init` ran successfully (check for 12 seeded products)
- Confirm backend is running: `curl http://localhost:4000/api/products`

### TypeScript build errors

```bash
cd server && npm run build   # Backend
cd client && npm run build   # Frontend
```

Both should complete with zero errors.

---

## Available Scripts

### Backend (`server/`)

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | ts-node-dev | Development server with hot reload |
| `npm run build` | tsc | Compile TypeScript to `dist/` |
| `npm start` | node dist/index.js | Run production build |
| `npm run db:init` | ts-node | Initialize database |

### Frontend (`client/`)

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | vite | Development server |
| `npm run build` | tsc + vite build | Production build |
| `npm run preview` | vite preview | Preview production build |
| `npm run lint` | eslint | Lint check |
