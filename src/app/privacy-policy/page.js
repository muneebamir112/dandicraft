"use client";

import React from "react";
import Link from "next/link";
import styles from "./PrivacyPolicy.module.css";

export default function PrivacyPolicy() {
  return (
    <div className={styles.privacyContainer}>
      <div className={styles.privacyBanner}>
        <div className="container">
          <span className={styles.bannerSubtitle}>Legal Documents</span>
          <h1 className={styles.bannerTitle}>Privacy Policy</h1>
          <p className={styles.bannerText}>
            Read about how Dandicraft collects, protects, uses, and eventually removes your personal information and custom graphic file attachments.
          </p>
        </div>
      </div>

      <section className="section-padding">
        <div className="container">
          <div className={styles.contentBox}>
            <div className={styles.section}>
              <h2>1. Information We Collect</h2>
              <p>
                To handle your order inquiries and provide custom craft services, we collect:
              </p>
              <ul>
                <li>
                  <strong>Personal Identifiers:</strong> Your full name, email address, shipping destination, and phone number when submitting checkouts or quote requests.
                </li>
                <li>
                  <strong>Custom Media Files:</strong> Personal photographs or graphic logo files that you upload to customize canvases, diamond art, or pillows.
                </li>
                <li>
                  <strong>Usage Details:</strong> Anonymized interaction logs regarding visited categories and navigation flows to improve speed.
                </li>
              </ul>
            </div>

            <div className={styles.section}>
              <h2>2. How We Use Your Data</h2>
              <p>
                Your collected details are strictly utilized to:
              </p>
              <ul>
                <li>Configure, custom print, and package your DIY craft kits.</li>
                <li>Generate and email provisional quote invoices and final package tracking links.</li>
                <li>Optimize delivery routing (such as local Lakewood MailPak dispatches).</li>
                <li>Answer customer inquiries submitted through support forms.</li>
              </ul>
            </div>

            <div className={styles.section}>
              <h2>3. Data Retention & Photo Erasure</h2>
              <p>
                We respect your personal media privacy. All customized photo uploads (which contain family pictures, portraits, or custom graphics) are stored in secure servers for production processing. 
                These files are **automatically deleted permanently** from our production databases within **30 days** after your order has been successfully shipped and delivered.
              </p>
            </div>

            <div className={styles.section}>
              <h2>4. Sharing with Third Parties</h2>
              <p>
                Dandicraft does not sell, lease, or rent customer directories to external marketing entities. Your details are shared only with essential delivery partners:
              </p>
              <ul>
                <li><strong>UPS:</strong> Standard tracking labels and addresses.</li>
                <li><strong>MailPak:</strong> Local Lakewood, NJ dispatch addresses.</li>
              </ul>
            </div>

            <div className={styles.section}>
              <h2>5. Contacting Us</h2>
              <p>
                If you have questions about this Privacy Policy or wish to request immediate erasure of your custom photo uploads prior to the 30-day window, please email us at <a href="mailto:info@dandicraft.com">info@dandicraft.com</a>.
              </p>
            </div>
            
            <div className={styles.privacyFooter}>
              <span>Last updated: August 2026</span>
              <p>© Dandicraft. Keeping your creative memories safe.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
