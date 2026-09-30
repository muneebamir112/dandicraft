# Project Structure

> Purpose: Understanding the repository layout.

## Root Directories

- `src/`: Application source code.
  - `src/app/`: Next.js App Router pages and API routes.
  - `src/components/`: Reusable React components.
  - `src/context/`: React Context (e.g., `CartContext.js`).
  - `src/lib/`: Utilities, DB connection (`db.js`), auth (`admin-auth.js`).
  - `src/data/`: Static data files (`products.json`).
- `scripts/`: Node.js scripts for DB setup (`setup-db.js`), importing, and migrations.
- `database/`: Database schemas and SQL exports.
- `public/`: Static assets, images, and uploads.
