# Business Logic

> Purpose: Central place for business rules.

## Core Workflows
- **Checkout Process**: Validates cart, calculates totals, charges via Sola/Cardknox, inserts order into DB, sends confirmation email.
- **Inventory Management**: Products have `track_inventory` and `stock_quantity`. Admin can toggle tracking and update stock.
- **Admin Authentication**: Uses JWT-like structure or session via Next.js backend, authenticated against `admin_users` table using bcrypt.
