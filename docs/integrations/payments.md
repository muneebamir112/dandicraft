# Payment Integration

## Providers
- Cardknox iFields (Frontend)
- Sola API (Backend)

## Flow
1. Frontend uses `@cardknox/react-ifields` and `NEXT_PUBLIC_IFIELDS_KEY` to securely capture card info.
2. Token is sent to `/api/orders`.
3. Backend processes payment via Sola API using `SOLA_API_KEY`.
