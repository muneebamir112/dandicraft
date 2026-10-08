import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const settings = await getSettings(['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD']);
    // Mask the password for the frontend
    if (settings.SMTP_PASSWORD) {
      settings.SMTP_PASSWORD = "••••••••";
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to fetch settings", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const allowedKeys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD'];
    
    for (const [k, v] of Object.entries(body)) {
      if (allowedKeys.includes(k)) {
        // If the password was sent masked, don't update it
        if (k === 'SMTP_PASSWORD' && v === '••••••••') {
          continue;
        }
        await db.execute(
          'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
          [k, v, v]
        );
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save settings", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
