import { findProductBySlug } from "@/lib/products";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function GET(_request, context) {
  const { slug } = await context.params;
  const product = await findProductBySlug(slug);

  if (!product) {
    return Response.json({ error: "Product not found." }, { status: 404 });
  }

  const [rows] = await db.execute(
    `SELECT id, reviewer_name AS name, rating, review, created_at AS createdAt
     FROM product_reviews
     WHERE product_id = ? AND approved = TRUE
     ORDER BY created_at DESC`,
    [product.id]
  );

  return Response.json(rows);
}

export async function POST(request, context) {
  const { slug } = await context.params;
  const product = await findProductBySlug(slug);

  if (!product) {
    return Response.json({ error: "Product not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const name = cleanText(body?.name, 120);
  const email = cleanText(body?.email, 255).toLowerCase();
  const review = cleanText(body?.review, 4000);
  const rating = Number(body?.rating);

  if (!name || !review || !email || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json({ error: "Please provide your name, email, rating, and review." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  await db.execute(
    `INSERT INTO product_reviews (product_id, reviewer_name, reviewer_email, rating, review)
     VALUES (?, ?, ?, ?, ?)`,
    [product.id, name, email, rating, review]
  );

  return Response.json({ success: true }, { status: 201 });
}