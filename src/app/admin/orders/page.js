import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import Link from "next/link";
import styles from "../Admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const admin = await requireAdmin();

  const connection = await db.getConnection();
  let orders = [];
  try {
    const [rows] = await connection.execute(
      `SELECT id, order_number, customer_name, customer_email, total_amount, status, created_at 
       FROM orders 
       ORDER BY created_at DESC 
       LIMIT 100`
    );
    orders = rows;
  } finally {
    connection.release();
  }

  return (
    <section className={styles.adminPage}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.eyebrow}>Dandicraft commerce</p>
            <h1>Orders workspace</h1>
            <p className={styles.subhead}>Signed in as {admin.name}</p>
          </div>
          <div className={styles.topActions}>
            <Link href="/admin" className={styles.secondaryButton}>Back to Products</Link>
          </div>
        </header>

        <div className={styles.stats}>
          <article><strong>{orders.length}</strong><span>Recent Orders</span></article>
        </div>

        <div className={styles.ordersTableContainer} style={{ backgroundColor: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '20px', border: '1px solid var(--border-light)' }}>
          {orders.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted-text)' }}>No orders found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                  <th style={{ padding: '12px', color: 'var(--muted-text)' }}>Order #</th>
                  <th style={{ padding: '12px', color: 'var(--muted-text)' }}>Date</th>
                  <th style={{ padding: '12px', color: 'var(--muted-text)' }}>Customer</th>
                  <th style={{ padding: '12px', color: 'var(--muted-text)' }}>Total</th>
                  <th style={{ padding: '12px', color: 'var(--muted-text)' }}>Status</th>
                  <th style={{ padding: '12px', color: 'var(--muted-text)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{order.order_number}</td>
                    <td style={{ padding: '12px', color: 'var(--medium-text)' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>{order.customer_email}</div>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>${Number(order.total_amount).toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        backgroundColor: order.status === 'Pending Payment' ? '#fef3c7' : '#d1fae5', 
                        color: order.status === 'Pending Payment' ? '#92400e' : '#065f46', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Link href={`/admin/orders/${order.id}`} className={styles.secondaryButton} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
