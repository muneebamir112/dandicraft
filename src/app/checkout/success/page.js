"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "../../../context/CartContext";
import styles from "../Checkout.module.css";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order_number");
  const { clearCart, isLoaded } = useCart();

  useEffect(() => {
    if (isLoaded) {
      clearCart();
    }
  }, [clearCart, isLoaded]);

  return (
    <div className={styles.successContainer}>
      <div className="container">
        <div className={styles.successCard}>
          <div className={styles.checkIconWrapper}>
            <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 className={styles.successTitle}>Order Confirmed!</h1>
          <p className={styles.orderNumberLabel}>
            Order Number: <strong>{orderNumber || "Processing"}</strong>
          </p>

          <div className={styles.successDivider}></div>

          <div className={styles.successDetails}>
            <h3>What happens next?</h3>
            <ul className={styles.stepsList}>
              <li>
                <strong>Review & Verification:</strong> Since your order contains custom designs, paint arrangements, or specific jar capacities, our staff is reviewing your requirements.
              </li>
              <li>
                <strong>Payment Successful:</strong> Your card has been successfully processed securely via Stripe.
              </li>
              <li>
                <strong>Shipping Prep:</strong> Custom canvases enter printing/preparation. Packages ship via <strong>UPS Ground</strong> (or <strong>MailPak</strong> for local Lakewood shipments).
              </li>
            </ul>
          </div>

          <div className={styles.thankYouNote}>
            ✨ Thank you for choosing Dandicraft to craft your special moments!
          </div>

          <Link href="/shop" className="btn btn-primary" style={{ padding: "12px 30px" }}>
            Continue to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<div className={styles.successContainer}><div className="container"><h2 style={{textAlign: 'center'}}>Loading confirmation...</h2></div></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
