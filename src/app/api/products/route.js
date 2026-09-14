import { listProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await listProducts());
  } catch (error) {
    console.error("MySQL catalog unavailable; serving an empty catalog:", error.message);
    return Response.json([], {
      headers: { "X-Catalog-Source": "empty" },
    });
  }
}
