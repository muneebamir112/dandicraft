# System Architecture

> Purpose: System architecture diagram and request flows.

## Architecture

```mermaid
flowchart TD
    User -->|HTTP| Frontend[Next.js Frontend]
    Frontend -->|API Routes| Backend[Next.js Backend API]
    Backend -->|mysql2| DB[(MySQL Database)]
    Backend -->|Nodemailer| SMTP[Hostinger SMTP]
    Frontend -->|Cardknox iFields| Cardknox[Cardknox API]
    Backend -->|Sola API Key| Sola[Sola Payment API]
```

The application uses Next.js as a full-stack framework. The App Router handles both SSR/SSG pages and API routes (`src/app/api`).
