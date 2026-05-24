# Frontend Verification — Helfy E-Commerce Client

Manual verification checklist for the React client. Run after every significant change.

## Prerequisites

Both servers must be running:

```bash
# Terminal 1 — backend
cd server && npm run dev   # http://localhost:4000

# Terminal 2 — frontend
cd client && npm run dev   # http://localhost:5173
```

`client/.env.local` must exist and contain:
```
VITE_API_URL=http://localhost:4000
```

If the file is missing, copy from `.env.example`. The client will fall back to `http://localhost:4000` by default.

---

## Build

| Check | Command | Expected |
|---|---|---|
| TypeScript compiles | `npm run build` | `✓ built in Xms`, zero errors |
| Dev server starts | `npm run dev` | `Local: http://localhost:5173` |

---

## Auth

| Action | Expected |
|---|---|
| Visit `/signup` | Clean form renders |
| Submit signup with all empty fields | All inline validation errors appear |
| Submit signup with mismatched passwords | "Passwords do not match" shown |
| Submit signup with password < 6 chars | "Password must be at least 6 characters" shown |
| Submit signup with duplicate email | Backend error message shown inline |
| Submit valid signup | Redirected to `/`, Navbar shows user name + Logout |
| Visit `/login` | Clean form renders |
| Submit login with empty fields | Inline validation errors appear |
| Submit login with wrong password | "Invalid email or password" shown |
| Submit valid login | Redirected to `/`, Navbar shows user name + Logout |
| Click Logout | Navbar shows Login + Sign Up, redirected to `/` |
| Visit `/login` while already logged in | Redirected to `/` |
| Visit `/signup` while already logged in | Redirected to `/` |
| Refresh page with valid token | User stays logged in |
| Refresh page with expired/invalid token | Silently logged out |

---

## Protected Routes

| Action | Expected |
|---|---|
| Visit `/cart` while logged out | Redirected to `/login` |
| Visit `/checkout` while logged out | Redirected to `/login` |
| Visit `/account` while logged out | Redirected to `/login` |
| Visit `/orders` while logged out | Redirected to `/login` |
| Visit any protected page while loading | Spinner shown, not a redirect |
| After login from a protected route redirect | Redirected back to the original page |

---

## Product Catalog

| Action | Expected |
|---|---|
| Visit `/` | Hero section + product grid loads |
| Product cards render | Image, name, category, price, stock count, View Details + cart icon |
| Broken product image | SVG placeholder shown, no broken image icon |
| Out-of-stock product | "Out of Stock" overlay on image, cart button disabled |
| Type in Search, click Apply | Grid shows only matching products |
| Select a category, click Apply | Grid shows only that category |
| Set Min Price / Max Price, click Apply | Grid shows products in price range |
| Click Clear Filters | All products reload |
| No products match filters | Empty state message shown |
| Backend is unreachable | Error state with "Try Again" button |

---

## Product Details

| Action | Expected |
|---|---|
| Click "View Details" on a card | Navigates to `/products/:id` |
| Product detail page loads | Image, name, description, category, stock, price, Add to Cart button |
| Click "Back to Catalog" | Returns to `/` |
| Visit `/products/99999` | "Product Not Found" page with back link |
| Out-of-stock product | "Out of Stock" button, disabled |
| Click "Add to Cart" while logged out | Redirected to `/login` |
| Click "Add to Cart" while logged in | Button shows spinner → "Added to Cart!" → Navbar badge updates |
| Click cart icon on product card while logged in | Same: spinner → checkmark → badge updates |

---

## Shopping Cart

| Action | Expected |
|---|---|
| Visit `/cart` with items | Items show image, name, category, unit price, quantity, subtotal |
| Visit `/cart` with empty cart | "Your cart is empty." with "Browse Products" button |
| Click + on an item | Quantity increases, subtotal and total update |
| Click − on item with quantity 1 | Item removed from cart |
| Click × on any item | Item removed immediately |
| Remove all items | Empty state shown |
| Navbar badge | Shows correct total quantity count |
| Logout | Badge disappears, cart state cleared |
| Login again | Cart reloads from backend (persisted) |
| Backend down on cart page | Error state with "Try Again" button |

---

## Checkout

| Action | Expected |
|---|---|
| Click "Proceed to Checkout" from cart | Navigates to `/checkout`, step 1 renders |
| Visit `/checkout` with empty cart | "Your cart is empty" message with Continue Shopping link |
| CheckoutStepper | Shows Shipping → Review → Confirmation |
| Submit shipping with any empty field | Inline validation error on that field |
| Fill all shipping fields, click Continue | Step 2 (Review) renders, stepper advances |
| Review step shows items | Names, unit price × qty, and subtotals match cart |
| Review step shows total | Matches cart total (backend-calculated) |
| Review step shows shipping | Displays entered name, address, city, country |
| Click "Back to Shipping" | Returns to step 1, previous values preserved |
| Click "Place Order" | Spinner while API call is in flight |
| Successful order | Step 3 confirmation: order ID, status, total, ship-to |
| Navbar badge after order | Shows 0 |
| Visit `/cart` after order | Empty state |
| Visit `/orders` after order | New order appears |
| Backend returns error during checkout | Error message shown in OrderReview, form preserved |

---

## Account

| Action | Expected |
|---|---|
| Visit `/account` | User name, email, initials avatar, member-since date |
| Click "Order History" card | Navigates to `/orders` |
| Click "Shopping Cart" card | Navigates to `/cart` |
| Click "Sign out" | Logged out, Navbar switches to Login + Sign Up |

---

## Order History

| Action | Expected |
|---|---|
| Visit `/orders` with no orders | "You haven't placed any orders yet." + Start Shopping button |
| Visit `/orders` after checkout | Order card shows ID, date, status badge, total |
| Status badge color | pending = yellow, processing = blue, shipped = purple, delivered = green, cancelled = red |
| Order items in card | Product name, unit price × quantity, line subtotal |
| Order footer | Shipping recipient name and address |
| Click "Continue Shopping" | Navigates to `/` |

---

## Responsive Design

| Check | Expected |
|---|---|
| Navbar on mobile (< 640px) | Logo + Cart badge + Account + Logout visible; Home and Orders hidden |
| Product grid on mobile | 1 column |
| Product grid on tablet (≥ 768px) | 2 columns |
| Product grid on desktop (≥ 1024px) | 3–4 columns |
| Cart page on mobile | Items and summary stacked vertically |
| Cart page on desktop | Items column + summary sidebar side by side |
| Checkout stepper on mobile | All 3 steps visible with connecting lines |
| Shipping form on mobile | Full width inputs, city/country side by side |
| Order cards on mobile | Header wraps cleanly, all info visible |

---

## No Console Errors

Open browser devtools → Console. Verify no errors appear during:
- Page load
- Login / logout
- Adding to cart
- Viewing cart
- Checkout flow
- Order history
