"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = [
  "Pending Payment",
  "Processing",
  "Shipped",
  "Successful",
  "Cancelled",
  "Refunded",
  "Failed Payment"
];

export default function OrderStatusSelect({ orderId, currentStatus }) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update status");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert(error.message);
      // Revert status on failure
      setStatus(currentStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case "Pending Payment": return { bg: "#fef3c7", text: "#92400e" };
      case "Processing": return { bg: "#d1fae5", text: "#065f46" };
      case "Successful": return { bg: "#dbeafe", text: "#1e40af" };
      case "Shipped": return { bg: "#e0e7ff", text: "#3730a3" };
      case "Failed Payment": 
      case "Cancelled": 
      case "Refunded": return { bg: "#fee2e2", text: "#b91c1c" };
      default: return { bg: "#f3f4f6", text: "#374151" };
    }
  };

  const colors = getStatusColor(status);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <select
        value={status}
        onChange={handleStatusChange}
        disabled={isUpdating}
        style={{
          appearance: "none",
          backgroundColor: colors.bg,
          color: colors.text,
          padding: "8px 32px 8px 12px",
          borderRadius: "6px",
          fontSize: "0.9rem",
          fontWeight: 600,
          border: `1px solid ${colors.bg}`,
          cursor: isUpdating ? "wait" : "pointer",
          outline: "none",
          fontFamily: "inherit"
        }}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      
      {/* Custom Dropdown Arrow */}
      <div style={{
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none",
        color: colors.text
      }}>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {isUpdating && (
        <span style={{ marginLeft: "10px", fontSize: "0.85rem", color: "var(--muted-text)" }}>
          Updating...
        </span>
      )}
    </div>
  );
}
