const MAX_OPTIONS = 20;
const MAX_ADDONS = 30;

function text(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function makeSlug(value) {
  return text(value, 160)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateProductInput(body, existingId = "") {
  const name = text(body?.name, 255);
  const slug = makeSlug(body?.slug || name);
  const category = text(body?.category, 120);
  const description = text(body?.description, 20000);
  const image = text(body?.image, 2048);
  const price = Number(body?.price);
  const minQty = Math.max(1, Math.floor(Number(body?.minQty || 1)));

  if (!name || !slug || !category || !description) {
    return { error: "Name, slug, category, and description are required." };
  }
  if (!Number.isFinite(price) || price < 0 || price > 99999999) {
    return { error: "Price must be a valid non-negative number." };
  }
  if (!Number.isFinite(minQty) || minQty > 1000000) {
    return { error: "Minimum quantity is invalid." };
  }
  if (image && !image.startsWith("/") && !/^https:\/\//i.test(image)) {
    return { error: "Image must be an uploaded image path or an HTTPS URL." };
  }

  const rawOptions = Array.isArray(body?.options) ? body.options.slice(0, MAX_OPTIONS) : [];
  const options = rawOptions
    .map((option) => ({
      name: text(option?.name, 120),
      type: option?.type === "swatch" ? "swatch" : "select",
      values: Array.isArray(option?.values)
        ? option.values.map((value) => text(value, 120)).filter(Boolean).slice(0, 50)
        : [],
    }))
    .filter((option) => option.name && option.values.length);

  const rawAddons = Array.isArray(body?.addons) ? body.addons.slice(0, MAX_ADDONS) : [];
  const addons = rawAddons
    .map((addon) => ({
      name: text(addon?.name, 160),
      price: Number(addon?.price || 0),
      description: text(addon?.description, 1000),
    }))
    .filter((addon) => addon.name && Number.isFinite(addon.price) && addon.price >= 0);

  let images = [];
  if (Array.isArray(body?.images)) {
    images = body.images.map(img => text(img, 2048)).filter(img => 
      img && (img.startsWith("/") || /^https:\/\//i.test(img))
    ).slice(0, 20); // allow up to 20 images
  }

  return {
    product: {
      id: existingId || slug,
      slug,
      name,
      category,
      price,
      description,
      hasUpload: Boolean(body?.hasUpload),
      requiresQuote: Boolean(body?.requiresQuote),
      minQty,
      image: image || (images.length > 0 ? images[0] : ""), // fallback primary image
      images,
      options,
      addons,
      featured: Boolean(body?.featured),
      active: body?.active !== false,
    },
  };
}
