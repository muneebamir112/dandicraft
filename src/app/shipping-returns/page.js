"use client";

import React from "react";
import Link from "next/link";
import styles from "./ShippingReturns.module.css";

export default function ShippingReturns() {
  return (
    <div className={styles.policyContainer}>
      {/* Banner */}
      <div className={styles.policyBanner}>
        <div className="container">
          <span className={styles.bannerSubtitle}>Store Policies</span>
          <h1 className={styles.bannerTitle}>Shipping & Returns Policy</h1>
          <p className={styles.bannerText}>
            Read detailed information regarding our shipping carriers, local Lakewood delivery options, order handling times, and return terms.
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <section className="section-padding">
        <div className="container">
          <div className={styles.policyGrid}>
            
            {/* Left Card: Shipping */}
            <div className={styles.policyCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>🚚</span>
                <h2>Shipping & Delivery</h2>
              </div>
              
              <div className={styles.cardBody}>
                <h3>Carrier & Handling</h3>
                <p>
                  All standard orders are packaged and dispatched within <strong>1–2 business days</strong> (Monday through Friday, excluding national holidays). 
                  Standard shipping is fulfilled via <strong>UPS Ground</strong>, which features a transit time of <strong>1–3 business days</strong> to most destinations.
                </p>

                <h3>Lakewood, NJ Deliveries</h3>
                <p>
                  For local orders within <strong>Lakewood, NJ</strong>, shipping is handled via <strong>MailPak</strong>. 
                  If you require <strong>same-day or next-business-day delivery</strong>, please request it explicitly in the <em>Order Notes</em> during checkout, and our dispatchers will accommodate your requests.
                </p>

                <h3>Tracking & Notifications</h3>
                <p>
                  Once your shipment is prepared, tracking links will be automatically generated and sent to your registered email address. 
                  Please monitor the tracking details for estimated delivery dates.
                </p>
              </div>
            </div>

            {/* Right Card: Returns */}
            <div className={styles.policyCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>🔒</span>
                <h2>Returns & Cancellations</h2>
              </div>
              
              <div className={styles.cardBody}>
                <h3>All Sales Are Final</h3>
                <p>
                  Because our products involve custom photo canvas printing, customized style arrangements, or prepared granular craft assets (like CandleArt wax granules), 
                  <strong> all sales are final</strong>. We do not accept returns, refunds, exchanges, or order cancellations once preparation has commenced.
                </p>

                <h3>Damages & Incorrect Items</h3>
                <p>
                  If you receive a kit that is damaged during transit or contains incorrect items (e.g. wrong design style or bear variation), 
                  you must report it to us within <strong>48 hours of delivery</strong>.
                </p>
                <p>
                  Please send an email to <strong>info@dandicraft.com</strong> containing your Order ID and photographic proof of the damaged packaging/contents. 
                  Once verified, we will dispatch a replacement item at no additional charge.
                </p>

                <h3>Custom Approvals</h3>
                <p>
                  Please review the size, selected addons, and custom uploaded photographs carefully. 
                  Dandicraft is not responsible for low-resolution or blurry prints resulting from low-quality image uploads.
                </p>
              </div>
            </div>

          </div>

          <div className={styles.policyFooterLink}>
            <p>Have specific logistics questions or need to make adjustments to a bulk order?</p>
            <Link href="/contact" className="btn btn-primary" style={{ marginTop: "16px" }}>
              Contact Shipping Dispatch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
