# Helfy E-Commerce Frontend Implementation Plan

## 1. Frontend Goal

The Helfy client is a modern, premium e-commerce web application built with React, TypeScript, and Tailwind CSS. It provides a complete shopping experience including:

- **User Authentication**: Signup, login, logout, and persistent sessions
- **Product Discovery**: Browse products with search, category, and price filtering
- **Shopping Cart**: Add, update, and remove items with backend persistence
- **Checkout Flow**: Multi-step checkout process with shipping details and order confirmation
- **Account Management**: View profile and order history

The frontend is API-driven, consuming a RESTful backend that handles all business logic, authentication, and data persistence. The UI prioritizes a clean, premium aesthetic with excellent user experience across desktop and mobile devices.

---

## 2. Engineering Principles

### Core Development Rules

1. **API-Driven Architecture**
   - All data comes from the backend API
   - Frontend never calculates prices or totals
   - Backend is the source of truth for all business logic

2. **Component Reusability**
   - Build small, focused, reusable components
   - Separate presentational components from container components
   - Use composition over duplication

3. **Clear Separation of Concerns**
   - Pages orchestrate layout and data fetching
   - Components handle presentation
   - API modules handle all HTTP communication
   - Context providers manage global state

4. **Centralized API Client**
   - Single axios instance with shared configuration
   - Automatic token injection for authenticated requests
   - Consistent error handling and response normalization
   - No direct fetch/axios calls in components

5. **Token Management**
   - Store JWT in localStorage (MVP approach)
   - Single source of truth in AuthContext
   - Automatic token injection via axios interceptors
   - Handle 401 errors globally

6. **Protected Routes**
   - ProtectedRoute component wraps authenticated pages
   - Redirect to login if not authenticated
   - Redirect away from login/signup if already authenticated

7. **Simple State Management**
   - React Context for global state (auth, cart)
   - Local useState for page-level state (filters, forms)
   - No Redux or complex state libraries for MVP
   - Keep state logic readable and maintainable

8. **No Hardcoded Secrets**
   - Use environment variables for API URL
   - Never commit tokens or sensitive data
   - Use `.env.local` for local development

9. **Consistent Loading and Error Handling**
   - Loading states for all async operations
   - User-friendly error messages
   - Empty states for zero-result scenarios
   - Never expose raw backend errors to users

10. **Premium but Maintainable UI**
    - Clean, modern design with Tailwind CSS
    - Consistent spacing and typography
    - Responsive design mobile-first
    - Accessible and semantic HTML
    - Reusable utility patterns

---

## 3. Proposed Folder Structure

```
client/
├── src/
│   ├── main.tsx                    # App entry point
│   ├── App.tsx                     # Root component with routing
│   ├── index.css                   # Global styles and Tailwind imports
│   │
│   ├── api/                        # API communication layer
│   │   ├── apiClient.ts            # Axios instance with interceptors
│   │   ├── authApi.ts              # Auth endpoints (signup, login, me)
│   │   ├── productsApi.ts          # Product endpoints (list, details)
│   │   ├── cartApi.ts              # Cart endpoints (get, add, update, delete)
│   │   └── ordersApi.ts            # Order endpoints (create, list)
│   │
│   ├── context/                    # Global state management
│   │   ├── AuthContext.tsx         # User, token, auth state
│   │   └── CartContext.tsx         # Cart state and operations
│   │
│   ├── components/                 # Reusable UI components
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          # Top navigation with auth state
│   │   │   ├── Footer.tsx          # Footer component
│   │   │   └── PageContainer.tsx   # Page wrapper with consistent padding
│   │   │
│   │   ├── products/
│   │   │   ├── ProductCard.tsx     # Single product card
│   │   │   ├── ProductGrid.tsx     # Grid layout for products
│   │   │   └── ProductFilters.tsx  # Search, category, price filters
│   │   │
│   │   ├── cart/
│   │   │   ├── CartItem.tsx        # Single cart item with quantity controls
│   │   │   └── CartSummary.tsx     # Cart totals and checkout button
│   │   │
│   │   ├── checkout/
│   │   │   ├── CheckoutStepper.tsx # Visual step indicator
│   │   │   ├── ShippingForm.tsx    # Shipping details form
│   │   │   └── OrderReview.tsx     # Order summary before submission
│   │   │
│   │   └── common/
│   │       ├── Button.tsx          # Reusable button component
│   │       ├── Input.tsx           # Reusable input component
│   │       ├── LoadingState.tsx    # Loading spinner/skeleton
│   │       ├── ErrorState.tsx      # Error message display
│   │       ├── EmptyState.tsx      # Empty state with icon and message
│   │       └── ProtectedRoute.tsx  # Route wrapper for auth
│   │
│   ├── pages/                      # Page-level components
│   │   ├── HomePage.tsx            # Product catalog with filters
│   │   ├── ProductDetailsPage.tsx  # Single product view
│   │   ├── CartPage.tsx            # Cart view with items
│   │   ├── CheckoutPage.tsx        # Multi-step checkout
│   │   ├── LoginPage.tsx           # Login form
│   │   ├── SignupPage.tsx          # Signup form
│   │   ├── AccountPage.tsx         # User profile
│   │   ├── OrdersPage.tsx          # Order history
│   │   └── NotFoundPage.tsx        # 404 page
│   │
│   ├── types/                      # TypeScript type definitions
│   │   ├── auth.types.ts           # User, LoginRequest, SignupRequest
│   │   ├── product.types.ts        # Product, ProductFilters
│   │   ├── cart.types.ts           # Cart, CartItem
│   │   └── order.types.ts          # Order, OrderItem, ShippingDetails
│   │
│   └── assets/                     # Static assets (images, icons)
│
├── .env.example                    # Environment variable template
├── .env.local                      # Local environment variables (gitignored)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── plan.md                         # This file
```

---

## 4. API Integration Plan

### Environment Configuration

Create `.env.local` file:
```
VITE_API_URL=http://localhost:4000
```

Access in code:
```typescript
const API_URL = import.meta.env.VITE_API_URL;
```

**Note**: The backend server runs on port 4000. All API calls will be made to endpoints like:
- `http://localhost:4000/api/auth/login`
- `http://localhost:4000/api/products`
- `http://localhost:4000/api/cart`
- `http://localhost:4000/api/orders`

### Centralized API Client (`api/apiClient.ts`)

Create a single axios instance with:
- Base URL from environment variable
- Automatic token injection via request interceptor
- Global error handling via response interceptor
- 401 error handling with smart redirect logic
- Response normalization

```typescript
// Pseudo-structure
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor: inject token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on 401
      localStorage.removeItem('token');
      
      // Only redirect if not already on login/signup pages
      // This prevents redirect loops during initial session loading
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

**Important**: The API client clears the token on 401 but avoids aggressive redirects. The `AuthContext` manages user session state, and `ProtectedRoute` controls navigation to login. This prevents redirect loops during initial `/api/auth/me` calls on app load.

### API Modules

Each API module exports functions that use the centralized `apiClient`:

**`authApi.ts`**
- `signup(data)` → POST /api/auth/signup
- `login(data)` → POST /api/auth/login
- `getCurrentUser()` → GET /api/auth/me

**`productsApi.ts`**
- `getProducts(filters)` → GET /api/products?search=...&category=...&minPrice=...&maxPrice=...
- `getProductById(id)` → GET /api/products/:id

**`cartApi.ts`**
- `getCart()` → GET /api/cart
- `addToCart(productId, quantity)` → POST /api/cart/items
- `updateCartItem(productId, quantity)` → PUT /api/cart/items/:productId
- `removeCartItem(productId)` → DELETE /api/cart/items/:productId

**`ordersApi.ts`**
- `createOrder(shippingDetails)` → POST /api/orders
- `getOrders()` → GET /api/orders

### Error Handling Strategy

- Catch errors in API functions
- Return normalized error objects
- Display user-friendly messages in UI
- Log detailed errors to console for debugging
- Never expose raw backend error messages unless safe

---

## 5. Authentication Plan

### Token Storage
- Store JWT in `localStorage` under key `'token'`
- MVP approach, acceptable for this project
- Future: Consider httpOnly cookies for production

### Login Flow
1. User submits email and password
2. Call `authApi.login(credentials)`
3. Backend returns `{ token, user }`
4. Store token in localStorage
5. Update AuthContext with user and token
6. Redirect to home page or intended destination

### Signup Flow
1. User submits name, email, password
2. Call `authApi.signup(data)`
3. Backend returns `{ token, user }`
4. Store token in localStorage
5. Update AuthContext with user and token
6. Redirect to home page

### Logout Flow
1. User clicks logout
2. Remove token from localStorage
3. Clear AuthContext state
4. Redirect to login page

### Load Current User on App Start
1. On app mount, check if token exists in localStorage
2. If token exists, call `authApi.getCurrentUser()`
3. If successful, populate AuthContext with user
4. If fails (401), clear token and redirect to login
5. Set loading state to false

### ProtectedRoute Component
- Wraps routes that require authentication
- Checks if user exists in AuthContext
- If not authenticated, redirect to `/login`
- If authenticated, render children

### Redirect Logic
- If user is authenticated and visits `/login` or `/signup`, redirect to `/`
- If user is not authenticated and visits protected routes, redirect to `/login`

---

## 6. Product Catalog Plan

### Product List Loading
- Fetch products from `GET /api/products` on HomePage mount
- Support query parameters: `search`, `category`, `minPrice`, `maxPrice`
- Display products in a responsive grid

### Search Filter
- Input field for search query
- Debounce input to avoid excessive API calls
- Update URL query params
- Refetch products with search parameter

### Category Filter
- Dropdown or button group for categories
- Categories: Electronics, Fashion, Home, Fitness, Accessories
- Update URL query params
- Refetch products with category parameter

### Price Filter
- Min and max price inputs
- Apply button to trigger filter
- Update URL query params
- Refetch products with minPrice and maxPrice parameters

### Product Detail Page
- Route: `/products/:id`
- Fetch product by ID from `GET /api/products/:id`
- Display product image, name, description, price, category, stock
- Add to cart button
- Handle out of stock state

### Add to Cart Behavior
- If not authenticated, redirect to login
- If authenticated, call `cartApi.addToCart(productId, quantity)`
- Show success message or toast
- Update cart count in navbar
- Refresh cart context

### Loading, Empty, and Error States
- **Loading**: Show skeleton or spinner while fetching
- **Empty**: Display "No products found" with icon when results are empty
- **Error**: Display error message with retry button

---

## 7. Cart Plan

### Load Cart After Login
- When user logs in, call `cartApi.getCart()`
- Populate CartContext with cart data
- Display cart count in navbar

### Add Product to Cart
- Call `cartApi.addToCart(productId, quantity)`
- Refresh cart from backend
- Update CartContext

### Update Quantity
- Call `cartApi.updateCartItem(productId, newQuantity)`
- Refresh cart from backend
- Update CartContext

### Remove Item
- Call `cartApi.removeCartItem(productId)`
- Refresh cart from backend
- Update CartContext

### Display Subtotal and Total
- Backend returns `subtotal` and `total` in cart response
- Display these values in CartSummary component
- Never calculate totals in frontend

### CartContext State
- Holds current cart data
- Provides functions: `addToCart`, `updateQuantity`, `removeItem`, `refreshCart`
- Automatically refreshes after mutations

### Handle Unauthenticated Add-to-Cart
- If user tries to add to cart without being logged in
- Redirect to login page
- After login, redirect back to product page or cart

### Empty Cart State
- Display "Your cart is empty" message
- Show "Continue Shopping" button linking to home page

---

## 8. Checkout Plan

### Multi-Step Checkout State
- Use local state to track current step: 1, 2, or 3
- Step 1: Shipping Details
- Step 2: Order Review
- Step 3: Confirmation

### Shipping Form Fields (Step 1)
- `shipping_name` (required)
- `shipping_address` (required)
- `shipping_city` (required)
- `shipping_country` (required)
- Validate all fields before proceeding to step 2

### Review Step (Step 2)
- Display shipping details entered in step 1
- Display cart items from CartContext
- Display subtotal and total from backend cart
- "Edit" button to go back to step 1
- "Place Order" button to submit

### Submit Order
- Call `ordersApi.createOrder(shippingDetails)`
- Backend creates order and returns order object
- Move to step 3 (confirmation)

### Confirmation Step (Step 3)
- Display "Order Placed Successfully" message
- Show order ID and summary
- Refresh cart (should now be empty)
- "View Order History" button linking to `/orders`
- "Continue Shopping" button linking to `/`

### Redirect Empty Cart Users
- If user navigates to `/checkout` with empty cart
- Redirect to `/cart` or `/` with message

### Error Handling
- If order creation fails, display error message
- Allow user to retry or go back to edit details

---

## 9. Account and Orders Plan

### Account Page
- Route: `/account`
- Protected route (requires authentication)
- Display current user information from AuthContext
- Show name, email
- Future: Allow editing profile

### Orders Page
- Route: `/orders`
- Protected route (requires authentication)
- Fetch orders from `ordersApi.getOrders()`
- Display list of orders with:
  - Order ID
  - Order date
  - Total amount
  - Status
  - Shipping details
  - Nested order items (product name, quantity, price)

### Order Cards
- Each order displayed as a card
- Expandable to show order items
- Display order status badge
- Show shipping information

### Empty Order History State
- Display "No orders yet" message
- Show "Start Shopping" button linking to home page

---

## 10. UI/UX Plan

### Visual Direction
- **Premium Modern Storefront**: Clean, professional, trustworthy
- **Clean Typography**: Use system fonts with clear hierarchy
- **Soft Shadows**: Subtle elevation for cards and buttons
- **Rounded Cards**: Consistent border radius (e.g., 8px or 12px)
- **Responsive Grid**: Product grid adapts to screen size
- **Polished Navbar**: Fixed or sticky navbar with logo, search, cart, account
- **Clear CTA Buttons**: Primary actions stand out with accent colors
- **Elegant Checkout Stepper**: Visual progress indicator
- **Account Dashboard Feel**: Organized, easy to navigate
- **Mobile-First Responsiveness**: Works beautifully on all devices

### Tailwind CSS Conventions

**Spacing**
- Consistent padding: `p-4`, `p-6`, `p-8`
- Consistent margins: `mb-4`, `mb-6`, `mb-8`
- Gap in grids: `gap-4`, `gap-6`

**Typography**
- Headings: `text-2xl`, `text-3xl`, `text-4xl` with `font-semibold` or `font-bold`
- Body text: `text-base`, `text-sm`
- Colors: `text-gray-900`, `text-gray-600`, `text-gray-500`

**Buttons**
- Primary: `bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg`
- Secondary: `bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg`
- Disabled: `opacity-50 cursor-not-allowed`

**Cards**
- `bg-white border border-gray-200 rounded-lg shadow-sm p-6`
- Hover effects: `hover:shadow-md transition-shadow`

**Responsive Breakpoints**
- Mobile: default
- Tablet: `md:` (768px)
- Desktop: `lg:` (1024px)
- Large desktop: `xl:` (1280px)

**Grid Layouts**
- Product grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`
- Responsive columns adapt to screen size

---

## 11. State Management Plan

### AuthContext
- **State**: `user`, `token`, `loading`, `isAuthenticated`
- **Functions**: `login`, `signup`, `logout`, `loadUser`
- **Provider**: Wraps entire app in `App.tsx`
- **Usage**: Access via `useAuth()` hook

### CartContext
- **State**: `cart`, `loading`, `itemCount`
- **Functions**: `addToCart`, `updateQuantity`, `removeItem`, `refreshCart`, `clearCart`
- **Provider**: Wraps entire app in `App.tsx`
- **Usage**: Access via `useCart()` hook

### Page-Level State
- **Filters**: `useState` for search, category, minPrice, maxPrice
- **Forms**: `useState` for form inputs (login, signup, shipping)
- **Checkout Step**: `useState` for current step (1, 2, 3)
- **Loading**: `useState` for page-specific loading states

### Avoid Redux for MVP
- Context API is sufficient for this project
- Keeps code simple and readable
- Easy to understand and maintain
- Can migrate to Redux later if needed

---

## 12. Error and Loading Strategy

### Loading States

**Page Loading**
- Show full-page spinner or skeleton while fetching initial data
- Use `LoadingState` component for consistency

**Button Loading**
- Disable button and show spinner during mutations
- Example: "Adding to cart..." with spinner

**Inline Loading**
- Show skeleton loaders for product cards while fetching
- Maintain layout to prevent content shift

### Error States

**User-Friendly Messages**
- "Failed to load products. Please try again."
- "Failed to add item to cart. Please try again."
- "Invalid email or password."

**Error Display**
- Use `ErrorState` component with icon and message
- Provide "Retry" button when applicable
- Log detailed errors to console for debugging

**Network Errors**
- Detect network failures
- Show "Network error. Please check your connection."

### Empty States

**No Products**
- "No products found. Try adjusting your filters."

**Empty Cart**
- "Your cart is empty. Start shopping!"

**No Orders**
- "You haven't placed any orders yet."

### Error Boundaries
- Consider adding React Error Boundary for unexpected errors
- Fallback UI for component crashes

---

## 13. Implementation Phases

### Phase 1: Project Setup and Configuration
- ✅ Verify Vite + React + TypeScript setup
- ✅ Verify Tailwind CSS installation
- Configure Tailwind in `vite.config.ts` (add `@tailwindcss/vite` plugin)
- Update `index.css` with Tailwind directives
- Create `.env.local` with `VITE_API_URL`
- Set up React Router in `App.tsx`
- Create base layout components (Navbar, Footer, PageContainer)
- Test dev server and hot reload

### Phase 2: API Client and Auth Context
- Create `api/apiClient.ts` with axios instance and interceptors
- Create `api/authApi.ts` with signup, login, getCurrentUser
- Create `types/auth.types.ts` with User, LoginRequest, SignupRequest
- Create `context/AuthContext.tsx` with auth state and functions
- Test API client with backend

### Phase 3: Authentication Pages and Protected Routes
- Create `pages/LoginPage.tsx` with form
- Create `pages/SignupPage.tsx` with form
- Create `components/common/ProtectedRoute.tsx`
- Implement login flow
- Implement signup flow
- Implement logout functionality
- Test authentication end-to-end

### Phase 4: Product Catalog and Filters
- Create `types/product.types.ts`
- Create `api/productsApi.ts`
- Create `components/products/ProductCard.tsx`
- Create `components/products/ProductGrid.tsx`
- Create `components/products/ProductFilters.tsx`
- Create `pages/HomePage.tsx` with product list and filters
- Create `pages/ProductDetailsPage.tsx`
- Implement search, category, and price filters
- Test product browsing

### Phase 5: Cart Context and Cart Page
- Create `types/cart.types.ts`
- Create `api/cartApi.ts`
- Create `context/CartContext.tsx`
- Create `components/cart/CartItem.tsx`
- Create `components/cart/CartSummary.tsx`
- Create `pages/CartPage.tsx`
- Implement add to cart, update quantity, remove item
- Test cart operations

### Phase 6: Checkout Flow
- Create `types/order.types.ts`
- Create `api/ordersApi.ts`
- Create `components/checkout/CheckoutStepper.tsx`
- Create `components/checkout/ShippingForm.tsx`
- Create `components/checkout/OrderReview.tsx`
- Create `pages/CheckoutPage.tsx` with multi-step logic
- Implement order creation
- Test checkout end-to-end

### Phase 7: Account and Order History
- Create `pages/AccountPage.tsx`
- Create `pages/OrdersPage.tsx`
- Fetch and display order history
- Display order details and items
- Test account pages

### Phase 8: UI Polish and Verification
- Refine Tailwind styles for premium look
- Ensure responsive design on mobile, tablet, desktop
- Add loading and error states everywhere
- Add empty states
- Create `pages/NotFoundPage.tsx`
- Update README with setup instructions
- Manual verification checklist (see section 14)

---

## 14. Verification Plan

### Manual Verification Checklist

**Setup**
- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts client on port (e.g., 5173)
- [ ] App connects to backend through `VITE_API_URL`
- [ ] No console errors on initial load

**Authentication**
- [ ] Signup works and returns token
- [ ] Login works and returns token
- [ ] Logout clears token and redirects to login
- [ ] Refresh keeps user logged in if token exists
- [ ] Invalid credentials show error message
- [ ] Protected routes redirect to login when not authenticated
- [ ] Login/signup redirect to home when already authenticated

**Product Catalog**
- [ ] Product list loads on home page
- [ ] Search filter works
- [ ] Category filter works
- [ ] Price filter works
- [ ] Product details page loads correctly
- [ ] Loading state shows while fetching
- [ ] Empty state shows when no products match filters
- [ ] Error state shows when API fails

**Cart**
- [ ] Unauthenticated cart access redirects to login
- [ ] Authenticated user can add to cart
- [ ] Cart count updates in navbar
- [ ] User can update quantity
- [ ] User can remove item
- [ ] Cart totals display correctly
- [ ] Empty cart state shows when cart is empty

**Checkout**
- [ ] Checkout page requires authentication
- [ ] Shipping form validates required fields
- [ ] Order review displays cart items and totals
- [ ] Order creation succeeds
- [ ] Cart clears after successful checkout
- [ ] Confirmation page displays order details
- [ ] Empty cart users redirected from checkout

**Account and Orders**
- [ ] Account page displays user information
- [ ] Order history page displays created orders
- [ ] Order details show nested order items
- [ ] Empty order history state shows when no orders

**UI/UX**
- [ ] Responsive layout works on desktop (1920px, 1440px, 1024px)
- [ ] Responsive layout works on tablet (768px)
- [ ] Responsive layout works on mobile (375px, 414px)
- [ ] Navbar is polished and functional
- [ ] Buttons have hover states
- [ ] Forms have proper validation feedback
- [ ] Loading states are clear
- [ ] Error messages are user-friendly

---

## 15. Known Tradeoffs

### localStorage Token
- **Decision**: Store JWT in localStorage
- **Tradeoff**: Vulnerable to XSS attacks
- **Justification**: Acceptable for MVP, simpler implementation
- **Future**: Migrate to httpOnly cookies for production

### Context Instead of Redux
- **Decision**: Use React Context for global state
- **Tradeoff**: Less powerful than Redux for complex state
- **Justification**: Sufficient for this project, simpler to understand
- **Future**: Migrate to Redux or Zustand if state becomes complex

### Simple Form Validation
- **Decision**: Basic client-side validation
- **Tradeoff**: Not as robust as libraries like Formik or React Hook Form
- **Justification**: Keeps dependencies minimal for MVP
- **Future**: Add validation library if forms become complex

### No Real Payment Provider
- **Decision**: No Stripe/PayPal integration
- **Tradeoff**: Not a real checkout experience
- **Justification**: Out of scope for this assignment
- **Future**: Integrate payment provider for production

### No Admin Panel
- **Decision**: No admin interface for managing products/orders
- **Tradeoff**: Cannot manage catalog from UI
- **Justification**: Out of scope, backend API exists
- **Future**: Build admin panel as separate project

### No Advanced Caching
- **Decision**: No React Query or SWR for caching
- **Tradeoff**: More API calls, less optimized
- **Justification**: Simpler implementation for MVP
- **Future**: Add React Query for better caching and state management

### No Automated Tests
- **Decision**: No unit or integration tests initially
- **Tradeoff**: Less confidence in code changes
- **Justification**: Focus on functionality first
- **Future**: Add Jest, React Testing Library, and Playwright tests

---

## 16. Rules for Future AI Implementation

### Source of Truth
- **Follow this `plan.md` as the source of truth** for all implementation decisions
- If requirements conflict, refer back to this document
- Update this document if scope changes

### Incremental Implementation
- **Implement one phase at a time** (see section 13)
- Complete each phase fully before moving to the next
- Do not skip phases or combine them unless explicitly instructed

### Verification
- **Do not skip verification** after each phase
- Test functionality manually before proceeding
- Document any issues or deviations

### Dependencies
- **Do not introduce unnecessary libraries**
- Use only what's already installed: React, TypeScript, React Router, Tailwind, Axios
- If a new library is needed, justify it first

### API Logic
- **Do not duplicate API logic across components**
- All API calls must go through the centralized API modules
- Components should never call axios directly

### Configuration
- **Do not hardcode API URLs**
- Always use `import.meta.env.VITE_API_URL`
- Never commit `.env.local` to git

### Secrets
- **Do not expose secrets**
- Never log tokens or sensitive data
- Keep authentication logic secure

### UI Quality
- **Keep UI premium but readable**
- Use Tailwind utility classes consistently
- Maintain visual hierarchy and spacing
- Ensure responsive design

### Component Size
- **Keep components small and meaningful**
- Single responsibility principle
- Extract reusable logic into custom hooks
- Avoid components over 200 lines

### Documentation
- **Update README when setup changes**
- Document environment variables
- Provide clear setup instructions
- Include troubleshooting tips

### Manual Fixes
- **Document manual fixes separately**
- If AI cannot complete a task, document it
- Create a `docs/manual-interventions.md` file if needed

---

## Summary

This plan provides a comprehensive roadmap for building the Helfy e-commerce frontend. It emphasizes:

1. **API-driven architecture** with centralized API client
2. **Clean component structure** with reusability
3. **Simple state management** with Context API
4. **Premium UI/UX** with Tailwind CSS
5. **Incremental implementation** in 8 phases
6. **Thorough verification** at each step

The frontend will be built with TypeScript, React, React Router, Tailwind CSS, and Axios, consuming the existing backend API. The result will be a modern, maintainable, and user-friendly e-commerce platform.

---

**Next Step**: Begin Phase 1 - Project Setup and Configuration
