# Backend Implementation Plan - E-Commerce Platform

## 1. Backend Goal

The backend serves as the foundation for a maintainable e-commerce platform that supports:

- **User Management**: Secure signup, login, and profile management with JWT-based authentication
- **Product Catalog**: Browse products with search, filtering, and detailed product views
- **Shopping Cart**: Persistent cart management tied to authenticated users
- **Order Processing**: Checkout flow, order creation, and order history
- **Data Integrity**: Authenticated user ownership for carts and orders, server-side price validation

The backend must be scalable, maintainable, and provide a clear separation of concerns between routing, business logic, and data access.

---

## 2. Engineering Principles

### Core Development Rules

1. **TypeScript First**: All code must be written in TypeScript with proper type definitions
2. **Simple but Maintainable Architecture**: Follow clear patterns without over-engineering
3. **Thin Controllers**: Controllers handle HTTP concerns only (request/response)
4. **Business Logic in Services**: All business logic lives in service layer
5. **Centralized Database Access**: Use a single MySQL connection pool configured in `config/db.ts`
6. **Environment-Based Configuration**: All configuration via environment variables
7. **Centralized Error Handling**: Single error middleware for consistent error responses
8. **Consistent API Responses**: Standardized JSON response format across all endpoints
9. **No Hardcoded Secrets**: Never commit secrets, use `.env` with `.env.example` template
10. **Authenticated Ownership**: Cart and orders must belong to authenticated user only

### Code Quality Standards

- Readable, self-documenting code
- Proper error handling at every layer
- Type safety throughout the application
- Clear separation between layers (routes → controllers → services → database)

---

## 3. Proposed Folder Structure

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
│   │   ├── cart.routes.ts          # Cart routes
│   │   └── order.routes.ts         # Order routes
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
└── plan.md                         # This file
```

---

## 4. Database Design Plan

### Tables

#### **users**
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Purpose**: Store user account information with hashed passwords

---

#### **products**
```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  category VARCHAR(100),
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Purpose**: Store product catalog with pricing and inventory

---

#### **cart_items**
```sql
CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id)
);
```

**Purpose**: Store user shopping cart items
**Ownership**: Each cart item belongs to a specific user
**Constraint**: One cart item per user-product combination (quantity increases for duplicates)

---

#### **orders**
```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  shipping_name VARCHAR(255) NOT NULL,
  shipping_address VARCHAR(500) NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_country VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Purpose**: Store order headers with shipping information
**Ownership**: Each order belongs to a specific user
**Status Values**: 'pending', 'processing', 'shipped', 'delivered', 'cancelled'

---

#### **order_items**
```sql
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

**Purpose**: Store order line items with product snapshot
**Snapshot Strategy**: Store product name and price at time of order (historical record)

---

### Relationships

- **users → cart_items**: One-to-Many (user can have multiple cart items)
- **products → cart_items**: One-to-Many (product can be in multiple carts)
- **users → orders**: One-to-Many (user can have multiple orders)
- **orders → order_items**: One-to-Many (order contains multiple items)
- **products → order_items**: One-to-Many (product can be in multiple orders)

### Ownership Rules

1. Cart items are **always** filtered by authenticated user ID
2. Orders are **always** filtered by authenticated user ID
3. Users can **only** access their own cart and orders
4. Product catalog is public (no user filtering)

---

## 5. API Contract Plan

### Health

#### `GET /api/health`
- **Purpose**: Check if server is running
- **Authentication**: Not required
- **Response**:
  ```json
  {
    "status": "ok",
    "message": "Server is running"
  }
  ```
- **Errors**: None (always returns 200)

---

### Authentication

#### `POST /api/auth/signup`
- **Purpose**: Create new user account
- **Authentication**: Not required
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```
- **Response** (201):
  ```json
  {
    "token": "jwt.token.here",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```
- **Errors**:
  - 400: Missing required fields
  - 409: Email already exists
  - 500: Server error

#### `POST /api/auth/login`
- **Purpose**: Authenticate existing user
- **Authentication**: Not required
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```
- **Response** (200):
  ```json
  {
    "token": "jwt.token.here",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```
- **Errors**:
  - 400: Missing email or password
  - 401: Invalid credentials
  - 500: Server error

#### `GET /api/auth/me`
- **Purpose**: Get current authenticated user profile
- **Authentication**: Required (Bearer token)
- **Response** (200):
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
- **Errors**:
  - 401: Missing or invalid token
  - 404: User not found
  - 500: Server error

---

### Products

#### `GET /api/products`
- **Purpose**: Get all products with optional filtering
- **Authentication**: Not required
- **Query Parameters** (optional):
  - `category`: Filter by category
  - `search`: Search in name/description
  - `minPrice`: Minimum price filter
  - `maxPrice`: Maximum price filter
- **Response** (200):
  ```json
  {
    "products": [
      {
        "id": 1,
        "name": "Product Name",
        "description": "Product description",
        "price": 29.99,
        "image_url": "https://example.com/image.jpg",
        "category": "Electronics",
        "stock": 50
      }
    ]
  }
  ```
- **Errors**:
  - 500: Server error

#### `GET /api/products/:id`
- **Purpose**: Get single product details
- **Authentication**: Not required
- **Response** (200):
  ```json
  {
    "product": {
      "id": 1,
      "name": "Product Name",
      "description": "Detailed product description",
      "price": 29.99,
      "image_url": "https://example.com/image.jpg",
      "category": "Electronics",
      "stock": 50,
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  }
  ```
- **Errors**:
  - 404: Product not found
  - 500: Server error

---

### Cart

#### `GET /api/cart`
- **Purpose**: Get current user's cart with product details
- **Authentication**: Required (Bearer token)
- **Response** (200):
  ```json
  {
    "cart": {
      "items": [
        {
          "id": 1,
          "product_id": 5,
          "product_name": "Product Name",
          "product_price": 29.99,
          "product_image_url": "https://example.com/image.jpg",
          "quantity": 2,
          "subtotal": 59.98
        }
      ],
      "total": 59.98
    }
  }
  ```
- **Errors**:
  - 401: Missing or invalid token
  - 500: Server error

#### `POST /api/cart/items`
- **Purpose**: Add product to cart (or increase quantity if exists)
- **Authentication**: Required (Bearer token)
- **Request Body**:
  ```json
  {
    "product_id": 5,
    "quantity": 1
  }
  ```
- **Response** (201):
  ```json
  {
    "message": "Product added to cart",
    "cart_item": {
      "id": 1,
      "product_id": 5,
      "quantity": 1
    }
  }
  ```
- **Errors**:
  - 400: Missing product_id or invalid quantity
  - 401: Missing or invalid token
  - 404: Product not found
  - 500: Server error

#### `PUT /api/cart/items/:productId`
- **Purpose**: Update quantity of cart item
- **Authentication**: Required (Bearer token)
- **Request Body**:
  ```json
  {
    "quantity": 3
  }
  ```
- **Response** (200):
  ```json
  {
    "message": "Cart item updated",
    "cart_item": {
      "id": 1,
      "product_id": 5,
      "quantity": 3
    }
  }
  ```
- **Errors**:
  - 400: Invalid quantity
  - 401: Missing or invalid token
  - 404: Cart item not found
  - 500: Server error

#### `DELETE /api/cart/items/:productId`
- **Purpose**: Remove product from cart
- **Authentication**: Required (Bearer token)
- **Response** (200):
  ```json
  {
    "message": "Product removed from cart"
  }
  ```
- **Errors**:
  - 401: Missing or invalid token
  - 404: Cart item not found
  - 500: Server error

---

### Orders

#### `POST /api/orders`
- **Purpose**: Create order from current cart (checkout)
- **Authentication**: Required (Bearer token)
- **Request Body**:
  ```json
  {
    "shipping_name": "John Doe",
    "shipping_address": "123 Main St",
    "shipping_city": "New York",
    "shipping_country": "USA"
  }
  ```
- **Response** (201):
  ```json
  {
    "message": "Order created successfully",
    "order": {
      "id": 1,
      "user_id": 1,
      "total_amount": 59.98,
      "status": "pending",
      "shipping_name": "John Doe",
      "shipping_address": "123 Main St",
      "shipping_city": "New York",
      "shipping_country": "USA",
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  }
  ```
- **Errors**:
  - 400: Missing shipping information or empty cart
  - 401: Missing or invalid token
  - 500: Server error

#### `GET /api/orders`
- **Purpose**: Get current user's order history
- **Authentication**: Required (Bearer token)
- **Response** (200):
  ```json
  {
    "orders": [
      {
        "id": 1,
        "total_amount": 59.98,
        "status": "pending",
        "shipping_name": "John Doe",
        "shipping_address": "123 Main St",
        "shipping_city": "New York",
        "shipping_country": "USA",
        "created_at": "2026-01-01T00:00:00.000Z",
        "items": [
          {
            "id": 1,
            "product_id": 5,
            "product_name": "Product Name",
            "product_price": 29.99,
            "quantity": 2
          }
        ]
      }
    ]
  }
  ```
- **Errors**:
  - 401: Missing or invalid token
  - 500: Server error

---

## 6. Authentication Strategy

### Signup Flow

1. User submits name, email, and password
2. Backend validates required fields
3. Backend checks if email already exists
4. Password is hashed using bcryptjs (salt rounds: 10)
5. User record is created in database
6. JWT token is generated and returned
7. Frontend stores token in localStorage/sessionStorage

### Login Flow

1. User submits email and password
2. Backend validates required fields
3. Backend queries user by email
4. Password is compared with stored hash using bcryptjs
5. If valid, JWT token is generated and returned
6. Frontend stores token

### Password Hashing

- Use `bcryptjs.hash(password, 10)` for hashing
- Use `bcryptjs.compare(password, hash)` for verification
- Never store plain text passwords
- Never log passwords

### JWT Payload

```typescript
{
  userId: number;
  email: string;
  iat: number;  // issued at
  exp: number;  // expiration
}
```

### Bearer Token Format

- Frontend sends token in Authorization header: `Authorization: Bearer <token>`
- Backend extracts token from header
- Backend verifies token using JWT_SECRET

### Auth Middleware Behavior

```typescript
// Pseudo-code
export const authMiddleware = async (req, res, next) => {
  // 1. Extract token from Authorization header
  // 2. Verify token with JWT_SECRET
  // 3. Decode payload to get userId
  // 4. Attach user info to req.user
  // 5. Call next() if valid
  // 6. Return 401 if invalid/missing
}
```

### TypeScript req.user Typing

Create `src/types/express.d.ts`:

```typescript
declare namespace Express {
  export interface Request {
    user?: {
      userId: number;
      email: string;
    };
  }
}
```

This extends Express Request type to include optional `user` property.

---

## 7. Cart Strategy

### Core Principles

1. **User Ownership**: Cart belongs to authenticated user only
2. **Persistence**: Cart is stored in database, not session
3. **Product Relationship**: Cart items reference products by ID

### Adding to Cart

- If product already in cart: **increase quantity**
- If product not in cart: **create new cart item**
- Use `INSERT ... ON DUPLICATE KEY UPDATE` or check-then-insert pattern

### Updating Cart

- Update quantity of existing cart item
- If quantity is 0: **remove item** (or handle via separate delete)
- Validate quantity > 0

### Removing from Cart

- Delete cart item by product_id and user_id
- Return success even if item doesn't exist (idempotent)

### Cart Response

- Join cart_items with products table
- Include product details (name, price, image_url)
- Calculate subtotal per item: `price * quantity`
- Calculate cart total: sum of all subtotals
- Return structured response with items array and total

### Cart Clearing

- After successful order creation, delete all cart items for user
- Use transaction to ensure atomicity

---

## 8. Checkout and Order Strategy

### Order Creation Flow

1. User submits shipping information
2. Backend validates shipping fields
3. Backend retrieves user's cart items
4. Backend validates cart is not empty
5. Backend fetches current product prices from database (**not from frontend**)
6. Backend calculates total amount from database prices
7. Backend creates order record with total and shipping info
8. Backend creates order_items with product snapshot (name, price at time of order)
9. Backend clears user's cart
10. Backend returns order confirmation

### Price Calculation

- **Never trust frontend prices**
- Always fetch current prices from products table
- Calculate total server-side: `SUM(products.price * cart_items.quantity)`
- Store snapshot prices in order_items for historical accuracy

### Product Snapshot

- Store `product_name` and `product_price` in order_items
- This preserves order details even if product is updated/deleted later
- Order history shows what user actually paid

### Cart Clearing

- After successful order creation, delete all cart_items for user
- Use database transaction to ensure:
  - Order is created
  - Order items are created
  - Cart is cleared
  - All or nothing (rollback on error)

### Order History

- Query orders by user_id only
- Join with order_items to get line items
- Return orders with nested items array
- Sort by created_at DESC (newest first)

---

## 9. Error Handling Strategy

### Centralized Error Middleware

Create `src/middleware/error.middleware.ts` that catches all errors:

```typescript
// Pseudo-code
export const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  // Determine status code
  // Return consistent JSON error response
  // Hide sensitive details in production
}
```

### Consistent JSON Error Response

```json
{
  "error": {
    "message": "User-friendly error message",
    "code": "ERROR_CODE",
    "status": 400
  }
}
```

### Error Types

#### Validation Errors (400)
- Missing required fields
- Invalid data format
- Invalid quantity values

#### Unauthorized Errors (401)
- Missing authentication token
- Invalid/expired token
- Invalid credentials

#### Forbidden Errors (403)
- User trying to access another user's resources

#### Not Found Errors (404)
- Product not found
- User not found
- Cart item not found
- Order not found

#### Conflict Errors (409)
- Email already exists (signup)
- Duplicate resource

#### Server Errors (500)
- Database connection errors
- Unexpected errors
- Third-party service failures

### Production Safety

- Never expose stack traces in production
- Never expose database error details
- Log detailed errors server-side
- Return generic messages to client in production
- Use `process.env.NODE_ENV` to determine environment

---

## 10. Environment Configuration

### Required Variables

```env
# Server Configuration
PORT=4000
CLIENT_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
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
- **JWT_SECRET**: Secret key for signing JWT tokens (must be strong and unique)
- **JWT_EXPIRES_IN**: JWT token expiration time (e.g., '7d', '24h', '30m')

### Security Rules

1. **Never commit `.env` file** (add to `.gitignore`)
2. **Always provide `.env.example`** with dummy values
3. **Use strong JWT_SECRET** in production (minimum 32 characters, random)
4. **Rotate secrets** periodically in production
5. **Use environment-specific values** (dev, staging, production)

---

## 11. Implementation Phases

### Phase 1: Project Setup & TypeScript Configuration
**Goal**: Convert project to TypeScript and set up development environment

- [ ] Install TypeScript dependencies (`typescript`, `ts-node`, `@types/node`, `@types/express`, etc.)
- [ ] Create `tsconfig.json` with appropriate compiler options
- [ ] Convert `src/index.js` to `src/index.ts`
- [ ] Create `src/app.ts` for Express app configuration
- [ ] Update package.json scripts for TypeScript (`dev`, `build`, `start`)
- [ ] Verify server starts with `npm run dev`
- [ ] Verify health endpoint works

**Verification**: `npm run dev` starts server, `GET /api/health` returns 200

---

### Phase 2: Database Setup
**Goal**: Establish MySQL connection and create database schema

- [ ] Create `src/config/db.ts` with MySQL connection pool
- [ ] Create `src/db/schema.sql` with all table definitions
- [ ] Create `src/db/seed.sql` with sample data (users, products)
- [ ] Create `src/db/init-db.ts` script to initialize database
- [ ] Add `db:init` script to package.json
- [ ] Test database connection
- [ ] Run init script to create tables and seed data

**Verification**: Database connects, tables created, seed data inserted

---

### Phase 3: Authentication Module
**Goal**: Implement user signup, login, and JWT authentication

- [ ] Create `src/types/auth.types.ts` with auth-related types
- [ ] Create `src/types/express.d.ts` for req.user typing
- [ ] Create `src/services/auth.service.ts` with signup/login logic
- [ ] Create `src/controllers/auth.controller.ts` with request handlers
- [ ] Create `src/middleware/auth.middleware.ts` for JWT verification
- [ ] Create `src/routes/auth.routes.ts` with auth endpoints
- [ ] Test signup endpoint
- [ ] Test login endpoint
- [ ] Test `/api/auth/me` endpoint with token

**Verification**: Signup returns token, login returns token, protected routes work

---

### Phase 4: Products Module
**Goal**: Implement product catalog endpoints

- [ ] Create `src/types/product.types.ts` with product-related types
- [ ] Create `src/services/product.service.ts` with product logic
- [ ] Create `src/controllers/product.controller.ts` with request handlers
- [ ] Create `src/routes/product.routes.ts` with product endpoints
- [ ] Implement GET /api/products with filtering
- [ ] Implement GET /api/products/:id
- [ ] Test product listing
- [ ] Test product details
- [ ] Test filtering (category, search, price range)

**Verification**: Products return seeded data, filtering works, single product returns details

---

### Phase 5: Cart Module
**Goal**: Implement shopping cart functionality

- [ ] Create `src/types/cart.types.ts` with cart-related types
- [ ] Create `src/services/cart.service.ts` with cart logic
- [ ] Create `src/controllers/cart.controller.ts` with request handlers
- [ ] Create `src/routes/cart.routes.ts` with cart endpoints (protected)
- [ ] Implement GET /api/cart
- [ ] Implement POST /api/cart/items
- [ ] Implement PUT /api/cart/items/:productId
- [ ] Implement DELETE /api/cart/items/:productId
- [ ] Test adding product to cart
- [ ] Test updating quantity
- [ ] Test removing item
- [ ] Test cart total calculation

**Verification**: User can add/update/remove cart items, cart persists, totals calculate correctly

---

### Phase 6: Orders & Checkout Module
**Goal**: Implement order creation and order history

- [ ] Create `src/types/order.types.ts` with order-related types
- [ ] Create `src/services/order.service.ts` with order logic
- [ ] Create `src/controllers/order.controller.ts` with request handlers
- [ ] Create `src/routes/order.routes.ts` with order endpoints (protected)
- [ ] Implement POST /api/orders (checkout)
- [ ] Implement GET /api/orders (order history)
- [ ] Implement transaction for order creation + cart clearing
- [ ] Test checkout flow
- [ ] Test cart clearing after order
- [ ] Test order history retrieval
- [ ] Verify price calculation from database

**Verification**: Checkout creates order, cart clears, order history shows user's orders only

---

### Phase 7: Error Handling & Documentation
**Goal**: Implement centralized error handling and document the API

- [ ] Create `src/middleware/error.middleware.ts`
- [ ] Apply error middleware to Express app
- [ ] Test error responses for all error types
- [ ] Create/update README.md with setup instructions
- [ ] Document all API endpoints
- [ ] Add manual verification checklist to README
- [ ] Test all endpoints end-to-end
- [ ] Verify authentication flow
- [ ] Verify ownership rules (cart, orders)

**Verification**: All endpoints return consistent error format, README is complete

---

## 12. Verification Plan

### Development Verification Checklist

#### Server & Health
- [ ] `npm run dev` starts server without errors
- [ ] `GET /api/health` returns `{ status: "ok", message: "Server is running" }`
- [ ] Server logs show port number

#### Database
- [ ] Database connection established on startup
- [ ] `npm run db:init` creates all tables
- [ ] `npm run db:init` seeds sample data
- [ ] Can query users, products, cart_items, orders, order_items tables

#### Authentication
- [ ] `POST /api/auth/signup` with valid data returns token and user
- [ ] `POST /api/auth/signup` with existing email returns 409 error
- [ ] `POST /api/auth/login` with valid credentials returns token
- [ ] `POST /api/auth/login` with invalid credentials returns 401 error
- [ ] `GET /api/auth/me` with valid token returns user profile
- [ ] `GET /api/auth/me` without token returns 401 error
- [ ] `GET /api/auth/me` with invalid token returns 401 error

#### Products
- [ ] `GET /api/products` returns all seeded products
- [ ] `GET /api/products?category=Electronics` filters by category
- [ ] `GET /api/products?search=laptop` searches products
- [ ] `GET /api/products/:id` returns single product details
- [ ] `GET /api/products/999` returns 404 for non-existent product

#### Cart
- [ ] `GET /api/cart` without token returns 401
- [ ] `GET /api/cart` with token returns empty cart initially
- [ ] `POST /api/cart/items` adds product to cart
- [ ] `POST /api/cart/items` with same product increases quantity
- [ ] `GET /api/cart` returns cart with product details and totals
- [ ] `PUT /api/cart/items/:productId` updates quantity
- [ ] `DELETE /api/cart/items/:productId` removes item from cart
- [ ] Cart items belong to authenticated user only

#### Orders
- [ ] `POST /api/orders` without token returns 401
- [ ] `POST /api/orders` with empty cart returns 400
- [ ] `POST /api/orders` with valid cart and shipping creates order
- [ ] Order total matches cart total (calculated server-side)
- [ ] Cart is cleared after successful order
- [ ] `GET /api/orders` returns user's order history
- [ ] `GET /api/orders` returns orders with nested items
- [ ] Orders belong to authenticated user only

#### Error Handling
- [ ] All errors return consistent JSON format
- [ ] Validation errors return 400 status
- [ ] Authentication errors return 401 status
- [ ] Not found errors return 404 status
- [ ] Server errors return 500 status
- [ ] Error messages are user-friendly

#### Security
- [ ] Passwords are hashed (never stored plain text)
- [ ] JWT tokens expire based on JWT_EXPIRES_IN
- [ ] Users cannot access other users' carts
- [ ] Users cannot access other users' orders
- [ ] Product prices calculated server-side (not trusted from frontend)

---

## 13. Known Tradeoffs

### MVP Decisions & Limitations

#### Simple Validation
- **Decision**: Use manual validation instead of validation library (Joi, Yup, Zod)
- **Tradeoff**: Less robust validation, more manual code
- **Rationale**: Faster MVP development, can add library later if needed
- **Future**: Consider adding Zod for type-safe validation

#### No Payment Integration
- **Decision**: No Stripe/PayPal integration
- **Tradeoff**: Orders created but no actual payment processing
- **Rationale**: Focus on core e-commerce flow first
- **Future**: Add payment provider in Phase 8

#### No Admin Panel
- **Decision**: No admin routes for product management
- **Tradeoff**: Products managed via SQL/seed scripts only
- **Rationale**: User-facing features prioritized
- **Future**: Add admin module for CRUD operations on products

#### No Refresh Tokens
- **Decision**: Single JWT token, no refresh token flow
- **Tradeoff**: User must re-login after token expires
- **Rationale**: Simpler authentication flow for MVP
- **Future**: Implement refresh token rotation for better UX

#### No Inventory Reservation
- **Decision**: No stock checking or reservation during checkout
- **Tradeoff**: Possible overselling if stock is low
- **Rationale**: Simplified order flow, acceptable for MVP
- **Future**: Add stock validation and reservation logic

#### No Email Notifications
- **Decision**: No order confirmation emails
- **Tradeoff**: User doesn't receive email receipt
- **Rationale**: Requires email service integration (SendGrid, etc.)
- **Future**: Add email service in later phase

#### No Pagination
- **Decision**: No pagination on products or orders initially
- **Tradeoff**: Performance issues with large datasets
- **Rationale**: Acceptable for MVP with limited data
- **Future**: Add pagination with limit/offset or cursor-based

#### No Rate Limiting
- **Decision**: No rate limiting on API endpoints
- **Tradeoff**: Vulnerable to abuse/DoS
- **Rationale**: Not critical for development environment
- **Future**: Add express-rate-limit for production

### Architectural Decisions

#### MySQL over PostgreSQL
- **Decision**: Use MySQL as specified
- **Rationale**: Project requirement, widely supported
- **Note**: PostgreSQL would offer more features (JSONB, better full-text search)

#### JWT over Sessions
- **Decision**: Stateless JWT authentication
- **Rationale**: Scalable, works well with separate frontend/backend
- **Note**: Sessions would be simpler but require session store

#### Monolithic over Microservices
- **Decision**: Single Node.js application
- **Rationale**: Appropriate for MVP, easier to develop and deploy
- **Note**: Can split into microservices later if needed

---

## 14. Rules for Future AI Implementation

### Source of Truth
- **This `plan.md` is the source of truth** for backend architecture
- Follow the structure, naming conventions, and patterns defined here
- If plan conflicts with implementation, update plan first, then code

### Implementation Guidelines

1. **Implement One Phase at a Time**
   - Complete each phase fully before moving to next
   - Run verification checklist after each phase
   - Don't skip ahead or combine phases

2. **Do Not Skip Verification**
   - Test each endpoint after implementation
   - Verify error cases, not just happy path
   - Check authentication and ownership rules

3. **Do Not Introduce Unnecessary Libraries**
   - Stick to dependencies listed in plan
   - If new library needed, justify and document
   - Prefer built-in Node.js/Express features

4. **Do Not Expose Secrets**
   - Never commit `.env` file
   - Never log sensitive data (passwords, tokens)
   - Use environment variables for all config

5. **Keep Code Readable**
   - Use descriptive variable and function names
   - Add comments for complex logic
   - Follow TypeScript best practices
   - Maintain consistent code style

6. **Type Safety**
   - Define types for all data structures
   - Avoid `any` type unless absolutely necessary
   - Use interfaces for object shapes
   - Type all function parameters and returns

7. **Error Handling**
   - Wrap async operations in try-catch
   - Use centralized error middleware
   - Return consistent error responses
   - Log errors for debugging

8. **Database Operations**
   - Use parameterized queries (prevent SQL injection)
   - Close connections properly
   - Handle connection errors gracefully
   - Use transactions for multi-step operations

9. **Testing Strategy**
   - Manual testing with tools like Postman/Thunder Client
   - Test authentication flow thoroughly
   - Test ownership rules (users can't access others' data)
   - Test error cases and edge cases

10. **Documentation**
    - Update README when setup changes
    - Document new environment variables
    - Document any manual fixes or workarounds
    - Keep API documentation in sync with implementation

### When to Deviate from Plan

- If you discover a critical flaw in the plan, **stop and document it**
- Propose alternative approach with justification
- Update plan.md before implementing alternative
- Don't silently deviate from plan

### Communication

- Explain what you're implementing before doing it
- Show code snippets for review when appropriate
- Ask for clarification if requirements are unclear
- Report completion of each phase with verification results

### Maintenance

- Keep dependencies updated (security patches)
- Monitor for deprecated packages
- Document any breaking changes
- Maintain backward compatibility when possible

---

## Summary

This plan provides a complete roadmap for building a maintainable e-commerce backend with Node.js, Express, TypeScript, and MySQL. The architecture emphasizes:

- **Separation of concerns** (routes → controllers → services → database)
- **Type safety** with TypeScript
- **Security** with JWT authentication and ownership rules
- **Maintainability** with clear structure and consistent patterns
- **Scalability** with stateless authentication and database-driven design

Follow the implementation phases sequentially, verify each phase thoroughly, and maintain the principles outlined in this document.

**Next Step**: Begin Phase 1 - Project Setup & TypeScript Configuration
