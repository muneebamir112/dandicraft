"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "./Shop.module.css";
import { useProducts } from "@/hooks/useProducts";

export default function Shop() {
  const params = useParams();
  const { products } = useProducts();
  const [page, setPage] = useState(1);
  const productsPerPage = 12;
  
  // Extract category slug from optional catch-all param
  const categorySlug = params.category ? params.category[0] : null;

  // Mapping from url slug to product category names
  const categoryMap = {
    "paint-by-number": "Paint-by-Number",
    "washable-paint-by-number": "Washable Paint-by-Number",
    "custom": "Custom",
    "plaster": "Plaster",
    "stuff-a-bear": "Stuff-a-Bear",
    "paint-and-supplies": "Paint and Supplies",
    "photo-pillows": "Photo Pillows",
    "candleart": "CandleArt"
  };

  const activeCategoryName = categorySlug ? categoryMap[categorySlug] : null;

  // Filter products based on URL parameter
  const filteredProducts = activeCategoryName
    ? products.filter(p => p.category === activeCategoryName)
    : products;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentPage = totalPages > 0 ? Math.min(page, totalPages) : 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const filterTabs = [
    { name: "All Products", slug: null },
    { name: "Paint-by-Number", slug: "paint-by-number" },
    { name: "Washable", slug: "washable-paint-by-number" },
    { name: "Custom Canvas", slug: "custom" },
    { name: "Plaster", slug: "plaster" },
    { name: "Stuff-a-Bear", slug: "stuff-a-bear" },
    { name: "Supplies", slug: "paint-and-supplies" },
    { name: "Photo Pillows", slug: "photo-pillows" },
    { name: "CandleArt", slug: "candleart" }
  ];

  return (
    <div className={styles.shopContainer}>
      {/* Category Banner */}
      <div className={styles.shopBanner}>
        <div className="container">
          <span className={styles.bannerSubtitle}>Dandicraft Craft Catalog</span>
          <h1 className={styles.bannerTitle}>
            {activeCategoryName || "All Creative Craft Kits"}
          </h1>
          <p className={styles.bannerText}>
            Select from our certified non-toxic painting activities, stuff-a-bear plush kits, and custom photo designs. Perfect for home crafting, schools, and camps.
          </p>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className={styles.filterSection}>
        <div className="container">
          <div className={styles.filterTabsWrapper}>
            {filterTabs.map((tab) => {
              const isActive = (!categorySlug && tab.slug === null) || (categorySlug === tab.slug);
              return (
                <Link
                  key={tab.name}
                  href={tab.slug ? `/shop/${tab.slug}` : "/shop"}
                  className={`${styles.filterTab} ${isActive ? styles.filterTabActive : ""}`}
                  onClick={() => setPage(1)}
                >
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Products Grid Section */}
      <section className="section-padding" style={{ paddingTop: "40px" }}>
        <div className="container">
          {filteredProducts.length === 0 ? (
            <div className={styles.noProducts}>
              <h3>No products found in this category.</h3>
              <p>Please browse another section or contact us for inquiries.</p>
              <Link href="/shop" className="btn btn-primary" style={{ marginTop: "16px" }}>
                View All Products
              </Link>
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {paginatedProducts.map((prod) => (
                <div key={prod.id} className={styles.productCard}>
                  <div className={styles.productImageWrapper}>
                    {(prod.images?.[0] || prod.image) ? (
                      <img src={prod.images?.[0] || prod.image} alt={prod.name} className={styles.productRealImage} />
                    ) : (
                      /* CSS Mock Image for premium graphics */
                      <div className={styles.productMockImage} style={{ 
                        background: `linear-gradient(135deg, var(--primary-bg) 0%, var(--primary-accent) 100%)`
                      }}>
                        <span className={styles.mockText}>🎨 {prod.category}</span>
                      </div>
                    )}

                    {/* Notice Badges */}
                    {prod.requiresQuote && (
                      <span className={`${styles.badge} ${styles.badgeQuote}`}>
                        Quote Required
                      </span>
                    )}
                    {prod.minQty && prod.minQty > 1 && (
                      <span className={`${styles.badge} ${styles.badgeMin}`}>
                        Min Qty: {prod.minQty}
                      </span>
                    )}
                    {prod.hasUpload && (
                      <span className={`${styles.badge} ${styles.badgeCustom}`}>
                        Photo Upload
                      </span>
                    )}
                  </div>
                  
                  <div className={styles.productInfo}>
                    <span className={styles.productCat}>{prod.category}</span>
                    <h3 className={styles.productName}>{prod.name}</h3>
                    <p className={styles.productDesc}>
                      {prod.description.length > 90 
                        ? `${prod.description.substring(0, 90)}...` 
                        : prod.description}
                    </p>
                    
                    <div className={styles.productFooter}>
                      <span className={styles.productPrice}>
                        {prod.price > 0 ? `$${prod.price.toFixed(2)}` : "Contact to Buy"}
                      </span>
                      <Link href={`/product/${prod.slug}`} className={`btn ${styles.productBtn}`}>
                        {prod.requiresQuote ? "Request Quote" : "Add to Cart"}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <nav className={styles.pagination} aria-label="Shop pages">
              <button
                type="button"
                className={styles.paginationButton}
                onClick={() => setPage((current) => current - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className={styles.paginationStatus}>Page {currentPage} of {totalPages}</span>
              <button
                type="button"
                className={styles.paginationButton}
                onClick={() => setPage((current) => current + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </nav>
          )}
        </div>
      </section>
    </div>
  );
}
