# Security

## Authentication
- `bcryptjs` with a cost factor of 12 for hashing admin passwords.
- JWT/Session via Next.js backend logic for `/admin` routes.

## Payments
- Cardknox iFields ensures raw credit card numbers never touch the Dandicraft server.

## API Protection
- Admin API routes are protected by `src/lib/admin-auth.js`.
