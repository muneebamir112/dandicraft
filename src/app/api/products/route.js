import { listProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await listProducts(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("MySQL catalog unavailable:", error.message);
    return Response.json({ error: "Product catalog temporarily unavailable." }, {
      status: 503,
      headers: { "Cache-Control": "no-store", "Retry-After": "30" },
    });
  }
}
