"use client";

import React from "react";
import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          {/* Company Info */}
          <div className={styles.columnLarge}>
            <div className={styles.logo}>
              <span className={styles.logoText}>Dandi<span className={styles.logoAlt}>craft</span></span>
            </div>
            <p className={styles.description}>
              Crafting premium creative moments for families, camps, schools, and craft enthusiasts. 
              From Custom Paint-by-Numbers to Stuff-a-Bear kits, we supply high-quality materials 
              certified safe by SGS to bring your creative imagination to life.
            </p>
          </div>

          {/* Categories Links */}
          <div className={styles.column}>
            <h3 className={styles.title}>Shop Crafts</h3>
            <ul className={styles.linksList}>
              <li><Link href="/shop/paint-by-number">Paint-by-Number</Link></li>
              <li><Link href="/shop/washable-paint-by-number">Washable Paint-by-Number</Link></li>
              <li><Link href="/shop/custom">Custom Canvas</Link></li>
              <li><Link href="/shop/stuff-a-bear">Stuff-a-Bear Kits</Link></li>
              <li><Link href="/shop/candleart">CandleArt Kits</Link></li>
              <li><Link href="/shop/paint-and-supplies">Paint & Supplies</Link></li>
            </ul>
          </div>

          {/* Quick Links / Policies */}
          <div className={styles.column}>
            <h3 className={styles.title}>Customer Support</h3>
            <ul className={styles.linksList}>
              <li><Link href="/faq">Frequently Asked Questions</Link></li>
              <li><Link href="/shipping-returns">Shipping & Returns Policy</Link></li>
              <li><Link href="/terms-conditions">Terms & Conditions</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/contact">Contact & Quotes</Link></li>
            </ul>
          </div>

          {/* Get In Touch */}
          <div className={styles.column}>
            <h3 className={styles.title}>Get In Touch</h3>
            <ul className={styles.contactList}>
              <li className={styles.contactItem}>
                <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <a href="tel:7329421197">732-942-1197</a>
              </li>
              <li className={styles.contactItem}>
                <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <a href="mailto:info@dandicraft.com">info@dandicraft.com</a>
              </li>
              <li className={styles.contactItem}>
                <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Lakewood, NJ</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {currentYear} Dandicraft. All rights reserved. Made with love for creators.
          </p>
          <div className={styles.safetyDisclaimer}>
            ⚠️ All craft items comply with standard safety benchmarks. Not suitable for children under 3 years due to small parts.
          </div>
        </div>
      </div>
    </footer>
  );
}
