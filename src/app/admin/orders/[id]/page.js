import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import Link from "next/link";
import styles from "../../Admin.module.css";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }) {
  const admin = await requireAdmin();
  const { id: orderId } = await params;

  const connection = await db.getConnection();
  let order = null;
  let items = [];

  try {
    const [orderRows] = await connection.execute(
      `SELECT * FROM orders WHERE id = ?`,
      [orderId]
    );

    if (orderRows.length === 0) {
      return notFound();
    }
    
    order = orderRows[0];

    const [itemRows] = await connection.execute(
      `SELECT * FROM order_items WHERE order_id = ?`,
      [orderId]
    );
    
    items = itemRows.map(row => ({
      ...row,
      options_json: typeof row.options_json === 'string' ? JSON.parse(row.options_json || '{}') : (row.options_json || {}),
      addons_json: typeof row.addons_json === 'string' ? JSON.parse(row.addons_json || '[]') : (row.addons_json || [])
    }));
  } finally {
    connection.release();
  }

  return (
    <section className={styles.adminPage}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.eyebrow}>Dandicraft commerce</p>
            <h1>Order #{order.order_number}</h1>
            <p className={styles.subhead}>Placed on {new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div className={styles.topActions}>
            <Link href="/admin/orders" className={styles.secondaryButton}>Back to Orders</Link>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginTop: '30px' }}>
          
          {/* Left Column - Order Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '24px', border: '1px solid var(--border-light)' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>Order Items</h2>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr>
                    <th style={{ paddingBottom: '12px', color: 'var(--muted-text)' }}>Product</th>
                    <th style={{ paddingBottom: '12px', color: 'var(--muted-text)', textAlign: 'center' }}>Quantity</th>
                    <th style={{ paddingBottom: '12px', color: 'var(--muted-text)', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '16px 0' }}>
                        <div style={{ fontWeight: 600 }}>{item.product_name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginTop: '4px' }}>
                          {Object.entries(item.options_json).map(([k, v]) => `${k}: ${v}`).join(", ")}
                        </div>
                        {item.addons_json && item.addons_json.length > 0 && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>
                            Add-ons: {item.addons_json.map(a => a.name).join(", ")}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px 0', textAlign: 'center', fontWeight: 600 }}>x{item.quantity}</td>
                      <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid var(--border-light)' }}>
                    <td colSpan="2" style={{ padding: '16px 0', fontWeight: 700, fontSize: '1.1rem' }}>Total Amount</td>
                    <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary-deep)' }}>
                      ${Number(order.total_amount).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            {order.order_notes && (
              <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '24px', border: '1px solid var(--border-light)' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Order Notes</h2>
                <div style={{ backgroundColor: 'var(--primary-bg)', padding: '16px', borderRadius: 'var(--radius-sm)', color: 'var(--dark-text)' }}>
                  {order.order_notes}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Customer Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '24px', border: '1px solid var(--border-light)' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>Customer</h2>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '4px' }}>{order.customer_name}</div>
                <div><a href={`mailto:${order.customer_email}`} style={{ color: 'var(--primary)' }}>{order.customer_email}</a></div>
                <div style={{ color: 'var(--medium-text)' }}>{order.customer_phone}</div>
              </div>
              
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>Shipping Address</h3>
              <div style={{ color: 'var(--medium-text)', lineHeight: 1.5 }}>
                {order.shipping_address}<br />
                {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
              </div>
            </div>
            
            <div style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '24px', border: '1px solid var(--border-light)' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>Status</h2>
              <span style={{ 
                backgroundColor: order.status === 'Pending Payment' ? '#fef3c7' : '#d1fae5', 
                color: order.status === 'Pending Payment' ? '#92400e' : '#065f46', 
                padding: '8px 12px', 
                borderRadius: '6px', 
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'inline-block'
              }}>
                {order.status}
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
