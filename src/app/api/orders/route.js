import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2023-10-16"
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { formData, cartItems, cartSubtotal, paymentMethod } = body;

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
        // Create Stripe checkout session
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const host = request.headers.get("host") || "localhost:3000";
        const origin = `${protocol}://${host}`;

        // Create line items for Stripe
        const line_items = cartItems.map(item => {
          const basePrice = item.price || 0;
          const addonsPrice = item.addons ? item.addons.reduce((sum, a) => sum + (a.price || 0), 0) : 0;
          const finalPrice = basePrice + addonsPrice;
          
          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: item.name,
              },
              unit_amount: Math.round(finalPrice * 100), // Stripe expects cents
            },
            quantity: item.quantity,
          };
        });

        try {
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_number=${orderNumber}`,
            cancel_url: `${origin}/checkout`,
            customer_email: formData.email,
            client_reference_id: orderId.toString(),
            metadata: {
              orderNumber: orderNumber
            }
          });

          return NextResponse.json({ 
            success: true, 
            checkoutUrl: session.url 
          });
        } catch (stripeError) {
          console.error("Stripe error:", stripeError);
          // Fall back to cash if stripe is misconfigured (e.g. no key)
          return NextResponse.json({ 
            success: true, 
            orderNumber,
            message: "Stripe error, order placed as pending." 
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
