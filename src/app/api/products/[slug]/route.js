import fallbackProducts from "@/data/products.json";
import { findProductBySlug } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET(_request, context) {
  const { slug } = await context.params;
  try {
    const product = await findProductBySlug(slug);
    return product
      ? Response.json(product)
      : Response.json({ error: "Product not found." }, { status: 404 });
  } catch (error) {
    console.error("MySQL product lookup unavailable; using bundled catalog:", error.message);
    const product = fallbackProducts.find((item) => item.slug === slug);
    return product
      ? Response.json(product, { headers: { "X-Catalog-Source": "fallback" } })
      : Response.json({ error: "Product not found." }, { status: 404 });
  }
}
