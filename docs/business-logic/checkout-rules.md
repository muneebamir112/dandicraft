# Checkout Rules

## Trigger
User submits the checkout form in `/checkout`.

## Processing
1. Validate cart items.
2. Validate shipping info.
3. Process payment token via Cardknox/Sola.
4. If successful, insert `orders` record and `order_items` records.
5. Deduct `stock_quantity` if `track_inventory` is TRUE.
6. Send email via Nodemailer.
7. Return success response.

## External Services
- Sola / Cardknox
- Hostinger SMTP
