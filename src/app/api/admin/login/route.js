import {
  createAdminSession,
  isSameOrigin,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) {
    return Response.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    const admin = await verifyAdminCredentials(email, password);
    if (!admin) {
      return Response.json({ error: "Invalid email or password." }, { status: 401 });
    }
    await createAdminSession(admin.id);
    return Response.json({ success: true, admin });
  } catch (error) {
    console.error("Admin login failed:", error);
    return Response.json(
      { error: "Database is not configured. Run npm run db:setup first." },
      { status: 503 }
    );
  }
}
