# Backend Verification Checklist

This document tracks verification of the e-commerce backend server. Items are separated into three sections: what has been manually verified, what is pending verification, and the full reference checklist for future runs.

---

## Verified Manually

The following were verified by running the server and executing curl commands against the live API (localhost:4000).

### Build & Startup

- [x] `npm run build` completes without errors
- [x] `dist/` directory is created with compiled JavaScript
- [x] `npm run dev` starts server without errors
- [x] Server listens on port 4000
- [x] Database connects on startup

### Health

- [x] `GET /api/health` returns `{"status":"ok","message":"Server is running"}`

### Authentication

- [x] `POST /api/auth/signup` with valid data returns 201, token, and user (no password_hash)
- [x] `POST /api/auth/signup` with duplicate email returns 409
- [x] `POST /api/auth/signup` with missing fields returns 400
- [x] `POST /api/auth/login` with valid credentials returns 200 and token
- [x] `POST /api/auth/login` with wrong password returns 401 "Invalid credentials" (does not reveal which field)
- [x] `GET /api/auth/me` with valid token returns 200 and user profile
- [x] `GET /api/auth/me` without token returns 401
- [x] `GET /api/auth/me` with invalid token returns 401

### Products

- [x] `GET /api/products` returns all 12 seeded products
- [x] `GET /api/products?category=Electronics` filters correctly
- [x] `GET /api/products?search=wireless` searches name and description
- [x] `GET /api/products?minPrice=50&maxPrice=200` filters by price range
- [x] `GET /api/products?minPrice=200&maxPrice=50` returns 400 (invalid range)
- [x] `GET /api/products/1` returns product detail
- [x] `GET /api/products/99999` returns 404
- [x] `GET /api/products/abc` returns 400

### Cart

- [x] `GET /api/cart` without token returns 401
- [x] `GET /api/cart` with token returns `{"cart":{"items":[],"total":0}}` when empty
- [x] `POST /api/cart/items` adds product and returns full cart
- [x] `POST /api/cart/items` with same product increases quantity (no duplicate row)
- [x] `POST /api/cart/items` with non-existent product returns 404
- [x] `POST /api/cart/items` with quantity 0 returns 400
- [x] `POST /api/cart/items` with negative quantity returns 400
- [x] `POST /api/cart/items` with missing product_id returns 400
- [x] `PUT /api/cart/items/:productId` updates quantity
- [x] `PUT /api/cart/items/:productId` with quantity 0 removes item
- [x] `DELETE /api/cart/items/:productId` removes item
- [x] Cart totals calculated server-side from database prices

### Orders & Checkout

- [x] `POST /api/orders` without token returns 401
- [x] `POST /api/orders` with empty cart returns 400
- [x] `POST /api/orders` with missing shipping fields returns 400
- [x] `POST /api/orders` with whitespace-only shipping fields returns 400
- [x] `POST /api/orders` with valid cart and shipping returns 201 with order
- [x] Order total matches server-side calculation (2 × $299.99 = $599.98 verified)
- [x] Cart is empty after successful checkout
- [x] `GET /api/orders` returns order history with nested items
- [x] `GET /api/orders` returns only the authenticated user's orders

### Security

- [x] `password_hash` never appears in any API response
- [x] All cart and order queries filter by `req.user.userId` (not request body)
- [x] SQL queries use parameterized placeholders — no string concatenation
- [x] `.env` is present in `.gitignore`
- [x] `.env.example` contains only placeholder values, no real secrets

---

## Pending Verification

These items require additional setup or deliberate failure injection to verify. They are not yet checked.

- [ ] Hot-reloading works when files are modified (`npm run dev`)
- [ ] `npm run db:init` re-runs cleanly from scratch (drop and reinitialize)
- [ ] `npm start` (production build) starts without errors after `npm run build`
- [ ] Transaction rolls back correctly when a failure is injected mid-checkout
- [ ] JWT tokens expire correctly after `JWT_EXPIRES_IN` duration
- [ ] Expired token returns 401
- [ ] Database connection pool handles exhaustion gracefully
- [ ] Server handles malformed JSON body without crashing (invalid Content-Type)

---

## Full Reference Checklist

Use this section when performing a full verification pass before a deployment or handoff.

---

## API Endpoint Verification

### ✅ Health Check

- [ ] GET /api/health returns 200 status
- [ ] Response contains `{"status":"ok","message":"Server is running"}`
- [ ] No authentication required

**Command**:
```bash
curl http://localhost:4000/api/health
```

---

### ✅ Authentication Endpoints

#### Signup

- [ ] POST /api/auth/signup with valid data returns 201
- [ ] Response contains `token` and `user` object
- [ ] User object excludes `password_hash`
- [ ] Duplicate email returns 409 error
- [ ] Missing fields return 400 error
- [ ] Invalid email format returns 400 error
- [ ] Short password (< 6 chars) returns 400 error

**Commands**:
```bash
# Valid signup
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"[EMAIL]","password":"password123"}'

# Duplicate email (should fail with 409)
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"[EMAIL]","password":"password123"}'
```

#### Login

- [ ] POST /api/auth/login with valid credentials returns 200
- [ ] Response contains `token` and `user` object
- [ ] Invalid credentials return 401 error
- [ ] Missing email or password returns 400 error
- [ ] Error message doesn't reveal which field is wrong (security)

**Commands**:
```bash
# Valid login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"[EMAIL]","password":"password123"}'

# Invalid credentials (should fail with 401)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"[EMAIL]","password":"wrongpassword"}'
```

#### Get Current User

- [ ] GET /api/auth/me with valid token returns 200
- [ ] Response contains user profile with `created_at`
- [ ] Missing token returns 401 error
- [ ] Invalid token returns 401 error
- [ ] Expired token returns 401 error

**Commands**:
```bash
# With valid token
TOKEN="your_token_here"
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Without token (should fail with 401)
curl http://localhost:4000/api/auth/me
```

---

### ✅ Product Endpoints

#### List Products

- [ ] GET /api/products returns 200
- [ ] Response contains array of products
- [ ] All 12 seeded products are returned
- [ ] No authentication required
- [ ] Search filter works (`?search=laptop`)
- [ ] Category filter works (`?category=Electronics`)
- [ ] Price range filters work (`?minPrice=50&maxPrice=200`)
- [ ] Multiple filters can be combined
- [ ] Invalid price parameters return 400 error

**Commands**:
```bash
# All products
curl http://localhost:4000/api/products

# Search
curl http://localhost:4000/api/products?search=wireless

# Category filter
curl http://localhost:4000/api/products?category=Electronics

# Price range
curl http://localhost:4000/api/products?minPrice=50&maxPrice=200

# Combined filters
curl "http://localhost:4000/api/products?category=Electronics&search=wireless&minPrice=50"
```

#### Get Single Product

- [ ] GET /api/products/:id returns 200 for valid ID
- [ ] Response contains complete product details
- [ ] Invalid ID (non-numeric) returns 400 error
- [ ] Non-existent ID returns 404 error
- [ ] No authentication required

**Commands**:
```bash
# Valid product
curl http://localhost:4000/api/products/1

# Invalid ID (should fail with 400)
curl http://localhost:4000/api/products/abc

# Non-existent ID (should fail with 404)
curl http://localhost:4000/api/products/9999
```

---

### ✅ Cart Endpoints

#### Get Cart

- [ ] GET /api/cart with valid token returns 200
- [ ] Response contains `items` array and `total`
- [ ] Empty cart returns `{"cart":{"items":[],"total":0}}`
- [ ] Missing token returns 401 error
- [ ] Cart items include product details (name, price, image_url)
- [ ] Subtotals calculated correctly (price * quantity)
- [ ] Total calculated correctly (sum of subtotals)

**Commands**:
```bash
# With token
curl http://localhost:4000/api/cart \
  -H "Authorization: Bearer $TOKEN"

# Without token (should fail with 401)
curl http://localhost:4000/api/cart
```

#### Add to Cart

- [ ] POST /api/cart/items with valid data returns 201
- [ ] Response contains updated cart
- [ ] Adding same product increases quantity
- [ ] Invalid product_id returns 400 error
- [ ] Invalid quantity returns 400 error
- [ ] Non-existent product returns 404 error
- [ ] Missing token returns 401 error

**Commands**:
```bash
# Add product
curl -X POST http://localhost:4000/api/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"quantity":2}'

# Add same product again (should increase quantity)
curl -X POST http://localhost:4000/api/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"quantity":1}'
```

#### Update Cart Item

- [ ] PUT /api/cart/items/:productId with valid data returns 200
- [ ] Response contains updated cart
- [ ] Setting quantity to 0 removes item
- [ ] Invalid product ID returns 400 error
- [ ] Invalid quantity returns 400 error
- [ ] Non-existent cart item returns 404 error
- [ ] Missing token returns 401 error

**Commands**:
```bash
# Update quantity
curl -X PUT http://localhost:4000/api/cart/items/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity":5}'

# Remove by setting quantity to 0
curl -X PUT http://localhost:4000/api/cart/items/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity":0}'
```

#### Remove from Cart

- [ ] DELETE /api/cart/items/:productId returns 200
- [ ] Response contains updated cart
- [ ] Operation is idempotent (no error if item doesn't exist)
- [ ] Invalid product ID returns 400 error
- [ ] Missing token returns 401 error

**Commands**:
```bash
# Remove item
curl -X DELETE http://localhost:4000/api/cart/items/1 \
  -H "Authorization: Bearer $TOKEN"

# Remove again (should still return 200)
curl -X DELETE http://localhost:4000/api/cart/items/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

### ✅ Order Endpoints

#### Create Order (Checkout)

- [ ] POST /api/orders with valid data returns 201
- [ ] Response contains created order with `id`, `total_amount`, `status`
- [ ] Order total matches cart total
- [ ] Cart is cleared after successful order
- [ ] Missing shipping fields return 400 error
- [ ] Empty cart returns 400 error
- [ ] Missing token returns 401 error
- [ ] Transaction rolls back on failure

**Commands**:
```bash
# First, add items to cart
curl -X POST http://localhost:4000/api/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"quantity":2}'

# Create order
curl -X POST http://localhost:4000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shipping_name":"Test User",
    "shipping_address":"123 Main St",
    "shipping_city":"New York",
    "shipping_country":"USA"
  }'

# Verify cart is cleared
curl http://localhost:4000/api/cart \
  -H "Authorization: Bearer $TOKEN"
```

#### Get Order History

- [ ] GET /api/orders with valid token returns 200
- [ ] Response contains array of orders
- [ ] Each order includes nested `items` array
- [ ] Orders sorted by created_at DESC (newest first)
- [ ] Only returns current user's orders
- [ ] Missing token returns 401 error

**Commands**:
```bash
# Get orders
curl http://localhost:4000/api/orders \
  -H "Authorization: Bearer $TOKEN"
```

---

## Security Verification

### ✅ Authentication & Authorization

- [ ] Protected routes reject requests without token (401)
- [ ] Protected routes reject requests with invalid token (401)
- [ ] Protected routes reject requests with expired token (401)
- [ ] Users cannot access other users' carts
- [ ] Users cannot access other users' orders
- [ ] JWT tokens expire based on JWT_EXPIRES_IN setting

---

### ✅ Password Security

- [ ] Passwords are hashed with bcrypt (not stored plain text)
- [ ] Password hashes are never returned in API responses
- [ ] Password hashes are never logged
- [ ] Signup validates password length (minimum 6 characters)

---

### ✅ SQL Injection Protection

- [ ] All database queries use parameterized queries
- [ ] No string concatenation in SQL queries
- [ ] User input is never directly interpolated into SQL

---

### ✅ Price Integrity

- [ ] Product prices always fetched from database
- [ ] Frontend-provided prices are never trusted
- [ ] Cart totals calculated server-side
- [ ] Order totals calculated server-side
- [ ] Order items store price snapshot at time of order

---

### ✅ User Ownership

- [ ] Cart operations filter by authenticated user_id
- [ ] Order operations filter by authenticated user_id
- [ ] User ID taken from req.user (set by auth middleware)
- [ ] User ID never accepted from request body or query params

---

### ✅ Error Handling

- [ ] All errors return consistent JSON format
- [ ] Error responses include `message`, `code`, and `status`
- [ ] Stack traces not exposed in production
- [ ] Database errors not exposed to client
- [ ] Proper HTTP status codes used (400, 401, 404, 409, 500)

---

### ✅ Environment Configuration

- [ ] .env file exists and contains all required variables
- [ ] .env file is in .gitignore
- [ ] .env.example provided as template
- [ ] JWT_SECRET is strong and unique
- [ ] No secrets committed to version control

---

## Database Verification

### ✅ Schema Integrity

- [ ] All 5 tables exist (users, products, cart_items, orders, order_items)
- [ ] Foreign key constraints are properly defined
- [ ] Unique constraints work (e.g., user email, cart user_id+product_id)
- [ ] Cascade deletes work correctly
- [ ] Timestamps (created_at, updated_at) auto-populate

**Commands**:
```bash
# Check tables
mysql -u root -p helfy_ecommerce -e "SHOW TABLES;"

# Check foreign keys
mysql -u root -p helfy_ecommerce -e "
  SELECT TABLE_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = 'helfy_ecommerce'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
"
```

---

### ✅ Data Integrity

- [ ] Sample products seeded correctly (12 products)
- [ ] Product prices are DECIMAL(10,2)
- [ ] Order totals are DECIMAL(10,2)
- [ ] Quantities are INT
- [ ] Dates are TIMESTAMP

---

## Transaction Verification

### ✅ Checkout Transaction

- [ ] Order creation is atomic
- [ ] Order items insertion is atomic
- [ ] Cart clearing is atomic
- [ ] Transaction rolls back on any failure
- [ ] Database connection released after transaction

**Test**: Simulate failure during checkout (e.g., disconnect database mid-transaction) and verify rollback.

---

## Error Response Verification

### ✅ Consistent Error Format

Test each error scenario and verify response format:

```json
{
  "error": {
    "message": "User-friendly message",
    "code": "ERROR_CODE",
    "status": 400
  }
}
```

- [ ] 400 errors have VALIDATION_ERROR code
- [ ] 401 errors have UNAUTHORIZED code
- [ ] 404 errors have appropriate NOT_FOUND codes
- [ ] 409 errors have conflict codes (e.g., EMAIL_EXISTS)
- [ ] 500 errors have INTERNAL_ERROR code

---

## Performance Verification

### ✅ Database Connection Pooling

- [ ] Connection pool configured with limits
- [ ] Connections reused efficiently
- [ ] No connection leaks
- [ ] Connections released after queries

---

### ✅ Query Efficiency

- [ ] Product filtering uses indexed columns
- [ ] Cart queries use user_id index
- [ ] Order queries use user_id index
- [ ] No N+1 query problems

---

## Documentation Verification

### ✅ README.md

- [ ] Installation instructions are clear
- [ ] All environment variables documented
- [ ] All API endpoints documented
- [ ] Example curl commands provided
- [ ] Manual verification flow included
- [ ] Known limitations documented

---

### ✅ Code Documentation

- [ ] Complex logic has comments
- [ ] Type definitions are clear
- [ ] Function purposes are documented
- [ ] Security considerations noted

---

## Final Checklist

### ✅ Production Readiness

- [ ] TypeScript compiles without errors
- [ ] All endpoints tested and working
- [ ] Authentication and authorization working
- [ ] Error handling consistent
- [ ] Security best practices followed
- [ ] Database schema correct
- [ ] Transactions working
- [ ] Documentation complete
- [ ] Environment variables configured
- [ ] .env not committed to git

---

## Summary

**Total Checks**: 150+  
**Critical Security Checks**: 20+  
**API Endpoint Checks**: 50+  
**Database Checks**: 15+

---

## Notes

- This checklist should be completed before deploying to production
- All critical security checks must pass
- Document any failures or deviations
- Re-run verification after any significant changes

---

## Verification Status

Date: 2026-05-24
Verified By: Manual curl testing against localhost:4000
Status: ☑ Partial — happy path and edge cases verified; failure injection and expiry tests pending
Notes: All critical functionality verified. Pending items are environment-specific tests that require deliberate failure injection or waiting for token expiry.
