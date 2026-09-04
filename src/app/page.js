"use client";

import React from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { useProducts } from "@/hooks/useProducts";
import { motion } from "framer-motion";

export default function Home() {
  const { products } = useProducts();
  // Get a few featured products for the homepage showcase
  const hasDatabaseFlags = products.some((product) => Object.hasOwn(product, "featured"));
  const featuredProducts = products.filter((product) =>
    hasDatabaseFlags
      ? product.featured
      : ["custom-paint-by-number", "stuff-a-bear-large", "photo-pillows-custom", "candleart-libbey-4-5"].includes(product.id)
  ).slice(0, 4);

  const categories = [
    {
      name: "Paint-by-Number",
      slug: "paint-by-number",
      description: "Complete acrylic paint kits on quality canvas.",
      color: "#f3e8ff",
      textColor: "#6b21a8",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.categoryIcon}>
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
          <path d="M12 6V12L16 14" />
        </svg>
      )
    },
    {
      name: "Washable Paint Kits",
      slug: "washable-paint-by-number",
      description: "Mess-free creative fun designed for children.",
      color: "#e0f2fe",
      textColor: "#0284c7",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.categoryIcon}>
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
          <path d="M8 12H16" />
          <path d="M12 8V16" />
        </svg>
      )
    },
    {
      name: "Custom Photo Art",
      slug: "custom",
      description: "Translate your own photos into canvas art.",
      color: "#dcfce7",
      textColor: "#16a34a",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.categoryIcon}>
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      )
    },
    {
      name: "Stuff-a-Bear Kits",
      slug: "stuff-a-bear",
      description: "Huggable plush shells with wishing stars.",
      color: "#fef9c3",
      textColor: "#ca8a04",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.categoryIcon}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )
    },
    {
      name: "CandleArt Jar Kits",
      slug: "candleart",
      description: "Easy and safe granular wax jar candle kits.",
      color: "#ffe4e6",
      textColor: "#e11d48",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.categoryIcon}>
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    },
    {
      name: "Photo Pillows",
      slug: "photo-pillows",
      description: "Decorate personalized 12x12 canvas pillows.",
      color: "#ede9fe",
      textColor: "#5b21b6",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.categoryIcon}>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="9" y1="9" x2="15" y2="15" />
          <line x1="15" y1="9" x2="9" y2="15" />
        </svg>
      )
    }
  ];

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroGrid}>
            <motion.div 
              className={styles.heroContent}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <span className={styles.heroBadge}>🎨 Welcome to Dandicraft</span>
              <h1 className={styles.heroTitle}>
                Craft Moments.<br />
                <span className={`${styles.titleGradient} gradient-text`}>Create Memories.</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Experience the magic of customized arts & crafts activities. Premium DIY projects, 
                custom paint-by-numbers, and huggable plush bear kits tailored for camps, school events, and home creativity.
              </p>
              <div className={styles.heroButtons}>
                <Link href="/shop/paint-by-number" className="btn btn-primary hover-lift">
                  Shop Craft Kits
                </Link>
                <Link href="/faq" className="btn btn-secondary hover-lift">
                  How It Works
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              className={styles.heroVisual}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <motion.div 
                className={`${styles.imageFrame} glass-panel`}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <img 
                  src="/hero_banner.jpg" 
                  alt="Dandicraft creative craft kits: custom paint by numbers, plush bears, candles" 
                  className={styles.bannerImage}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
        <div className={styles.heroBlobLeft}></div>
        <div className={styles.heroBlobRight}></div>
      </section>

      {/* Categories Section */}
      <section className="section-padding">
        <div className="container">
          <motion.div 
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className={styles.sectionTitle}>Explore Creative Categories</h2>
            <p className={styles.sectionSubtitle}>
              We curate premium, easy-to-use kits for individuals and bulk gatherings alike.
            </p>
          </motion.div>
          
          <div className={styles.categoriesGrid}>
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Link href={`/shop/${cat.slug}`} className={`${styles.categoryCard} hover-lift`}>
                  <div 
                    className={styles.iconContainer} 
                    style={{ backgroundColor: cat.color, color: cat.textColor }}
                  >
                    {cat.icon}
                  </div>
                  <h3 className={styles.categoryName}>{cat.name}</h3>
                  <p className={styles.categoryDesc}>{cat.description}</p>
                  <span className={styles.categoryLink} style={{ color: cat.textColor }}>
                    Browse Catalog →
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us / Safety Section */}
      <section className={styles.infoSection}>
        <div className="container">
          <div className={styles.infoGrid}>
            <motion.div 
              className={styles.infoTextColumn}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              <span className={styles.infoBadge}>SGS Certified Safety</span>
              <h2 className={styles.infoTitle}>Safe, High-Quality Craft Materials</h2>
              <p className={styles.infoDesc}>
                Whether hosting a school project, camp activity, or a weekend family crafting session, 
                safety is our priority. All paint colors and craft materials supplied by Dandicraft 
                are certified non-toxic, lead-free, and tested safe by the internationally recognized SGS Group.
              </p>
              
              <div className={styles.features}>
                <div className={styles.featureItem}>
                  <div className={styles.featureTick}>✓</div>
                  <div>
                    <strong>Group Orders & Bulk Rates</strong>
                    <p>Contact us for custom packaging and special discounts for schools, camps, and birthday parties.</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureTick}>✓</div>
                  <div>
                    <strong>Easy Checkouts & Order Inquiries</strong>
                    <p>Place custom image orders online instantly, or send order requests for specialized items like plaster figures.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className={styles.infoCardColumn}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className={`${styles.safetyCard} glass-panel hover-lift`}>
                <div className={styles.safetyIcon}>🛡️</div>
                <h3>Dandicraft Quality Shield</h3>
                <p>All paints manufactured to highest safety protocols, SGS certified non-toxic, and water-soluble for easy cleanup.</p>
                <div className={styles.safetyFooter}>
                  <span>Certified Non-Toxic</span>
                  <span>Camp Approved</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Showcase */}
      <section className="section-padding">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Featured DIY Craft Kits</h2>
            <p className={styles.sectionSubtitle}>
              Check out our most popular DIY kits, loved by crafting communities nationwide.
            </p>
          </div>

          <div className={styles.productsGrid}>
            {featuredProducts.map((prod, idx) => (
              <motion.div
                key={prod.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.15 }}
                whileHover={{ y: -5 }}
                className={`${styles.productCard} hover-lift`}
              >
                <div className={styles.productImageWrapper}>
                  {prod.image ? (
                    <img src={prod.image} alt={prod.name} className={styles.productRealImage} />
                  ) : (
                    <div className={styles.productMockImage} style={{
                      background: `linear-gradient(135deg, var(--primary-bg) 0%, var(--primary-accent) 100%)`
                    }}>
                      <span className={styles.mockText}>🎨 {prod.category}</span>
                    </div>
                  )}
                </div>
                
                <div className={styles.productInfo}>
                  <span className={styles.productCat}>{prod.category}</span>
                  <h3 className={styles.productName}>{prod.name}</h3>
                  <p className={styles.productPrice}>
                    {prod.price > 0 ? `$${prod.price.toFixed(2)}` : "Contact for Quote"}
                  </p>
                  
                  <div className={styles.productAction}>
                    <Link href={`/product/${prod.slug}`} className="btn btn-outline hover-lift" style={{ width: "100%", padding: "10px" }}>
                      View Kit Options
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
