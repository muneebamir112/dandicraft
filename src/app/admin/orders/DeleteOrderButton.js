"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../Admin.module.css";

export default function DeleteOrderButton({ orderId, redirectAfterDelete = false }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this order?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "DELETE",
      });
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete order");
      }

      if (redirectAfterDelete) {
        router.push("/admin/orders");
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      type="button" 
      className={styles.dangerLink} 
      onClick={handleDelete}
      disabled={isDeleting}
      style={{
        padding: "6px 12px",
        fontSize: "0.85rem",
        background: "transparent",
        border: "1px solid var(--danger)",
        borderRadius: "var(--radius-sm)",
        color: "var(--danger)",
        cursor: isDeleting ? "not-allowed" : "pointer",
        opacity: isDeleting ? 0.6 : 1,
      }}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
