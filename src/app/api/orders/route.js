import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function checkoutError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function failPaymentAndRestoreStock(connection, orderId, inventoryAdjustments) {
  await connection.beginTransaction();
  try {
    await connection.execute(`UPDATE orders SET status = 'Failed Payment' WHERE id = ?`, [orderId]);
    for (const adjustment of inventoryAdjustments) {
      await connection.execute(
        "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ? AND track_inventory = TRUE",
        [adjustment.quantity, adjustment.id]
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { formData, cartItems, cartSubtotal, paymentMethod, token, cvvToken, expDate } = body;

    if (!['card', 'cash'].includes(paymentMethod)) {
      return NextResponse.json({ error: "Please select a valid payment method." }, { status: 400 });
    }
    if (paymentMethod === "card" && (!token || !cvvToken || !/^\d{4}$/.test(String(expDate || "")))) {
      return NextResponse.json({ error: "Card payment details are incomplete." }, { status: 400 });
    }
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    // Generate a unique order number (e.g. DC-738192)
    const orderNumber = `DC-${Math.floor(100000 + Math.random() * 900000)}`;

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();
      const inventoryAdjustments = [];

      const productIds = [...new Set(cartItems.map((item) => item.id).filter(Boolean))];
      if (!productIds.length || cartItems.some((item) => !item.id)) {
        throw checkoutError("Invalid cart items.");
      }
      const placeholders = productIds.map(() => "?").join(", ");
      const [productRows] = await connection.execute(
        `SELECT id, name, min_qty AS minQty, track_inventory AS trackInventory,
                stock_quantity AS stockQuantity
         FROM products
         WHERE id IN (${placeholders}) AND active = TRUE
         FOR UPDATE`,
        productIds
      );
      if (productRows.length !== productIds.length) {
        throw checkoutError("A product in your cart is no longer available.", 409);
      }

      const productsById = new Map(productRows.map((product) => [product.id, {
        ...product,
        minQty: Number(product.minQty),
        trackInventory: Boolean(product.trackInventory),
        stockQuantity: Number(product.stockQuantity),
      }]));
      const requestedQuantities = new Map();

      for (const item of cartItems) {
        const product = productsById.get(item.id);
        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity < product.minQty) {
          throw checkoutError(
            `Minimum order quantity for ${product.name} is ${product.minQty}.`
          );
        }
        requestedQuantities.set(item.id, (requestedQuantities.get(item.id) || 0) + quantity);
      }

      for (const [productId, requestedQuantity] of requestedQuantities) {
        const product = productsById.get(productId);
        if (product.trackInventory && requestedQuantity > product.stockQuantity) {
          throw checkoutError(
            `Only ${product.stockQuantity} units of ${product.name} are currently available.`,
            409
          );
        }
      }

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
        const basePrice = item.basePrice ?? item.price ?? 0;
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

      for (const [productId, requestedQuantity] of requestedQuantities) {
        const product = productsById.get(productId);
        if (!product.trackInventory) continue;

        const [stockResult] = await connection.execute(
          `UPDATE products
           SET stock_quantity = stock_quantity - ?
           WHERE id = ? AND track_inventory = TRUE AND stock_quantity >= ?`,
          [requestedQuantity, productId, requestedQuantity]
        );
        if (stockResult.affectedRows !== 1) {
          throw checkoutError(
            `${product.name} no longer has enough stock for this order.`,
            409
          );
        }
        inventoryAdjustments.push({ id: productId, quantity: requestedQuantity });
      }

      await connection.commit();

      if (paymentMethod === "card") {
        let calculatedTotal = 0;
        for (const item of cartItems) {
          const basePrice = item.basePrice ?? item.price ?? 0;
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
          xCVV: cvvToken,
          xExp: expDate,
          xName: formData.fullName,
          xStreet: formData.streetAddress,
          xZip: formData.zipCode,
          xEmail: formData.email,
          xInvoice: orderNumber,
          xCustom01: orderId.toString()
        });

        let responseText;
        try {
          const solaRes = await fetch("https://x1.cardknox.com/gatewayapi", {
            method: "POST",
            signal: AbortSignal.timeout(30000),
            body: solaPayload.toString(),
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          });
          responseText = await solaRes.text();
        } catch (solaError) {
          console.error("Sola gateway error:", solaError);
          await failPaymentAndRestoreStock(connection, orderId, inventoryAdjustments);
          return NextResponse.json({
            success: false,
            error: "Failed to connect to payment gateway."
            }, { status: 502 });
        }

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
        }

        console.error("Sola payment failed:", responseText);
        await failPaymentAndRestoreStock(connection, orderId, inventoryAdjustments);
        return NextResponse.json({
          success: false,
          error: xError || "Payment declined or failed."
        }, { status: 402 });
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
      { error: [400, 409].includes(error.status) ? error.message : "Failed to create order." },
      { status: error.status || 500 }
    );
  }
}
