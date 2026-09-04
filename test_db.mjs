import "server-only";
import { db } from "./src/lib/db.js";

async function test() {
  const connection = await db.getConnection();
  try {
    const [orderResult] = await connection.execute(
      `INSERT INTO orders 
       (order_number, customer_name, customer_email, customer_phone, 
        shipping_address, shipping_city, shipping_state, shipping_zip, 
        order_notes, total_amount, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Payment')`,
      [
        "TEST-123",
        "Test Name",
        "test@example.com",
        "123",
        "123 St",
        "City",
        "ST",
        "12345",
        "",
        10.00
      ]
    );
    console.log("Insert ID:", orderResult.insertId);
  } catch(e) {
    console.error("DB Error:", e);
  } finally {
    connection.release();
    process.exit(0);
  }
}
test();
