import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();
    
    // In Next.js 15+, params is a Promise in API routes
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // First delete associated order items to prevent foreign key constraint failures (if cascade is not set)
      await connection.execute("DELETE FROM order_items WHERE order_id = ?", [orderId]);
      
      // Then delete the order itself
      const [result] = await connection.execute("DELETE FROM orders WHERE id = ?", [orderId]);
      
      await connection.commit();

      if (result.affectedRows === 0) {
        return NextResponse.json({ error: "Order not found." }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: "Order deleted successfully." });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Failed to delete order:", error);
    return NextResponse.json({ error: "Could not delete order. Please try again." }, { status: 500 });
  }
}
