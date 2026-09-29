const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, 'docs');
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir);
}

const templates = {
    '01-project-overview.md': `# 01 - Project Overview

## Project Name
Dandicraft

## Overview
Dandicraft is an e-commerce platform built with Next.js and MySQL, specializing in craft products like custom paint-by-numbers, photo pillows, etc.

## Quick Summary
| Item | Details |
| --- | --- |
| Project | Dandicraft |
| Version | 0.1.0 |
| Status | In Development |
| Frontend | Next.js (React 19) |
| Backend | Next.js API Routes |
| Database | MySQL |
| Authentication | Custom (Admin only, bcrypt) |
| Repository | Local |

`,
    '02-system-architecture.md': `# 02 - System Architecture

## Architecture

\`\`\`mermaid
flowchart TD
User --> Frontend[Next.js Frontend]
Frontend --> API[Next.js API Routes]
API --> Database[(MySQL Database)]
API --> ExternalServices[SMTP]
\`\`\`
`,
    '03-technology-stack.md': `# 03 - Technology Stack

| Layer | Technology | Version | Purpose |
| --- | --- | --- | --- |
| Frontend | React / Next.js | 19.x / 16.3.x | UI Framework |
| Backend | Next.js API | 16.3.x | API Routes |
| Database | MySQL | 8.x | Primary Data Store |
| Mail | Nodemailer | 10.x | Email Service |
`,
    '04-project-structure.md': `# 04 - Project Structure

\`\`\`text
src/
├── app/               # Next.js App Router
│   ├── admin/         # Admin dashboard pages
│   ├── api/           # Backend API routes
│   ├── cart/          # Shopping cart
│   ├── checkout/      # Checkout flow
│   ├── product/       # Product details
│   └── shop/          # Storefront
├── components/        # React components
├── context/           # React Context (e.g., CartContext)
├── data/              # Static JSON data (e.g., products)
└── ...
database/              # SQL schema
scripts/               # Maintenance & Setup scripts
\`\`\`
`,
    '05-local-development-setup.md': `# 05 - Local Development Setup

## Prerequisites
- Node.js 18+
- MySQL 8.x

## Setup Commands

\`\`\`bash
# 1. Install dependencies
npm install

# 2. Setup Environment
cp .env.local.example .env.local
# Edit .env.local with your MySQL credentials

# 3. Setup Database (Schema & Seeds)
npm run db:setup

# 4. Start Development Server
npm run dev
\`\`\`
`,
    '06-environment-configuration.md': `# 06 - Environment Configuration

| Variable | Required | Purpose | Used By | Example |
| --- | --- | --- | --- | --- |
| MYSQL_HOST | Yes | Database Host | Backend | 127.0.0.1 |
| MYSQL_USER | Yes | Database User | Backend | root |
| MYSQL_PASSWORD | Yes | DB Password | Backend | |
| MYSQL_DATABASE | Yes | DB Name | Backend | dandicraft |
| ADMIN_EMAIL | No | Seed Admin | Backend | |
| ADMIN_PASSWORD | No | Seed Admin PW | Backend | |
| SMTP_HOST | Yes | Email Sending | Backend | smtp.hostinger.com |
`,
    '07-database-architecture.md': `# 07 - Database Architecture

## ER Diagram

\`\`\`mermaid
erDiagram
    products ||--o{ orders : "contains in items"
    orders ||--|{ order_items : "has"
    admin_users {
        int id
        string email
        string password_hash
    }
\`\`\`

Tables:
- \`products\`: Catalog items.
- \`admin_users\`: Administrator credentials.
- \`orders\`: E-commerce orders.
`,
    '08-api-documentation.md': `# 08 - API Documentation

## Routes
- \`/api/admin/login\` - POST - Admin authentication
- \`/api/orders\` - GET, POST - Order management
- \`/api/products\` - GET - Product catalog fetch
- \`/api/contact\` - POST - Send contact form emails

*(More routes exist in \`src/app/api/\`)*
`,
    '09-authentication-and-authorization.md': `# 09 - Authentication & Authorization

- **Admin Auth:** Uses custom \`bcryptjs\` hashing stored in \`admin_users\` table.
- **Sessions:** Implemented in Next.js backend (likely JWT or simple session cookie).
- **Customer Auth:** Not implemented (Guest Checkout).
`,
    '10-business-logic.md': `# 10 - Business Logic

- **Checkout Flow**: Users add items to cart, enter shipping info, and pay via Cardknox (\`@cardknox/react-ifields\`).
- **Inventory Management**: Products have \`track_inventory\` and \`stock_quantity\`.
`,
    '11-third-party-integrations.md': `# 11 - Third-Party Integrations

1. **Cardknox:** Payment gateway (using \`@cardknox/react-ifields\`).
2. **SMTP (Hostinger):** Used for order confirmations and contact forms.
`,
    '12-ai-and-automation.md': `# 12 - AI and Automation

> NOT VERIFIED FROM CODEBASE
No AI/ML workflows discovered in the primary application logic.
`,
    '13-background-jobs-and-crons.md': `# 13 - Background Jobs & Crons

> NOT VERIFIED FROM CODEBASE
No traditional background queues (like Redis/Bull) or crons discovered.
`,
    '14-webhooks-and-events.md': `# 14 - Webhooks and Events

> NOT VERIFIED FROM CODEBASE
Cardknox webhooks might be handled, but explicit webhook receivers were not fully documented in this scan.
`,
    '15-file-storage.md': `# 15 - File Storage

- Local storage or filesystem based uploads for user "has_upload" products.
> Details on exact cloud storage (S3, Cloudinary) not verified.
`,
    '16-frontend-documentation.md': `# 16 - Frontend Documentation

- **Framework**: Next.js App Router (\`src/app\`)
- **Styling**: Global CSS (\`globals.css\`) & CSS Modules.
- **Animation**: \`framer-motion\`.
`,
    '17-backend-documentation.md': `# 17 - Backend Documentation

- Built using Next.js Route Handlers.
- Direct MySQL access via \`mysql2\` promise wrappers.
`,
    '18-testing-and-quality.md': `# 18 - Testing & Quality

- Linter: \`eslint\` configured with \`eslint-config-next\`.
- Tests: No Jest or Cypress configuration discovered.
> NOT VERIFIED FROM CODEBASE: Comprehensive test suites.
`,
    '19-error-handling-and-logging.md': `# 19 - Error Handling & Logging

- Standard Next.js error boundaries.
- Console logging.
`,
    '20-security.md': `# 20 - Security

- Password hashing: \`bcryptjs\` with 12 rounds.
- Environment secrets for database and SMTP.
`,
    '21-deployment.md': `# 21 - Deployment

\`\`\`bash
npm run build
npm start
\`\`\`
- Requires a Node.js server (e.g., PM2) or Vercel environment.
- MySQL must be accessible from the deployment environment.
`,
    '22-cicd.md': `# 22 - CI/CD

> NOT VERIFIED FROM CODEBASE
No active GitHub Actions or GitLab CI pipelines were discovered.
`,
    '23-production-infrastructure.md': `# 23 - Production Infrastructure

- Node.js runtime.
- MySQL 8.0+ server.
- SMTP server for transactional emails.
`,
    '24-monitoring-and-maintenance.md': `# 24 - Monitoring & Maintenance

> NOT VERIFIED FROM CODEBASE
No specific APM tools (like DataDog or NewRelic) discovered.
`,
    '25-troubleshooting.md': `# 25 - Troubleshooting

## Database Connection Fails
**Symptoms:** 500 errors on API routes.
**Solution:** Verify \`MYSQL_*\` credentials in \`.env.local\`. Ensure MySQL server is running.

## Admin Cannot Login
**Symptoms:** Login rejected.
**Solution:** Run \`npm run db:setup\` with \`ADMIN_EMAIL\` and \`ADMIN_PASSWORD\` populated in env file to recreate/reset admin account.
`,
    '26-known-issues-and-technical-debt.md': `# 26 - Known Issues & Technical Debt

- Direct MySQL queries without a full ORM (Prisma/TypeORM), which can increase maintenance overhead.
- Missing automated test suite.
`,
    '27-future-improvements.md': `# 27 - Future Improvements

- RECOMMENDATION: Implement an ORM like Prisma.
- RECOMMENDATION: Add unit/e2e tests.
- RECOMMENDATION: Add Redis caching.
`,
    '28-developer-handover.md': `# 28 - Developer Handover

## Project
Dandicraft - Next.js e-commerce application.

## Local Setup
\`npm install\` -> edit \`.env.local\` -> \`npm run db:setup\` -> \`npm run dev\`.

## Database
MySQL setup required locally. Schema is in \`database/schema.sql\`.
`,
    '../README.md': `# Dandicraft
## Overview
Dandicraft E-Commerce Platform.

## Quick Start
\`npm install\` -> edit \`.env.local\` -> \`npm run db:setup\` -> \`npm run dev\`

## Tech Stack
- Next.js (React 19)
- MySQL

## Documentation
- [Project Overview](docs/01-project-overview.md)
- [System Architecture](docs/02-system-architecture.md)
- [Tech Stack](docs/03-technology-stack.md)
`,
    '../DEVELOPER_HANDOVER.md': `# Developer Handover

See [docs/28-developer-handover.md](docs/28-developer-handover.md) for full handover details.
`,
    '../CHANGELOG.md': `# Changelog

## [0.1.0] - Initial Documentation
- Generated full system documentation.
`,
    '../.env.example': `MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=dandicraft
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strongpassword123
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=user
SMTP_PASSWORD=pass
SMTP_FROM_EMAIL=no-reply@example.com
CONTACT_EMAIL=contact@example.com
`
};

for (const [filename, content] of Object.entries(templates)) {
    fs.writeFileSync(path.join(docsDir, filename), content);
}
console.log('Documentation generated successfully.');
