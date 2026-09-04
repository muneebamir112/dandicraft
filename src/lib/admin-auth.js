import "server-only";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const SESSION_COOKIE = "dandicraft_admin_session";
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function verifyAdminCredentials(email, password) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const [rows] = await db.execute(
    "SELECT id, name, email, password_hash FROM admin_users WHERE email = ? LIMIT 1",
    [normalizedEmail]
  );
  const admin = rows[0];
  if (!admin || !(await bcrypt.compare(String(password || ""), admin.password_hash))) {
    return null;
  }
  return { id: admin.id, name: admin.name, email: admin.email };
}

export async function createAdminSession(adminId) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.execute("DELETE FROM admin_sessions WHERE expires_at <= NOW()");
  await db.execute(
    "INSERT INTO admin_sessions (admin_user_id, token_hash, expires_at) VALUES (?, ?, ?)",
    [adminId, tokenHash, expiresAt]
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: expiresAt,
    path: "/",
  });
}

export async function getAdminSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [rows] = await db.execute(
    `SELECT users.id, users.name, users.email
     FROM admin_sessions sessions
     INNER JOIN admin_users users ON users.id = sessions.admin_user_id
     WHERE sessions.token_hash = ? AND sessions.expires_at > NOW()
     LIMIT 1`,
    [hashToken(token)]
  );
  return rows[0] || null;
}

export async function requireAdmin() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.execute("DELETE FROM admin_sessions WHERE token_hash = ?", [hashToken(token)]);
  }
  cookieStore.delete(SESSION_COOKIE);
}

export function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
