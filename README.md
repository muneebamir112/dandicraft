This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### MySQL and admin setup

The storefront catalog is managed at `/admin` and stored in the local MySQL 8 server that can be managed through MySQL Workbench.

1. Copy `.env.local.example` to `.env.local`.
2. Enter the password used by the `root` connection in MySQL Workbench.
3. Replace `ADMIN_EMAIL` and `ADMIN_PASSWORD` with the private administrator login you want to use. The admin password must be at least 12 characters.
4. Create the database, tables, administrator, and seed the existing catalog:

```bash
npm run db:setup
```

5. Start the site and open `http://localhost:3000/admin`:

```bash
npm run dev
```

Product records, configuration options, add-ons, visibility, pricing, and uploaded product images are stored in MySQL. Uploaded images are limited to JPG, PNG, WebP, or GIF files up to 5 MB.

### Development server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
