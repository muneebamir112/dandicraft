"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import styles from "./Cart.module.css";

export default function Cart() {
  const { 
    cartItems, 
    cartCount, 
    cartSubtotal, 
    updateQuantity, 
    removeFromCart, 
    getItemPrice, 
    validateCartMOQ 
  } = useCart();

  const isCartValid = validateCartMOQ();

  return (
    <div className={styles.cartContainer}>
      <div className="container">
        <h1 className={styles.cartTitle}>Shopping Cart</h1>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className={styles.emptyCart}>
            <div className={styles.emptyIcon}>🛒</div>
            <h2>Your Shopping Cart is Empty</h2>
            <p>Select from our certified non-toxic craft kits to get started on your creative journey.</p>
            <Link href="/shop" className="btn btn-primary">
              Explore Craft Kits
            </Link>
          </div>
        ) : (
          /* Active Cart Layout */
          <div className={styles.cartLayout}>
            {/* Items Column */}
            <div className={styles.itemsColumn}>
              {/* MOQ global alert if cart is invalid */}
              {!isCartValid && (
                <div className={styles.moqGlobalWarning}>
                  <span className={styles.warningIcon}>⚠️</span>
                  <div>
                    <strong>Wholesale Quantity Requirements Not Met:</strong>
                    <p>Some custom or candle items in your cart do not meet the minimum order limit. Please update the quantities indicated in red before checking out.</p>
                  </div>
                </div>
              )}

              <div className={styles.itemsList}>
                {cartItems.map((item) => {
                  const singleItemPrice = getItemPrice(item);
                  const itemTotalPrice = singleItemPrice * item.quantity;
                  const isMoqViolated = item.quantity < item.minQty;

                  return (
                    <div 
                      key={item.key} 
                      className={`${styles.cartItem} ${isMoqViolated ? styles.cartItemMoqError : ""}`}
                    >
                      {/* Image Preview / Custom File Preview */}
                      <div className={styles.itemImageFrame} style={{
                        background: `linear-gradient(135deg, var(--primary-bg) 0%, var(--primary-accent) 100%)`
                      }}>
                        {item.uploadFile ? (
                          <img src={item.uploadFile} alt="Preview uploaded file" className={styles.itemImage} />
                        ) : item.image ? (
                          <img src={item.image} alt={item.name} className={styles.itemImage} />
                        ) : (
                          <span className={styles.itemImagePlaceholder}>🎨</span>
                        )}
                      </div>

                      {/* Content Details */}
                      <div className={styles.itemDetails}>
                        <span className={styles.itemCategory}>{item.category}</span>
                        <h3 className={styles.itemName}>
                          <Link href={`/product/${item.slug}`}>{item.name}</Link>
                        </h3>

                        {/* Options summary */}
                        {Object.keys(item.options).length > 0 && (
                          <div className={styles.itemSpecs}>
                            {Object.entries(item.options).map(([key, val]) => (
                              <span key={key} className={styles.specBadge}>
                                <strong>{key}:</strong> {val}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Addons summary */}
                        {item.addons.length > 0 && (
                          <div className={styles.itemAddons}>
                            <span className={styles.addonsLabel}>Included Add-ons:</span>
                            <ul className={styles.addonsList}>
                              {item.addons.map(a => (
                                <li key={a.name}>
                                  ✨ {a.name} (+${a.price.toFixed(2)})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Photo attachment status */}
                        {item.uploadFile && (
                          <span className={styles.attachmentLabel}>
                            📸 Custom photo attached
                          </span>
                        )}
                      </div>

                      {/* Quantity Selector with MOQ validation */}
                      <div className={styles.itemQuantityControl}>
                        <div className={styles.qtySelector}>
                          <button 
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            className={styles.qtyBtn}
                          >
                            -
                          </button>
                          <span className={styles.qtyValue}>{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            className={styles.qtyBtn}
                          >
                            +
                          </button>
                        </div>
                        
                        {item.minQty > 1 && (
                          <div className={`${styles.itemMoqLabel} ${isMoqViolated ? styles.itemMoqLabelError : ""}`}>
                            Min. order: {item.minQty}
                          </div>
                        )}
                      </div>

                      {/* Price column */}
                      <div className={styles.itemPricing}>
                        <span className={styles.itemTotalPrice}>
                          ${itemTotalPrice.toFixed(2)}
                        </span>
                        <span className={styles.itemUnitPrice}>
                          (${singleItemPrice.toFixed(2)} each)
                        </span>
                        <button 
                          onClick={() => removeFromCart(item.key)}
                          className={styles.removeBtn}
                          title="Remove item"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary Column */}
            <div className={styles.summaryColumn}>
              <div className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>Order Summary</h2>
                
                <div className={styles.summaryRow}>
                  <span>Total Items:</span>
                  <span>{cartCount} units</span>
                </div>
                
                <div className={styles.summaryRow}>
                  <span>Subtotal:</span>
                  <span className={styles.summarySubtotal}>${cartSubtotal.toFixed(2)}</span>
                </div>
                
                <div className={styles.shippingNotice}>
                  <p><strong>Shipping Methods:</strong></p>
                  <p>Standard delivery is fulfilled via <strong>UPS Ground</strong> (handling time: 1–2 days, transit: 1–3 business days).</p>
                  <p style={{ marginTop: "8px" }}>📦 <em>Lakewood, NJ orders shipped via MailPak. Same-day requests accepted in checkout order notes.</em></p>
                </div>

                <div className={styles.policyDisclaimer}>
                  🔒 <strong>All Sales Final.</strong> Review your customized variations, photo uploads, and sizes before checking out. No returns or cancellations accepted once processed.
                </div>

                {isCartValid ? (
                  <Link 
                    href="/checkout" 
                    className="btn btn-primary" 
                    style={{ width: "100%", padding: "14px 20px" }}
                  >
                    Proceed to Checkout
                  </Link>
                ) : (
                  <button 
                    disabled 
                    className="btn btn-disabled"
                    style={{ width: "100%", padding: "14px 20px" }}
                  >
                    Checkout Blocked
                  </button>
                )}
                
                {!isCartValid && (
                  <p className={styles.validationErrorText}>
                    Please adjust item quantities to resolve the errors indicated in red.
                  </p>
                )}

                <Link href="/shop" className={styles.continueShoppingLink}>
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
