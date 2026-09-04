import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import LoginForm from "./LoginForm";
import styles from "./Login.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Login | Dandicraft",
};

export default async function AdminLoginPage() {
  try {
    if (await getAdminSession()) redirect("/admin");
  } catch {
    // The form displays a useful setup message if MySQL is not configured yet.
  }

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brandMark}>D</div>
        <p className={styles.eyebrow}>Dandicraft workspace</p>
        <h1>Admin sign in</h1>
        <p className={styles.intro}>Manage the products, pricing, images, and availability shown in your store.</p>
        <LoginForm />
      </div>
    </section>
  );
}
