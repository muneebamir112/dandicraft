import { destroyAdminSession, isSameOrigin } from "@/lib/admin-auth";

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }
  await destroyAdminSession();
  return Response.json({ success: true });
}
