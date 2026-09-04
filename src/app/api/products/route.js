import fallbackProducts from "@/data/products.json";
import { listProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await listProducts());
  } catch (error) {
    console.error("MySQL catalog unavailable; serving the bundled catalog:", error.message);
    return Response.json(fallbackProducts, {
      headers: { "X-Catalog-Source": "fallback" },
    });
  }
}
