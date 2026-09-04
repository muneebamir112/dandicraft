import crypto from "node:crypto";
import { getAdminSession, isSameOrigin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!(await getAdminSession())) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("image");
  if (!(file instanceof File)) {
    return Response.json({ error: "Choose an image to upload." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json({ error: "Use a JPG, PNG, WebP, or GIF image." }, { status: 400 });
  }
  if (!file.size || file.size > MAX_IMAGE_BYTES) {
    return Response.json({ error: "Images must be 5 MB or smaller." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const data = Buffer.from(await file.arrayBuffer());
  await db.execute(
    `INSERT INTO product_images (id, filename, mime_type, byte_size, image_data)
     VALUES (?, ?, ?, ?, ?)`,
    [id, file.name.slice(0, 255), file.type, file.size, data]
  );

  return Response.json({ id, url: `/api/images/${id}` }, { status: 201 });
}
