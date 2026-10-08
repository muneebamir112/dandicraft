"use client";

import React from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { useProducts } from "@/hooks/useProducts";
import { motion } from "framer-motion";

export default function Home() {
  const { products } = useProducts();
  // Get a few featured products for the homepage showcase
  const fallbackFeaturedIds = [
    "custom-paint-by-number",
    "stuff-a-bear-large",
    "photo-pillows-custom",
    "candleart-libbey-4-5",
  ];
  const flaggedProducts = products.filter((product) => product.featured);
  let featuredProducts = flaggedProducts;
  
  if (featuredProducts.length < 4) {
    const fallbackProducts = products.filter((product) => fallbackFeaturedIds.includes(product.id) && !product.featured);
    featuredProducts = [...featuredProducts, ...fallbackProducts];
  }
  
  if (featuredProducts.length < 4) {
    const additionalProducts = products.filter((product) => !featuredProducts.some(fp => fp.id === product.id));
    featuredProducts = [...featuredProducts, ...additionalProducts];
  }
  
  featuredProducts = featuredProducts.slice(0, 4);

  const categories = [
    {
      name: "Paint-by-Number",
      slug: "paint-by-number",
      description: "Complete acrylic paint kits on quality canvas.",
      color: "#f3e8ff",
      textColor: "#6b21a8",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.categoryIcon}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.22 0 2.29-.69 2.76-1.74.1-.23.15-.48.15-.76 0-1.1-.9-2-2-2h-1.55c-2.3 0-4.17-1.87-4.17-4.17S9.06 9.16 11.36 9.16H18c2.21 0 4-1.79 4-4 0-2.21-1.79-4-4-4z" />
          <circle cx="6.5" cy="11.5" r="1" fill="currentColor"/>
          <circle cx="8.5" cy="7.5" r="1" fill="currentColor"/>
          <circle cx="13.5" cy="6.5" r="1" fill="currentColor"/>
          <circle cx="17.5" cy="10.5" r="1" fill="currentColor"/>
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.categoryIcon}>
          <rect x="2" y="3" width="20" height="6" rx="2" />
          <path d="M19 9v3a2 2 0 0 1-2 2h-4v4" />
          <rect x="11" y="18" width="4" height="4" rx="1" />
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.categoryIcon}>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.categoryIcon}>
          <circle cx="12" cy="14" r="7" />
          <circle cx="7" cy="9" r="3" />
          <circle cx="17" cy="9" r="3" />
          <circle cx="12" cy="16" r="2" />
          <circle cx="10" cy="13" r="1" fill="currentColor" />
          <circle cx="14" cy="13" r="1" fill="currentColor" />
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.categoryIcon}>
          <path d="M9 22V10a3 3 0 0 1 6 0v12" />
          <path d="M12 2c0 2-2 3-2 5 0 1.1.9 2 2 2s2-.9 2-2c0-2-2-3-2-5z" />
          <path d="M7 22h10" />
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.categoryIcon}>
          <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
          <line x1="7" y1="7" x2="17" y2="7" strokeDasharray="2 2" />
          <line x1="7" y1="17" x2="17" y2="17" strokeDasharray="2 2" />
          <line x1="7" y1="7" x2="7" y2="17" strokeDasharray="2 2" />
          <line x1="17" y1="7" x2="17" y2="17" strokeDasharray="2 2" />
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
                    {prod.price > 0 ? `$${prod.price.toFixed(2)}` : "Contact for Order"}
                  </p>
                  
                  <div className={styles.productAction}>
                    <Link href={`/product/${prod.slug}`} className="btn btn-outline hover-lift" style={{ width: "100%", padding: "10px" }}>
                      {prod.requiresQuote ? "Contact for Order" : "Add to Cart"}
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
