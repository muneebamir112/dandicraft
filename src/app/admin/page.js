import { requireAdmin } from "@/lib/admin-auth";
import { listProducts } from "@/lib/products";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Store Admin | Dandicraft",
};

export default async function AdminPage() {
  const admin = await requireAdmin();
  const products = await listProducts({ includeInactive: true });
  return <AdminDashboard initialProducts={products} admin={admin} />;
}
