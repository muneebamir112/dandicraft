"use client";

import React from "react";
import Link from "next/link";
import styles from "./TermsConditions.module.css";

export default function TermsConditions() {
  return (
    <div className={styles.termsContainer}>
      <div className={styles.termsBanner}>
        <div className="container">
          <span className={styles.bannerSubtitle}>Legal Documents</span>
          <h1 className={styles.bannerTitle}>Terms & Conditions</h1>
          <p className={styles.bannerText}>
            Please review the standard terms of service, custom image upload agreements, and material safety compliance details when purchasing from Dandicraft.
          </p>
        </div>
      </div>

      <section className="section-padding">
        <div className="container">
          <div className={styles.contentBox}>
            <div className={styles.section}>
              <h2>1. Agreement to Terms</h2>
              <p>
                By accessing our website and submitting order inquiries, you agree to comply with and be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our services.
              </p>
            </div>

            <div className={styles.section}>
              <h2>2. Custom and Made-to-Order Products</h2>
              <p>
                Certain products (including Custom Paint-by-Number canvases, Custom Diamond Art, and Photo Pillows) require user uploads of proprietary files. By submitting files, you guarantee that:
              </p>
              <ul>
                <li>You own the copyright or have explicit permission to reproduce the provided image.</li>
                <li>The image does not violate any local laws or third-party copyrights.</li>
              </ul>
              <p>
                Dandicraft reserves the right to reject custom requests containing low-resolution images, offensive material, or copyrighted assets without consent.
              </p>
            </div>

            <div className={styles.section}>
              <h2>3. Safety Disclaimer & Materials</h2>
              <p>
                Dandicraft is committed to supplying safe and certified craft materials:
              </p>
              <ul>
                <li>All supplied paints (acrylic and washable) are certified safe, non-toxic, and lead-free by the internationally recognized SGS Group.</li>
                <li>Our craft kits are not suitable for children under 3 years of age due to potential choking hazards from small parts (e.g. wicks, plastic gems, granular wax, plush eyes).</li>
                <li>Adult supervision is recommended during all craft activities, especially those involving granular wax melting or heat sources (e.g. CandleArt kits).</li>
              </ul>
            </div>

            <div className={styles.section}>
              <h2>4. Pricing, Payments & Inquiries</h2>
              <p>
                All checkouts initiated on this website constitute order inquiries. A final sales invoice, combined with actual packaging/shipping schedules, will be generated and emailed to the purchaser. Payment must be cleared using provided payment links before custom printing or order dispatch begins.
              </p>
            </div>

            <div className={styles.section}>
              <h2>5. Shipping & All-Sales-Final Policy</h2>
              <p>
                Standard orders are delivered via UPS Ground. Local Lakewood, NJ deliveries are managed via MailPak. Due to the custom preparation process, <strong>all sales are final</strong>. We do not support returns, refunds, cancellations, or exchanges. Damaged or incorrect kits must be reported within 48 hours of delivery to qualify for replacements.
              </p>
            </div>

            <div className={styles.section}>
              <h2>6. Changes to Terms</h2>
              <p>
                Dandicraft reserves the right to modify these Terms & Conditions at any time. Changes will be posted directly to this page, and your continued usage of the website constitutes acceptance of the modified terms.
              </p>
            </div>
            
            <div className={styles.termsFooter}>
              <span>Last updated: August 2026</span>
              <p>If you have any questions, please contact us at <a href="mailto:info@dandicraft.com">info@dandicraft.com</a>.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
