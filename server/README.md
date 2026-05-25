# E-Commerce Backend Server

A production-ready TypeScript-based Express backend for an e-commerce platform with JWT authentication, MySQL database, and RESTful API.

## Overview

This is the backend server for a full-featured e-commerce platform that provides:

- **User Authentication**: Secure signup and login with JWT-based authentication and bcrypt password hashing
- **Product Catalog**: Browse products with search, category filtering, and price range filters
- **Persistent Shopping Cart**: User-specific cart management with server-side price calculation
- **Checkout & Orders**: Complete order processing with transaction safety and order history
- **User Ownership**: All cart and order operations are scoped to the authenticated user

## Tech Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL (v8+)
- **Database Driver**: mysql2/promise (connection pooling)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Environment Config**: dotenv
- **CORS**: cors middleware

## Folder Structure

```
server/
├── src/
│   ├── index.ts                    # Application entry point
│   ├── app.ts                      # Express app configuration
│   ├── config/
│   │   └── db.ts                   # MySQL connection pool
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT authentication middleware
│   │   └── error.middleware.ts     # Centralized error handler
│   ├── routes/
│   │   ├── index.ts                # Route aggregator
│   │   ├── health.routes.ts        # Health check endpoint
│   │   ├── auth.routes.ts          # Authentication routes
│   │   ├── product.routes.ts       # Product routes
│   │   ├── cart.routes.ts          # Cart routes (protected)
│   │   └── order.routes.ts         # Order routes (protected)
│   ├── controllers/
│   │   ├── auth.controller.ts      # Auth request handlers
│   │   ├── product.controller.ts   # Product request handlers
│   │   ├── cart.controller.ts      # Cart request handlers
│   │   └── order.controller.ts     # Order request handlers
│   ├── services/
│   │   ├── auth.service.ts         # Auth business logic
│   │   ├── product.service.ts      # Product business logic
│   │   ├── cart.service.ts         # Cart business logic
│   │   └── order.service.ts        # Order business logic
│   ├── types/
│   │   ├── auth.types.ts           # Auth-related types
│   │   ├── product.types.ts        # Product-related types
│   │   ├── cart.types.ts           # Cart-related types
│   │   ├── order.types.ts          # Order-related types
│   │   └── express.d.ts            # Express type extensions (req.user)
│   └── db/
│       ├── schema.sql              # Database schema definition
│       ├── seed.sql                # Sample data for development
│       └── init-db.ts              # Database initialization script
├── .env                            # Environment variables (gitignored)
├── .env.example                    # Environment template
├── package.json
├── tsconfig.json                   # TypeScript configuration
├── plan.md                         # Backend implementation plan
└── README.md                       # This file
```

## Environment Variables

Create a `.env` file in the server root directory with the following variables:

```env
# Server Configuration
PORT=4000
CLIENT_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=helfy_ecommerce

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
```

### Variable Descriptions

- **PORT**: Server port (default: 4000)
- **CLIENT_URL**: Frontend URL for CORS configuration
- **DB_HOST**: MySQL host address
- **DB_PORT**: MySQL port (default: 3306)
- **DB_USER**: MySQL username
- **DB_PASSWORD**: MySQL password
- **DB_NAME**: MySQL database name
- **JWT_SECRET**: Secret key for signing JWT tokens (must be strong and unique in production)
- **JWT_EXPIRES_IN**: JWT token expiration time (e.g., '7d', '24h', '30m')

**⚠️ Important**: Never commit the `.env` file to version control. Use `.env.example` as a template.

## Running with Docker Compose (recommended)

The easiest way to run the full stack is from the project root:

```bash
docker compose up --build
```

This starts MySQL, runs `db:init` automatically, and launches the server on port 4000. No local Node.js or MySQL installation required.

See the root `README.md` and `INSTRUCTIONS.md` for full Docker instructions.

---

## Manual Installation

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher) running locally or remotely
- npm or yarn

### Steps

1. **Navigate to the server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and update with your actual values (especially `DB_PASSWORD` and `JWT_SECRET`).

## Database Setup

**Important**: Ensure MySQL is running before proceeding.

### Start MySQL (macOS with Homebrew)
```bash
brew services start mysql
```

### Initialize Database

Run the database initialization script to create tables and seed sample data:

```bash
npm run db:init
```

This script will:
- Connect to MySQL server
- Create the `helfy_ecommerce` database if it doesn't exist
- Create all required tables (users, products, cart_items, orders, order_items)
- Seed the database with 12 sample products

### Verify Database Setup

```bash
# Check tables
mysql -u root -p helfy_ecommerce -e "SHOW TABLES;"

# Check sample products
mysql -u root -p helfy_ecommerce -e "SELECT id, name, price, category FROM products;"
```

## Running the Server

### Development Mode (with hot-reloading)
```bash
npm run dev
```
Server starts on `http://localhost:4000`

### Production Build
```bash
npm run build
npm start
```

### Available Scripts

- `npm run dev` - Start development server with hot-reloading (ts-node-dev)
- `npm run build` - Compile TypeScript to JavaScript (output in `dist/`)
- `npm start` - Run production server from compiled code
- `npm run db:init` - Initialize database (create tables and seed data)

## API Documentation

All API endpoints return JSON responses. Protected routes require a JWT Bearer token in the `Authorization` header.

### Error Response Format

All errors return a consistent JSON structure:

```json
{
  "error": {
    "message": "User-friendly error message",
    "code": "ERROR_CODE",
    "status": 400
  }
}
```

**HTTP Status Codes Used:**
- `200` - Success
- `201` - Created
- `400` - Validation error or bad request
- `401` - Unauthorized (missing, invalid, or expired token)
- `404` - Resource not found
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal server error

---

### Health Check

#### `GET /api/health`

Check if the server is running.

**Authentication**: Not required

**Response** (200):
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

**Example**:
```bash
curl http://localhost:4000/api/health
```

---

### Authentication Endpoints

#### `POST /api/auth/signup`

Create a new user account.

**Authentication**: Not required

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** (201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors**:
- `400` - Missing required fields or invalid email format
- `409` - Email already exists

**Example**:
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "secret123"}'
```

---

#### `POST /api/auth/login`

Authenticate an existing user.

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors**:
- `400` - Missing email or password
- `401` - Invalid credentials

**Example**:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "secret123"}'
```

---

#### `GET /api/auth/me`

Get the current authenticated user's profile.

**Authentication**: Required (Bearer token)

**Response** (200):
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-01-01T00:00:00.000Z"
  }
}
```

**Errors**:
- `401` - Missing or invalid token
- `404` - User not found

**Example**:
```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Product Endpoints

#### `GET /api/products`

Get all products with optional filtering.

**Authentication**: Not required

**Query Parameters** (all optional):
- `search` - Search in product name or description
- `category` - Filter by exact category match
- `minPrice` - Minimum price (inclusive)
- `maxPrice` - Maximum price (inclusive)

**Response** (200):
```json
{
  "products": [
    {
      "id": 1,
      "name": "Wireless Bluetooth Headphones",
      "description": "High-quality wireless headphones with noise cancellation",
      "price": 79.99,
      "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      "category": "Electronics",
      "stock": 50,
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

**Errors**:
- `400` - Invalid price parameters

**Examples**:
```bash
# Get all products
curl http://localhost:4000/api/products

# Search for products
curl http://localhost:4000/api/products?search=laptop

# Filter by category
curl http://localhost:4000/api/products?category=Electronics

# Filter by price range
curl http://localhost:4000/api/products?minPrice=50&maxPrice=200

# Combine filters
curl "http://localhost:4000/api/products?category=Electronics&minPrice=100&maxPrice=500&search=wireless"
```

---

#### `GET /api/products/:id`

Get a single product by ID.

**Authentication**: Not required

**Response** (200):
```json
{
  "product": {
    "id": 1,
    "name": "Wireless Bluetooth Headphones",
    "description": "High-quality wireless headphones with noise cancellation",
    "price": 79.99,
    "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    "category": "Electronics",
    "stock": 50,
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
}
```

**Errors**:
- `400` - Invalid product ID
- `404` - Product not found

**Example**:
```bash
curl http://localhost:4000/api/products/1
```

---

### Cart Endpoints

**All cart endpoints require authentication via Bearer token.**

#### `GET /api/cart`

Get the current user's shopping cart.

**Authentication**: Required

**Response** (200):
```json
{
  "cart": {
    "items": [
      {
        "id": 1,
        "product_id": 5,
        "product_name": "Ergonomic Office Chair",
        "product_price": 399.99,
        "product_image_url": "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500",
        "category": "Home",
        "stock": 23,
        "quantity": 2,
        "subtotal": 799.98
      }
    ],
    "total": 799.98
  }
}
```

**Errors**:
- `401` - Missing or invalid token

**Example**:
```bash
curl http://localhost:4000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

#### `POST /api/cart/items`

Add a product to the cart. If the product already exists, quantity is increased.

**Authentication**: Required

**Request Body**:
```json
{
  "product_id": 5,
  "quantity": 2
}
```

**Response** (201):
```json
{
  "message": "Product added to cart",
  "cart": {
    "items": [
      {
        "id": 1,
        "product_id": 5,
        "product_name": "Ergonomic Office Chair",
        "product_price": 399.99,
        "product_image_url": "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500",
        "category": "Home",
        "stock": 23,
        "quantity": 2,
        "subtotal": 799.98
      }
    ],
    "total": 799.98
  }
}
```

**Errors**:
- `400` - Invalid product_id or quantity
- `401` - Missing or invalid token
- `404` - Product not found

**Example**:
```bash
curl -X POST http://localhost:4000/api/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 5, "quantity": 2}'
```

---

#### `PUT /api/cart/items/:productId`

Update the quantity of a cart item. Setting quantity to 0 removes the item.

**Authentication**: Required

**Request Body**:
```json
{
  "quantity": 3
}
```

**Response** (200):
```json
{
  "message": "Cart item updated",
  "cart": {
    "items": [
      {
        "id": 1,
        "product_id": 5,
        "product_name": "Ergonomic Office Chair",
        "product_price": 399.99,
        "product_image_url": "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500",
        "category": "Home",
        "stock": 23,
        "quantity": 3,
        "subtotal": 1199.97
      }
    ],
    "total": 1199.97
  }
}
```

**Errors**:
- `400` - Invalid product ID or quantity
- `401` - Missing or invalid token
- `404` - Cart item not found

**Example**:
```bash
curl -X PUT http://localhost:4000/api/cart/items/5 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}'
```

---

#### `DELETE /api/cart/items/:productId`

Remove a product from the cart.

**Authentication**: Required

**Response** (200):
```json
{
  "message": "Product removed from cart",
  "cart": {
    "items": [],
    "total": 0
  }
}
```

**Errors**:
- `400` - Invalid product ID
- `401` - Missing or invalid token

**Example**:
```bash
curl -X DELETE http://localhost:4000/api/cart/items/5 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Order Endpoints

**All order endpoints require authentication via Bearer token.**

#### `POST /api/orders`

Create an order from the current cart (checkout). Cart is cleared after successful order creation.

**Authentication**: Required

**Request Body**:
```json
{
  "shipping_name": "John Doe",
  "shipping_address": "123 Main St",
  "shipping_city": "New York",
  "shipping_country": "USA"
}
```

**Response** (201):
```json
{
  "message": "Order created successfully",
  "order": {
    "id": 1,
    "user_id": 1,
    "total_amount": 159.98,
    "status": "pending",
    "shipping_name": "John Doe",
    "shipping_address": "123 Main St",
    "shipping_city": "New York",
    "shipping_country": "USA",
    "created_at": "2026-01-01T00:00:00.000Z"
  }
}
```

**Errors**:
- `400` - Missing required shipping fields or empty cart
- `401` - Missing or invalid token

**Example**:
```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "shipping_name": "John Doe",
    "shipping_address": "123 Main St",
    "shipping_city": "New York",
    "shipping_country": "USA"
  }'
```

---

#### `GET /api/orders`

Get the authenticated user's order history with nested order items.

**Authentication**: Required

**Response** (200):
```json
{
  "orders": [
    {
      "id": 1,
      "total_amount": 159.98,
      "status": "pending",
      "shipping_name": "John Doe",
      "shipping_address": "123 Main St",
      "shipping_city": "New York",
      "shipping_country": "USA",
      "created_at": "2026-01-01T00:00:00.000Z",
      "items": [
        {
          "id": 1,
          "product_id": 1,
          "product_name": "Wireless Bluetooth Headphones",
          "product_price": 79.99,
          "quantity": 2
        }
      ]
    }
  ]
}
```

**Errors**:
- `401` - Missing or invalid token

**Example**:
```bash
curl http://localhost:4000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Manual Verification Flow

Follow this step-by-step flow to manually verify all backend functionality:

### 1. Health Check
```bash
curl http://localhost:4000/api/health
```
Expected: `{"status":"ok","message":"Server is running"}`

### 2. Signup
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```
Expected: Returns `token` and `user` object. **Copy the token for next steps.**

### 3. Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
Expected: Returns `token` and `user` object.

### 4. Get Current User
```bash
TOKEN="YOUR_TOKEN_HERE"
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```
Expected: Returns user profile with `id`, `name`, `email`, `created_at`.

### 5. Get Products
```bash
curl http://localhost:4000/api/products
```
Expected: Returns array of 12 seeded products.

### 6. Get Single Product
```bash
curl http://localhost:4000/api/products/1
```
Expected: Returns product details for product ID 1.

### 7. Add Product to Cart
```bash
curl -X POST http://localhost:4000/api/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"quantity":2}'
```
Expected: Returns cart with added product.

### 8. Get Cart
```bash
curl http://localhost:4000/api/cart \
  -H "Authorization: Bearer $TOKEN"
```
Expected: Returns cart with items and total.

### 9. Update Cart Quantity
```bash
curl -X PUT http://localhost:4000/api/cart/items/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity":3}'
```
Expected: Returns updated cart with new quantity.

### 10. Create Order (Checkout)
```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shipping_name":"Test User",
    "shipping_address":"123 Main St",
    "shipping_city":"New York",
    "shipping_country":"USA"
  }'
```
Expected: Returns created order with `id`, `total_amount`, `status`, shipping details.

### 11. Verify Cart is Cleared
```bash
curl http://localhost:4000/api/cart \
  -H "Authorization: Bearer $TOKEN"
```
Expected: Returns empty cart `{"cart":{"items":[],"total":0}}`.

### 12. Get Order History
```bash
curl http://localhost:4000/api/orders \
  -H "Authorization: Bearer $TOKEN"
```
Expected: Returns array with the created order and nested items.

---

## Known Limitations

This is an MVP backend with the following intentional limitations:

- **No Payment Integration**: Orders are created but no actual payment processing (Stripe, PayPal, etc.)
- **No Admin Panel**: No admin routes for product management (products managed via SQL/seed scripts)
- **Simple Validation**: Manual validation instead of validation library (Joi, Zod, etc.)
- **No Refresh Tokens**: Single JWT token flow; users must re-login after token expires
- **No Rate Limiting**: API endpoints are not rate-limited (vulnerable to abuse in production)
- **No Automated Tests**: No test suite yet (manual testing only)
- **No Pagination**: Products and orders return all results (performance issues with large datasets)
- **No Stock Validation**: No stock checking or reservation during checkout
- **No Email Notifications**: No order confirmation emails

These limitations are acceptable for an MVP and can be addressed in future phases.

---

## Security Features

- ✅ Passwords hashed with bcrypt (salt rounds: 10)
- ✅ JWT-based stateless authentication
- ✅ User ownership enforcement (users can only access their own cart/orders)
- ✅ Server-side price calculation (never trust frontend prices)
- ✅ Parameterized SQL queries (SQL injection protection)
- ✅ CORS configured for specific frontend origin
- ✅ Consistent error handling (no stack traces in production)
- ✅ Environment-based configuration (secrets in .env)

---

## Development Guidelines

- Follow the engineering principles defined in `plan.md`
- Use TypeScript strictly (avoid `any` type)
- Keep controllers thin, business logic in services
- Use centralized error handling
- Never commit `.env` file
- Test endpoints after each implementation
- Maintain consistent code style

---

## License

ISC
