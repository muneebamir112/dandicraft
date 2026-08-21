"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "../../../context/CartContext";
import productsData from "../../../data/products.json";
import styles from "./ProductDetail.module.css";

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const fileInputRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFileName, setUploadFileName] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Find product on mount / parameter change
  useEffect(() => {
    if (params.slug) {
      const foundProduct = productsData.find(p => p.slug === params.slug);
      if (foundProduct) {
        setProduct(foundProduct);
        // Initialize default options
        const initialOpts = {};
        foundProduct.options?.forEach(opt => {
          initialOpts[opt.name] = opt.values[0];
        });
        setSelectedOptions(initialOpts);
        
        // Initialize default quantity to MOQ
        setQuantity(foundProduct.minQty || 1);
        
        // Reset local states
        setSelectedAddons([]);
        setUploadFile(null);
        setUploadFileName("");
        setSuccessMsg("");
      }
    }
  }, [params.slug]);

  if (!product) {
    return (
      <div className="container section-padding" style={{ textAlign: "center" }}>
        <h2>Product not found</h2>
        <p style={{ margin: "16px 0 24px", color: "var(--muted-text)" }}>
          The product you are looking for does not exist or has been removed.
        </p>
        <Link href="/shop" className="btn btn-primary">
          Back to Shop
        </Link>
      </div>
    );
  }

  // Handle option changes
  const handleOptionChange = (optionName, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: value
    }));
  };

  // Handle addon checkbox toggling
  const handleAddonToggle = (addon) => {
    setSelectedAddons(prev => {
      const exists = prev.some(a => a.name === addon.name);
      if (exists) {
        return prev.filter(a => a.name !== addon.name);
      } else {
        return [...prev, addon];
      }
    });
  };

  // Handle file uploads (converts to base64 for cart storage / preview)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFileName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setUploadFile(uploadEvent.target.result); // Base64 data url for previewing
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle quantity changes
  const changeQuantity = (amount) => {
    const min = product.minQty || 1;
    setQuantity(prev => {
      const next = prev + amount;
      return next >= min ? next : prev;
    });
  };

  // Calculate dynamic price per unit
  const basePrice = product.price;
  const addonsPrice = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const pricePerUnit = basePrice + addonsPrice;
  const totalPrice = pricePerUnit * quantity;

  // Add to cart form handler
  const handleAddToCart = (e) => {
    e.preventDefault();
    
    // Validation: check upload
    if (product.hasUpload && !uploadFile) {
      alert("Please upload your photo before adding this custom product to the cart.");
      return;
    }

    addToCart(product, selectedOptions, selectedAddons, quantity, uploadFile);
    
    setSuccessMsg("Success! Product has been added to your shopping cart.");
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Clear messages after 4 seconds
    setTimeout(() => {
      setSuccessMsg("");
    }, 4000);
  };

  return (
    <div className={styles.detailContainer}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/shop" className={styles.backLink}>
            ← Back to Shop
          </Link>
          <span className={styles.divider}>/</span>
          <Link href={`/shop/${product.category.toLowerCase().replace(/ /g, "-")}`} className={styles.crumbLink}>
            {product.category}
          </Link>
          <span className={styles.divider}>/</span>
          <span className={styles.activeCrumb}>{product.name}</span>
        </div>

        {/* Success Alert Banner */}
        {successMsg && (
          <div className={styles.successBanner}>
            <div className={styles.successIcon}>✓</div>
            <div className={styles.successContent}>
              <p>{successMsg}</p>
              <div className={styles.successActions}>
                <Link href="/cart" className={styles.bannerBtnCart}>
                  View Shopping Cart
                </Link>
                <Link href="/shop" className={styles.bannerBtnShop}>
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Product Layout Grid */}
        <div className={styles.layoutGrid}>
          {/* Gallery Column */}
          <div className={styles.galleryColumn}>
            {/* Main Visual Frame */}
            <div className={styles.visualFrame} style={{ 
              background: `linear-gradient(135deg, var(--primary-bg) 0%, var(--primary-accent) 100%)`
            }}>
              {uploadFile ? (
                <img src={uploadFile} alt="Custom upload preview" className={styles.previewImage} />
              ) : (
                <div className={styles.mockIllustration}>
                  <span className={styles.mockEmoji}>🎨</span>
                  <span className={styles.mockLabel}>{product.category} Kit</span>
                </div>
              )}
            </div>
            
            {uploadFile && (
              <div className={styles.previewCaption}>
                <span>📸 Upload Preview: <strong>{uploadFileName}</strong></span>
                <button className={styles.removeFileBtn} onClick={() => {
                  setUploadFile(null);
                  setUploadFileName("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}>
                  Remove Photo
                </button>
              </div>
            )}
            
            <div className={styles.badgeBanner}>
              <span>🛡️ Certified safe materials (SGS tested non-toxic)</span>
            </div>
          </div>

          {/* Config Column */}
          <div className={styles.configColumn}>
            <span className={styles.categoryTag}>{product.category}</span>
            <h1 className={styles.productTitle}>{product.name}</h1>
            
            <p className={styles.priceRow}>
              {product.price > 0 ? (
                <>
                  <span className={styles.priceLabel}>Price:</span>
                  <span className={styles.priceValue}>${product.price.toFixed(2)}</span>
                  {addonsPrice > 0 && <span className={styles.addonsTotalLabel}> (+ addons)</span>}
                </>
              ) : (
                <span className={styles.quoteOnly}>Wholesale Quote Required</span>
              )}
            </p>

            <p className={styles.productDesc}>{product.description}</p>

            {/* Minimum Order Alert */}
            {product.minQty && product.minQty > 1 && (
              <div className={styles.moqAlert}>
                <span className={styles.alertIcon}>📢</span>
                <p>
                  <strong>Wholesale Minimum Limit:</strong> A minimum order quantity of <strong>{product.minQty} units</strong> is required for this product.
                </p>
              </div>
            )}

            {product.requiresQuote ? (
              /* Quote Mode for Plaster Crafts */
              <div className={styles.quoteBlock}>
                <h3>How to Purchase Plaster Crafts:</h3>
                <p>
                  Our plaster craft pieces are shipped in bulk bundles for schools, summer camps, and paint studios. 
                  Online payment checkout is disabled. Please contact us to get a catalog copy and place an order.
                </p>
                <Link 
                  href={`/contact?subject=Quote%20Request%20-%20${encodeURIComponent(product.name)}`} 
                  className="btn btn-primary" 
                  style={{ width: "100%", marginTop: "16px" }}
                >
                  Request Plaster Catalog Quote
                </Link>
              </div>
            ) : (
              /* Standard Add-to-Cart Configurations */
              <form onSubmit={handleAddToCart} className={styles.configForm}>
                {/* Dynamically render options (variations) */}
                {product.options && product.options.map((opt) => (
                  <div key={opt.name} className={styles.optionGroup}>
                    <label className="form-label">{opt.name}:</label>
                    
                    {opt.type === "swatch" ? (
                      <div className={styles.swatchList}>
                        {opt.values.map(val => {
                          const isSelected = selectedOptions[opt.name] === val;
                          return (
                            <button
                              type="button"
                              key={val}
                              onClick={() => handleOptionChange(opt.name, val)}
                              className={`${styles.swatchItem} ${isSelected ? styles.swatchActive : ""}`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <select
                        value={selectedOptions[opt.name] || ""}
                        onChange={(e) => handleOptionChange(opt.name, e.target.value)}
                        className="form-control"
                      >
                        {opt.values.map(val => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}

                {/* Custom Photo Upload fields */}
                {product.hasUpload && (
                  <div className={styles.optionGroup}>
                    <label className="form-label">Upload Custom Image (JPG, PNG):</label>
                    <div className={styles.uploaderBox} onClick={() => fileInputRef.current?.click()}>
                      <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <p>
                        {uploadFileName ? (
                          <span className={styles.uploadedName}>Selected: {uploadFileName}</span>
                        ) : (
                          <span>Click to browse photo file...</span>
                        )}
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className={styles.hiddenFileInput}
                    />
                  </div>
                )}

                {/* Add-ons Checklist */}
                {product.addons && product.addons.length > 0 && (
                  <div className={styles.addonsSection}>
                    <label className="form-label">Select Add-ons (Optional):</label>
                    <div className={styles.addonsList}>
                      {product.addons.map((addon) => {
                        const isChecked = selectedAddons.some(a => a.name === addon.name);
                        return (
                          <label key={addon.name} className={`${styles.addonLabel} ${isChecked ? styles.addonLabelChecked : ""}`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleAddonToggle(addon)}
                              className={styles.addonCheckbox}
                            />
                            <div className={styles.addonDetails}>
                              <span className={styles.addonName}>{addon.name}</span>
                              <span className={styles.addonDesc}>{addon.description}</span>
                            </div>
                            <span className={styles.addonPrice}>+${addon.price.toFixed(2)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pricing & Checkout Panel */}
                <div className={styles.checkoutPanel}>
                  {/* Quantity selector */}
                  <div className={styles.quantityRow}>
                    <span className={styles.qtyLabel}>Quantity:</span>
                    <div className={styles.qtySelector}>
                      <button 
                        type="button" 
                        onClick={() => changeQuantity(-1)}
                        className={styles.qtyBtn}
                        disabled={quantity <= (product.minQty || 1)}
                      >
                        -
                      </button>
                      <span className={styles.qtyValue}>{quantity}</span>
                      <button 
                        type="button" 
                        onClick={() => changeQuantity(1)}
                        className={styles.qtyBtn}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Summary & Buttons */}
                  <div className={styles.priceSummaryRow}>
                    <span>Subtotal:</span>
                    <span className={styles.subtotalValue}>${totalPrice.toFixed(2)}</span>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ width: "100%", padding: "14px 20px" }}
                  >
                    Add to Shopping Cart
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
