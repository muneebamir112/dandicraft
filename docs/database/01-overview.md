# Database Architecture

> Purpose: MySQL Database schema overview.

## Setup
Run `npm run db:setup` to execute `scripts/setup-db.js`.

## Tables (Inferred)
- `products`: Product catalog (id, slug, name, price, images_json, track_inventory, stock_quantity, etc.)
- `orders`: Customer orders.
- `order_items`: Items within an order.
- `admin_users`: Admin credentials (name, email, password_hash).

## Connections
Managed in `src/lib/db.js` using `mysql2/promise` pool.
