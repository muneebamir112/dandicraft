import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { formData, cartItems, cartSubtotal, paymentMethod, token, expDate } = body;

    // Generate a unique order number (e.g. DC-738192)
    const orderNumber = `DC-${Math.floor(100000 + Math.random() * 900000)}`;

    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. Insert order
      const [orderResult] = await connection.execute(
        `INSERT INTO orders 
         (order_number, customer_name, customer_email, customer_phone, 
          shipping_address, shipping_city, shipping_state, shipping_zip, 
          order_notes, total_amount, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Payment')`,
        [
          orderNumber,
          formData.fullName,
          formData.email,
          formData.phone,
          formData.streetAddress,
          formData.city,
          formData.state,
          formData.zipCode,
          formData.orderNotes || "",
          cartSubtotal
        ]
      );

      const orderId = orderResult.insertId;

      // 2. Insert order items
      for (const item of cartItems) {
        // Calculate price for this specific item configuration
        const basePrice = item.price || 0;
        const addonsPrice = item.addons ? item.addons.reduce((sum, a) => sum + (a.price || 0), 0) : 0;
        const finalPrice = basePrice + addonsPrice;

        await connection.execute(
          `INSERT INTO order_items 
           (order_id, product_name, quantity, price, options_json, addons_json) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.name,
            item.quantity,
            finalPrice,
            JSON.stringify(item.options || {}),
            JSON.stringify(item.addons || [])
          ]
        );
      }

      await connection.commit();

      if (paymentMethod === "card") {
        let calculatedTotal = 0;
        for (const item of cartItems) {
          const basePrice = item.price || 0;
          const addonsPrice = item.addons ? item.addons.reduce((sum, a) => sum + (a.price || 0), 0) : 0;
          calculatedTotal += (basePrice + addonsPrice) * item.quantity;
        }

        const solaPayload = new URLSearchParams({
          xKey: process.env.SOLA_API_KEY || "dandicraft32881c0407974363bd5fd65983343283",
          xVersion: "4.5.9",
          xSoftwareName: "Dandicraft",
          xSoftwareVersion: "1.0",
          xCommand: "cc:sale",
          xAmount: calculatedTotal.toFixed(2),
          xCardNum: token,
          xExp: expDate,
          xName: formData.fullName,
          xStreet: formData.streetAddress,
          xZip: formData.zipCode,
          xEmail: formData.email,
          xInvoice: orderNumber,
          xCustom01: orderId.toString()
        });

        try {
          const solaRes = await fetch("https://x1.cardknox.com/gatewayapi", {
            method: "POST",
            body: solaPayload.toString(),
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          });
          
          const responseText = await solaRes.text();
          const responseParams = new URLSearchParams(responseText);
          const xResult = responseParams.get("xResult");
          const xError = responseParams.get("xError");

          if (xResult === "A") {
            await connection.execute(`UPDATE orders SET status = 'Processing' WHERE id = ?`, [orderId]);
            return NextResponse.json({ 
              success: true, 
              orderNumber,
              message: "Payment successful" 
            });
          } else {
            console.error("Sola payment failed:", responseText);
            await connection.execute(`UPDATE orders SET status = 'Failed Payment' WHERE id = ?`, [orderId]);
            return NextResponse.json({ 
              success: false, 
              error: xError || "Payment declined or failed." 
            });
          }
        } catch (solaError) {
          console.error("Sola gateway error:", solaError);
          await connection.execute(`UPDATE orders SET status = 'Failed Payment' WHERE id = ?`, [orderId]);
          return NextResponse.json({ 
            success: false, 
            error: "Failed to connect to payment gateway." 
          });
        }
      }

      // Cash payment response
      return NextResponse.json({ 
        success: true, 
        orderNumber,
        message: "Order placed successfully" 
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order. " + error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
