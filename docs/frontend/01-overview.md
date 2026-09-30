# Frontend Architecture

## Pages (App Router)
- `/`: Home page
- `/shop`: Product catalog
- `/product/[slug]`: Product details
- `/cart`: Shopping cart
- `/checkout`: Checkout flow
- `/admin`: Admin dashboard
- `/contact`: Contact form
- `/faq`, `/shipping-returns`, `/terms-conditions`: Info pages

## State Management
- `src/context/CartContext.js`: Manages cart items, totals, and persistence.

## Styling
- CSS Modules (`.module.css`) for component-scoped styling.
