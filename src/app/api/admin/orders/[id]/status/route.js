import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();
    
    // In Next.js 15+, params is a Promise
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || typeof status !== "string") {
      return NextResponse.json({ error: "Valid status string is required." }, { status: 400 });
    }

    const connection = await db.getConnection();
    try {
      const [result] = await connection.execute(
        "UPDATE orders SET status = ? WHERE id = ?",
        [status.trim(), orderId]
      );

      if (result.affectedRows === 0) {
        return NextResponse.json({ error: "Order not found." }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: "Order status updated successfully." });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json({ error: "Could not update order status. Please try again." }, { status: 500 });
  }
}
