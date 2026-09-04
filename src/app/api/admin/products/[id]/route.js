import { getAdminSession, isSameOrigin } from "@/lib/admin-auth";
import { deleteProduct, updateProduct } from "@/lib/products";
import { validateProductInput } from "@/lib/product-validation";

export async function PUT(request, context) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!(await getAdminSession())) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const validated = validateProductInput(body, id);
  if (validated.error) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  try {
    const product = await updateProduct(id, validated.product);
    return product
      ? Response.json(product)
      : Response.json({ error: "Product not found." }, { status: 404 });
  } catch (error) {
    const duplicate = error?.code === "ER_DUP_ENTRY";
    return Response.json(
      { error: duplicate ? "That product slug already exists." : "Could not update the product." },
      { status: duplicate ? 409 : 500 }
    );
  }
}

export async function DELETE(request, context) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!(await getAdminSession())) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  return (await deleteProduct(id))
    ? Response.json({ success: true })
    : Response.json({ error: "Product not found." }, { status: 404 });
}
