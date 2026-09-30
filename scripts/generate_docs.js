const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '..', 'docs');

const dirs = [
  '',
  'architecture',
  'business-logic',
  'environment',
  'frontend',
  'backend',
  'api',
  'database',
  'integrations',
  'infrastructure',
  'deployment',
  'security',
  'operations',
  'features',
  'maintenance',
  'troubleshooting',
  'code-reference',
  'audit'
];

// Create dirs
dirs.forEach(d => {
  const p = path.join(docsDir, d);
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
});

const files = {
  'README.md': `# Dandicraft Documentation Index

Welcome to the comprehensive technical documentation for **Dandicraft**.

## Navigation

- [Project Overview](01-project-overview.md)
- [Technology Stack](02-technology-stack.md)
- [Project Structure](03-project-structure.md)

### Directories
- [Architecture](architecture/01-system-overview.md)
- [Business Logic](business-logic/01-overview.md)
- [Environment](environment/01-overview.md)
- [Frontend](frontend/01-overview.md)
- [Backend](backend/01-overview.md)
- [API](api/01-overview.md)
- [Database](database/01-overview.md)
- [Integrations](integrations/01-overview.md)
- [Infrastructure](infrastructure/01-overview.md)
- [Deployment](deployment/01-overview.md)
- [Security](security/01-overview.md)
- [Operations](operations/01-overview.md)
- [Features](features/01-overview.md)
- [Maintenance](maintenance/01-overview.md)
- [Troubleshooting](troubleshooting/01-overview.md)
- [Code Reference](code-reference/01-overview.md)
- [Audit](audit/documentation-audit.md)
`,

  '01-project-overview.md': `# Project Overview

> Purpose: High-level overview of the Dandicraft project.

## Overview
Dandicraft is an e-commerce platform built with Next.js (App Router) and MySQL. It features a complete product catalog, shopping cart, checkout flow with Cardknox/Sola, and an admin dashboard for managing products and orders.

## Target Users
- **Customers**: Browse products, add to cart, checkout, view FAQ/policies.
- **Administrators**: Manage inventory, view orders, handle fulfillment.

## Environments
- **Development**: Localhost (127.0.0.1) DB, local Next.js server.
- **Production**: AivenCloud MySQL DB, Hostinger SMTP, Next.js deployment (Vercel/VPS).

## Important URLs
- **Production Application**: UNKNOWN — REQUIRES CONFIRMATION
- **Admin Panel**: \`/admin\`
`,

  '02-technology-stack.md': `# Technology Stack

> Purpose: Core technologies used in Dandicraft.

## Core
- **Framework**: Next.js 16.3.2 (App Router)
- **Frontend**: React 19.2.8, React DOM
- **Styling**: CSS Modules (\`.module.css\`)
- **Animations**: Framer Motion 13.2.0
- **Database**: MySQL (using \`mysql2\` 3.24.2 driver)

## Libraries & Integrations
- **Payments**: Cardknox React iFields (\`@cardknox/react-ifields\`), Sola API
- **Auth/Security**: \`bcryptjs\` 3.0.3 (Admin Auth)
- **Email**: \`nodemailer\` 10.0.10
- **CSV parsing**: \`csv-parser\` 3.2.1

## Tooling
- **Linting**: ESLint 9
- **Environment**: \`@next/env\`
- **Node**: Scripting for DB setup and utilities
`,

  '03-project-structure.md': `# Project Structure

> Purpose: Understanding the repository layout.

## Root Directories

- \`src/\`: Application source code.
  - \`src/app/\`: Next.js App Router pages and API routes.
  - \`src/components/\`: Reusable React components.
  - \`src/context/\`: React Context (e.g., \`CartContext.js\`).
  - \`src/lib/\`: Utilities, DB connection (\`db.js\`), auth (\`admin-auth.js\`).
  - \`src/data/\`: Static data files (\`products.json\`).
- \`scripts/\`: Node.js scripts for DB setup (\`setup-db.js\`), importing, and migrations.
- \`database/\`: Database schemas and SQL exports.
- \`public/\`: Static assets, images, and uploads.
`,

  'architecture/01-system-overview.md': `# System Architecture

> Purpose: System architecture diagram and request flows.

## Architecture

\`\`\`mermaid
flowchart TD
    User -->|HTTP| Frontend[Next.js Frontend]
    Frontend -->|API Routes| Backend[Next.js Backend API]
    Backend -->|mysql2| DB[(MySQL Database)]
    Backend -->|Nodemailer| SMTP[Hostinger SMTP]
    Frontend -->|Cardknox iFields| Cardknox[Cardknox API]
    Backend -->|Sola API Key| Sola[Sola Payment API]
\`\`\`

The application uses Next.js as a full-stack framework. The App Router handles both SSR/SSG pages and API routes (\`src/app/api\`).
`,

  'business-logic/01-overview.md': `# Business Logic

> Purpose: Central place for business rules.

## Core Workflows
- **Checkout Process**: Validates cart, calculates totals, charges via Sola/Cardknox, inserts order into DB, sends confirmation email.
- **Inventory Management**: Products have \`track_inventory\` and \`stock_quantity\`. Admin can toggle tracking and update stock.
- **Admin Authentication**: Uses JWT-like structure or session via Next.js backend, authenticated against \`admin_users\` table using bcrypt.
`,

  'business-logic/checkout-rules.md': `# Checkout Rules

## Trigger
User submits the checkout form in \`/checkout\`.

## Processing
1. Validate cart items.
2. Validate shipping info.
3. Process payment token via Cardknox/Sola.
4. If successful, insert \`orders\` record and \`order_items\` records.
5. Deduct \`stock_quantity\` if \`track_inventory\` is TRUE.
6. Send email via Nodemailer.
7. Return success response.

## External Services
- Sola / Cardknox
- Hostinger SMTP
`,

  'environment/01-overview.md': `# Environment Variables

> Purpose: Configuration requirements.

## \`.env.local\`

| Variable | Purpose | Required | Environment |
|---|---|---|---|
| \`MYSQL_HOST\` | Database host | Yes | All |
| \`MYSQL_PORT\` | Database port | Yes | All |
| \`MYSQL_USER\` | DB user | Yes | All |
| \`MYSQL_PASSWORD\` | DB password | Yes | All |
| \`MYSQL_DATABASE\` | DB name | Yes | All |
| \`ADMIN_NAME\` | Admin display name | No | Setup |
| \`ADMIN_EMAIL\` | Admin login email | No | Setup |
| \`ADMIN_PASSWORD\` | Admin initial password | No | Setup |
| \`SOLA_API_KEY\` | Payment processing | Yes | Prod/Dev |
| \`NEXT_PUBLIC_IFIELDS_KEY\` | Cardknox ifields | Yes | Prod/Dev |
| \`SMTP_HOST\` | Email server | Yes | Prod/Dev |
| \`SMTP_PORT\` | Email port | Yes | Prod/Dev |
| \`SMTP_USER\` | Email user | Yes | Prod/Dev |
| \`SMTP_PASSWORD\` | Email password | Yes | Prod/Dev |

*Note: Never commit actual values to git.*
`,

  'frontend/01-overview.md': `# Frontend Architecture

## Pages (App Router)
- \`/\`: Home page
- \`/shop\`: Product catalog
- \`/product/[slug]\`: Product details
- \`/cart\`: Shopping cart
- \`/checkout\`: Checkout flow
- \`/admin\`: Admin dashboard
- \`/contact\`: Contact form
- \`/faq\`, \`/shipping-returns\`, \`/terms-conditions\`: Info pages

## State Management
- \`src/context/CartContext.js\`: Manages cart items, totals, and persistence.

## Styling
- CSS Modules (\`.module.css\`) for component-scoped styling.
`,

  'backend/01-overview.md': `# Backend Architecture

## Overview
Next.js API Routes handle backend logic.

## Key Directories
- \`src/app/api/\`: Endpoint definitions.
- \`src/lib/\`: Shared backend utilities.
  - \`db.js\`: MySQL connection pool.
  - \`admin-auth.js\`: Authentication helpers.
  - \`product-validation.js\`: Payload validation.
`,

  'api/01-overview.md': `# API Endpoints

## Admin Endpoints
- \`GET /api/admin/products\`: List products.
- \`POST /api/admin/products\`: Create product.
- \`PUT /api/admin/products/[id]\`: Update product.
- \`GET /api/admin/orders\`: List orders.
- \`PUT /api/admin/orders/[id]/status\`: Update order status.
- \`POST /api/admin/login\`: Admin authentication.
- \`POST /api/admin/logout\`: Clear session.

## Public Endpoints
- \`GET /api/products\`: Fetch active products.
- \`GET /api/products/[slug]\`: Fetch product details.
- \`POST /api/orders\`: Submit checkout.
- \`POST /api/contact\`: Submit contact form.
`,

  'database/01-overview.md': `# Database Architecture

> Purpose: MySQL Database schema overview.

## Setup
Run \`npm run db:setup\` to execute \`scripts/setup-db.js\`.

## Tables (Inferred)
- \`products\`: Product catalog (id, slug, name, price, images_json, track_inventory, stock_quantity, etc.)
- \`orders\`: Customer orders.
- \`order_items\`: Items within an order.
- \`admin_users\`: Admin credentials (name, email, password_hash).

## Connections
Managed in \`src/lib/db.js\` using \`mysql2/promise\` pool.
`,

  'integrations/payments.md': `# Payment Integration

## Providers
- Cardknox iFields (Frontend)
- Sola API (Backend)

## Flow
1. Frontend uses \`@cardknox/react-ifields\` and \`NEXT_PUBLIC_IFIELDS_KEY\` to securely capture card info.
2. Token is sent to \`/api/orders\`.
3. Backend processes payment via Sola API using \`SOLA_API_KEY\`.
`,

  'integrations/email.md': `# Email Integration

## Provider
Hostinger SMTP via Nodemailer.

## Usage
- Order confirmations.
- Contact form submissions.

## Config
Requires \`SMTP_HOST\`, \`SMTP_PORT\`, \`SMTP_USER\`, \`SMTP_PASSWORD\`, \`SMTP_FROM_EMAIL\`, and \`CONTACT_EMAIL\`.
`,

  'infrastructure/01-overview.md': `# Infrastructure

> ⚠️ UNKNOWN — REQUIRES HUMAN CONFIRMATION

## Server Setup
The exact production server setup (VPS/Vercel) is unknown and requires confirmation.

## Database Hosting
The \`.env.local\` refers to AivenCloud (\`mysql-*.aivencloud.com\`) which implies managed MySQL hosting.
`,

  'deployment/01-overview.md': `# Deployment

> ⚠️ UNKNOWN — REQUIRES HUMAN CONFIRMATION

## Standard Next.js Deployment
1. Build: \`npm run build\` (runs \`npm run db:setup\` first).
2. Start: \`npm run start\`.
3. PM2 or Systemd can be used to keep the process alive.

Exact CI/CD pipelines and deployment targets require confirmation.
`,

  'security/01-overview.md': `# Security

## Authentication
- \`bcryptjs\` with a cost factor of 12 for hashing admin passwords.
- JWT/Session via Next.js backend logic for \`/admin\` routes.

## Payments
- Cardknox iFields ensures raw credit card numbers never touch the Dandicraft server.

## API Protection
- Admin API routes are protected by \`src/lib/admin-auth.js\`.
`,

  'operations/01-overview.md': `# Operations & Maintenance

## Setup Scripts
- \`npm run db:setup\`: Initializes DB schema and inserts products.
- \`npm run db:migrate:inventory\`: Migrates inventory data.

## Scripts
- \`scripts/generate-products.js\`: Generating product JSON.
- \`scripts/import-woocommerce.js\`: Import tool.
`,

  'features/01-overview.md': `# Features

## Storefront
- Product listing, details, variations (options_json, addons_json).
- Cart system using Context API.
- Checkout with shipping and Cardknox payments.

## Admin Dashboard
- Order management (view, update status).
- Product management (stock, pricing, images).
`,

  'maintenance/01-overview.md': `# Maintenance

## Adding a New Product
1. Login to \`/admin\`.
2. Navigate to Products -> Add Product.
3. Upload images and set pricing/inventory.

## Database Migrations
Custom migrations are placed in \`scripts/\` and executed via node (e.g., \`scripts/migrate-inventory.js\`).
`,

  'troubleshooting/01-overview.md': `# Troubleshooting

## Common Issues

### Database Connection Error
**Symptoms:** 500 error on loading shop or admin.
**Fix:** Verify \`MYSQL_*\` variables in \`.env.local\`. Ensure AivenCloud IP allowlists permit your server.

### Email Failing
**Symptoms:** Checkout completes but no email received.
**Fix:** Verify \`SMTP_PASSWORD\` and \`SMTP_PORT\` (typically 465 for secure, 587 for TLS). Check Hostinger mailbox limits.
`,

  'code-reference/01-overview.md': `# Code Reference

## Key Files
- Frontend Layout: \`src/app/layout.js\`
- DB Connection: \`src/lib/db.js\`
- Admin Auth: \`src/lib/admin-auth.js\`
- Order API: \`src/app/api/orders/route.js\`
`,

  'audit/documentation-audit.md': `# Documentation Audit

## Coverage
- Major systems documented: Yes
- APIs documented: High-level overview
- DB documented: Tables inferred from setup script
- Integrations: Sola, Cardknox, Hostinger SMTP
- Missing: Exact production deployment infrastructure.

## Next Steps
- Human review of production URLs.
- Verify exact CI/CD workflows.
`,
  'audit/unknown-information.md': `# Unknown Information

The following information requires confirmation from the project owner.

## Infrastructure
- Production VPS / Hosting provider (Vercel, DigitalOcean, etc.)
- Deployment pipeline / CI/CD processes
- Domain registrar and DNS provider

## Business
- Specific refund policy
- Production support contacts
`,
  'audit/secret-audit.md': `# Secret Audit

| Variable | Location | Purpose | Environment |
|---|---|---|---|
| \`MYSQL_PASSWORD\` | \`.env.local\` | DB connection | All |
| \`ADMIN_PASSWORD\` | \`.env.local\` | Admin account setup | Setup |
| \`SOLA_API_KEY\` | \`.env.local\` | Sola Payment processing | All |
| \`SMTP_PASSWORD\` | \`.env.local\` | Hostinger SMTP | All |
`,
  'audit/security-audit.md': `# Security Audit

## Findings
1. **Source Code Passwords**: The \\\`.env.local.example\\\` contains some default structures, and the current \\\`.env.local\\\` contains actual passwords. These must not be committed to Git.
2. **Admin Auth**: Verified that \`bcryptjs\` is used for hashing passwords in DB setup.
3. **Payments**: PCI compliance is aided by Cardknox iFields (React component).
`
};

for (const [filepath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(docsDir, filepath), content);
}

console.log('Documentation generated successfully!');
