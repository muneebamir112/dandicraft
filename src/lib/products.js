import "server-only";
import { db } from "@/lib/db";

function parseJson(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function mapProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: Number(row.price || 0),
    description: row.description || "",
    hasUpload: Boolean(row.has_upload),
    requiresQuote: Boolean(row.requires_quote),
    minQty: Number(row.min_qty || 1),
    image: row.image || "",
    images: parseJson(row.images_json),
    options: parseJson(row.options_json),
    addons: parseJson(row.addons_json),
    featured: Boolean(row.featured),
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listProducts({ includeInactive = false } = {}) {
  const [rows] = await db.query(
    `SELECT * FROM products ${includeInactive ? "" : "WHERE active = TRUE"} ORDER BY updated_at DESC, name ASC`
  );
  return rows.map(mapProduct);
}

export async function findProductBySlug(slug, { includeInactive = false } = {}) {
  const [rows] = await db.execute(
    `SELECT * FROM products WHERE slug = ? ${includeInactive ? "" : "AND active = TRUE"} LIMIT 1`,
    [slug]
  );
  return rows[0] ? mapProduct(rows[0]) : null;
}

export async function createProduct(product) {
  await db.execute(
    `INSERT INTO products
      (id, slug, name, category, price, description, has_upload, requires_quote,
       min_qty, image, images_json, options_json, addons_json, featured, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      product.id,
      product.slug,
      product.name,
      product.category,
      product.price,
      product.description,
      product.hasUpload,
      product.requiresQuote,
      product.minQty,
      product.image,
      JSON.stringify(product.images || []),
      JSON.stringify(product.options),
      JSON.stringify(product.addons),
      product.featured,
      product.active,
    ]
  );
  return findProductBySlug(product.slug, { includeInactive: true });
}

export async function updateProduct(id, product) {
  const [existingRows] = await db.execute("SELECT image, images_json FROM products WHERE id = ? LIMIT 1", [id]);
  const previousImage = existingRows[0]?.image || "";
  const previousImages = parseJson(existingRows[0]?.images_json);
  
  const [result] = await db.execute(
    `UPDATE products SET
      slug = ?, name = ?, category = ?, price = ?, description = ?, has_upload = ?,
      requires_quote = ?, min_qty = ?, image = ?, images_json = ?, options_json = ?, addons_json = ?,
      featured = ?, active = ?
     WHERE id = ?`,
    [
      product.slug,
      product.name,
      product.category,
      product.price,
      product.description,
      product.hasUpload,
      product.requiresQuote,
      product.minQty,
      product.image,
      JSON.stringify(product.images || []),
      JSON.stringify(product.options),
      JSON.stringify(product.addons),
      product.featured,
      product.active,
      id,
    ]
  );
  if (!result.affectedRows) return null;

  if (previousImage && previousImage !== product.image) {
    const match = previousImage.match(/^\/api\/images\/([a-f0-9-]{36})$/i);
    if (match) await db.execute("DELETE FROM product_images WHERE id = ?", [match[1]]);
  }

  if (previousImages && previousImages.length > 0) {
    for (const pImage of previousImages) {
      if (!product.images?.includes(pImage)) {
        const match = pImage.match(/^\/api\/images\/([a-f0-9-]{36})$/i);
        if (match) await db.execute("DELETE FROM product_images WHERE id = ?", [match[1]]);
      }
    }
  }

  return findProductBySlug(product.slug, { includeInactive: true });
}

export async function deleteProduct(id) {
  const [rows] = await db.execute("SELECT image, images_json FROM products WHERE id = ? LIMIT 1", [id]);
  const image = rows[0]?.image || "";
  const images = parseJson(rows[0]?.images_json);
  const [result] = await db.execute("DELETE FROM products WHERE id = ?", [id]);

  const match = image.match(/^\/api\/images\/([a-f0-9-]{36})$/i);
  if (match) {
    await db.execute("DELETE FROM product_images WHERE id = ?", [match[1]]);
  }

  if (images && images.length > 0) {
    for (const img of images) {
      const matchImg = img.match(/^\/api\/images\/([a-f0-9-]{36})$/i);
      if (matchImg) await db.execute("DELETE FROM product_images WHERE id = ?", [matchImg[1]]);
    }
  }

  return result.affectedRows > 0;
}
