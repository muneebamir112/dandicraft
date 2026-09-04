import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_request, context) {
  const { id } = await context.params;
  if (!/^[a-f0-9-]{36}$/i.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  const [rows] = await db.execute(
    "SELECT mime_type, image_data FROM product_images WHERE id = ? LIMIT 1",
    [id]
  );
  if (!rows[0]) return new Response("Not found", { status: 404 });

  return new Response(rows[0].image_data, {
    headers: {
      "Content-Type": rows[0].mime_type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
