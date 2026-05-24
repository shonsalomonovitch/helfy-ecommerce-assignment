# Engineering Guidelines

Standards and constraints for all AI-assisted and human development on this project.

---

## Language and TypeScript

- All code is written in TypeScript — no plain JavaScript files in `src/`
- Enable `strict` mode in `tsconfig.json`
- Avoid `any` type; use explicit interfaces and type aliases
- Type all function parameters and return values
- Use `interface` for object shapes, `type` for unions and aliases

---

## Folder Structure

### Backend (`server/src/`)

```
src/
  index.ts              # Entry point — starts server
  app.ts                # Express app configuration
  config/
    db.ts               # Single MySQL connection pool
  middleware/
    auth.middleware.ts  # JWT verification
    error.middleware.ts # Centralized error handler
  routes/               # Route definitions only
  controllers/          # HTTP layer: parse request, call service, send response
  services/             # Business logic and database queries
  types/                # TypeScript interfaces and declarations
  db/
    schema.sql
    seed.sql
    init-db.ts
```

### Frontend (`client/src/`)

```
src/
  main.tsx
  App.tsx
  api/          # One file per domain (authApi, productsApi, cartApi, ordersApi)
                # All use the single apiClient instance
  context/      # AuthContext, CartContext
  components/   # Reusable UI: layout/, products/, cart/, checkout/, common/
  pages/        # One file per route
  types/        # TypeScript interfaces
```

---

## Naming Conventions

- Files: `kebab-case.ts` for backend, `PascalCase.tsx` for React components
- Variables and functions: `camelCase`
- Types and interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Database columns: `snake_case`
- Route files: `resource.routes.ts`
- Controller files: `resource.controller.ts`
- Service files: `resource.service.ts`

---

## Backend Architecture Rules

### Route / Controller / Service Separation

- **Routes**: define HTTP method and path, apply middleware, call controller
- **Controllers**: extract request data, call service, return response — no business logic
- **Services**: all database queries and business logic — no HTTP concerns

### Database Access

- Single connection pool in `config/db.ts`
- All queries use parameterized placeholders (`?`) — no string concatenation in SQL
- Use `mysql2/promise` for async/await
- Use transactions for multi-step operations (e.g., checkout)
- Always release connections back to pool in `finally` blocks

### Error Handling

- Wrap all async controller and service functions in try/catch
- Use the centralized `error.middleware.ts` as the last Express middleware
- All error responses follow the standard format:
  ```json
  {
    "error": {
      "message": "User-friendly message",
      "code": "ERROR_CODE",
      "status": 400
    }
  }
  ```
- Never expose stack traces or raw database errors to clients
- Use `process.env.NODE_ENV` to sanitize production error output

---

## Authentication Strategy

- JWT stored in client `localStorage` (MVP approach)
- Token signed with `JWT_SECRET` from environment variable
- Token payload: `{ userId, email }`
- Token expiry set via `JWT_EXPIRES_IN` environment variable
- All protected routes use `auth.middleware.ts` which attaches `req.user`
- User ID is always taken from `req.user` — never from request body or query params

---

## API Client Conventions (Frontend)

- Single Axios instance in `src/api/apiClient.ts`
- Base URL set from `import.meta.env.VITE_API_URL`
- Request interceptor: reads `localStorage.getItem('token')` and injects `Authorization: Bearer <token>`
- Response interceptor: clears token on 401 but does not aggressively redirect (prevents redirect loops during `AuthContext` initialization)
- No component may call `axios` directly — all calls go through domain API modules

---

## Frontend State Management

- `AuthContext`: user, token, isAuthenticated, loading — provides `login`, `signup`, `logout`
- `CartContext`: cart items, total, itemCount — provides `addToCart`, `updateQuantity`, `removeItem`, `refreshCart`, `clearCartState`
- Page-level state: `useState` for filters, forms, loading flags
- No Redux or external state library for MVP

---

## UI Standards

- Tailwind CSS utility classes only — no custom CSS files except `index.css` for Tailwind directives
- Mobile-first responsive design
- Product grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Cards: `bg-white border border-gray-200 rounded-lg shadow-sm`
- Primary button: `bg-blue-600 hover:bg-blue-700 text-white rounded-lg`
- Every async operation must show: loading state, error state, empty state
- Image loading failures must show a fallback SVG placeholder

---

## Security Constraints

- Never commit `.env` files — always provide `.env.example` with placeholder values
- Never log passwords, tokens, or sensitive data
- Passwords hashed with bcryptjs (10 salt rounds)
- SQL injection prevented by parameterized queries
- CORS configured for the specific frontend origin only
- Server-side price calculation — frontend prices are never trusted

---

## Documentation Rules

- `server/plan.md` — source of truth for backend architecture
- `client/plan.md` — source of truth for frontend architecture
- `server/README.md` — backend setup, environment variables, API reference
- `client/README.md` — frontend setup, environment variables, implemented features
- `docs/manual-interventions.md` — all manual fixes with reason and impact
- `docs/ai-interactions.md` — prompts, tools, and models used
- Update documentation when setup or API changes

---

## Verification Rules

- Test each phase with manual curl (backend) or browser (frontend) before proceeding
- Test both happy path and error cases
- Verify authentication and user ownership rules specifically
- Check that no secrets appear in any committed file
- TypeScript must compile without errors: `npm run build`

---

## What AI Must Not Do

- Do not introduce libraries not already in the plan without justification
- Do not duplicate API logic across components
- Do not hardcode API URLs — use environment variables
- Do not calculate prices or totals in the frontend
- Do not trust user IDs from request body — always use `req.user.userId`
- Do not expose stack traces or internal error messages to clients
- Do not commit `.env` or any file containing real credentials
- Do not silently deviate from `plan.md` — document any necessary changes
- Do not over-engineer — keep the implementation at the minimum complexity needed
