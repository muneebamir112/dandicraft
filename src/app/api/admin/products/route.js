import { getAdminSession, isSameOrigin } from "@/lib/admin-auth";
import { createProduct, listProducts } from "@/lib/products";
import { validateProductInput } from "@/lib/product-validation";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getAdminSession())) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  return Response.json(await listProducts({ includeInactive: true }));
}

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!(await getAdminSession())) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = validateProductInput(body);
  if (validated.error) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  try {
    const product = await createProduct(validated.product);
    return Response.json(product, { status: 201 });
  } catch (error) {
    const duplicate = error?.code === "ER_DUP_ENTRY";
    return Response.json(
      { error: duplicate ? "That product slug already exists." : "Could not create the product." },
      { status: duplicate ? 409 : 500 }
    );
  }
}
