# API Endpoints

## Admin Endpoints
- `GET /api/admin/products`: List products.
- `POST /api/admin/products`: Create product.
- `PUT /api/admin/products/[id]`: Update product.
- `GET /api/admin/orders`: List orders.
- `PUT /api/admin/orders/[id]/status`: Update order status.
- `POST /api/admin/login`: Admin authentication.
- `POST /api/admin/logout`: Clear session.

## Public Endpoints
- `GET /api/products`: Fetch active products.
- `GET /api/products/[slug]`: Fetch product details.
- `POST /api/orders`: Submit checkout.
- `POST /api/contact`: Submit contact form.
