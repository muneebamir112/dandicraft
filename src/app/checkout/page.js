"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import styles from "./Checkout.module.css";
import IField, { CARD_TYPE, CVV_TYPE } from '@cardknox/react-ifields';

const account = {
  xKey: process.env.NEXT_PUBLIC_IFIELDS_KEY || "ifields_dandicraftd3ce0667ba9f4405bde6d195a01",
  xSoftwareName: "Dandicraft",
  xSoftwareVersion: "1.0"
};

export default function Checkout() {
  const router = useRouter();
  const { cartItems, cartCount, cartSubtotal, getItemPrice, clearCart, isLoaded, validateCartMOQ } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "NJ",
    zipCode: "",
    orderNotes: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [assignedOrderNum, setAssignedOrderNum] = useState("");

  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cardIssuer, setCardIssuer] = useState("");
  const paymentTokensRef = useRef({ card: "", cvv: "" });
  const tokenizationTimeoutRef = useRef(null);
  const paymentStartedRef = useRef(false);
  const ifieldRef = useRef(null);
  const cvvRef = useRef(null);

  // Redirect if cart is empty or MOQ validation fails (only after context loads)
  useEffect(() => {
    if (isLoaded && !orderConfirmed) {
      if (cartItems.length === 0 || !validateCartMOQ()) {
        router.push("/cart");
      }
    }
  }, [cartItems, isLoaded, router, validateCartMOQ, orderConfirmed]);

  // Check if current location details qualify for Lakewood same-day MailPak shipping
  const isLakewoodNJ =
    formData.state === "NJ" &&
    formData.city.trim().toLowerCase() === "lakewood";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Quick validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.streetAddress || !formData.city || !formData.zipCode) {
      alert("Please fill in all the required delivery fields.");
      return;
    }

    if (paymentMethod === "card") {
      const month = Number(expMonth);
      const yearDigits = expYear.trim();
      const fullYear = yearDigits.length === 2 ? 2000 + Number(yearDigits) : Number(yearDigits);
      const currentDate = new Date();
      const isExpired = fullYear < currentDate.getFullYear() ||
        (fullYear === currentDate.getFullYear() && month < currentDate.getMonth() + 1);
      if (!/^(0?[1-9]|1[0-2])$/.test(expMonth) || !/^\d{2}(\d{2})?$/.test(yearDigits) || isExpired) {
        alert("Please enter a valid card expiration date.");
        return;
      }
      if (!ifieldRef.current || !cvvRef.current) {
        alert("Card payment fields are not ready. Please refresh and try again.");
        return;
      }
      setIsSubmitting(true);
      paymentStartedRef.current = false;
      paymentTokensRef.current = { card: "", cvv: "" };
      tokenizationTimeoutRef.current = setTimeout(() => {
        setIsSubmitting(false);
        alert("Card verification timed out. Please check your card details and try again.");
      }, 15000);
      ifieldRef.current.getToken();
    } else {
      processOrder();
    }
  };

  const handleCardToken = (data) => {
    const { xToken } = data;
    if (!xToken) {
      clearTimeout(tokenizationTimeoutRef.current);
      setIsSubmitting(false);
      alert("Failed to securely verify the card number. Please try again.");
      return;
    }
    paymentTokensRef.current.card = xToken;
    cvvRef.current?.getToken();
  };

  const handleCardUpdate = (data) => {
    if (data.issuer) setCardIssuer(data.issuer);
  };

  const handleCvvToken = (data) => {
    const { xToken } = data;
    if (!xToken) {
      clearTimeout(tokenizationTimeoutRef.current);
      setIsSubmitting(false);
      alert("Failed to securely verify the CVV. Please try again.");
      return;
    }
    paymentTokensRef.current.cvv = xToken;
    const { card, cvv } = paymentTokensRef.current;
    if (card && cvv && !paymentStartedRef.current) {
      paymentStartedRef.current = true;
      clearTimeout(tokenizationTimeoutRef.current);
      processOrder(card, cvv);
    }
  };

  const handleError = (data) => {
    clearTimeout(tokenizationTimeoutRef.current);
    setIsSubmitting(false);
    console.error("iField Error:", data);
    if (data.errorMessage === "Transaction timed out.") {
      alert("Card verification could not contact Cardknox. Please verify the iFields key, allowed website domain, and internet connection.");
      return;
    }
    const fieldName = data.xTokenType === "cvv" ? "CVV" : "card number";
    alert(data.errorMessage || `Error verifying ${fieldName}.`);
  };

  const processOrder = async (token = null, cvvToken = null) => {
    setIsSubmitting(true);
    try {
      let expDate = undefined;
      if (paymentMethod === "card" && expMonth && expYear) {
        // Cardknox expects MMYY
        const monthPad = expMonth.padStart(2, '0');
        const yearLast2 = expYear.slice(-2);
        expDate = monthPad + yearLast2;
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(30000),
        body: JSON.stringify({
          formData,
          cartItems,
          cartSubtotal,
          paymentMethod,
          token,
          cvvToken,
          expDate
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setAssignedOrderNum(result.orderNumber);
        setOrderConfirmed(true);
        clearCart();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert(result.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error.name === "TimeoutError"
        ? "Payment processing timed out. Please check your order status before trying again."
        : "A network error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || (cartItems.length === 0 && !orderConfirmed)) {
    return (
      <div className="container section-padding" style={{ textAlign: "center" }}>
        <h2>Loading checkout details...</h2>
      </div>
    );
  }

  if (orderConfirmed) {
    /* Success / Confirmation Screen */
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
              Order Number: <strong>{assignedOrderNum}</strong>
            </p>

            <div className={styles.successDivider}></div>

            <div className={styles.successDetails}>
              <h3>What happens next?</h3>
              <ul className={styles.stepsList}>
                <li>
                  <strong>Review & Verification:</strong> Since your order contains custom designs, paint arrangements, or specific jar capacities, our staff is reviewing your requirements.
                </li>
                <li>
                  <strong>Email Confirmation:</strong> We have sent an acknowledgment email to <strong>{formData.email}</strong>. Once verified, we will email you a finalized invoice containing convenient payment links.
                </li>
                <li>
                  <strong>Shipping Prep:</strong> Once payment is confirmed, custom canvases enter printing/preparation. Packages ship via <strong>UPS Ground</strong> (or <strong>MailPak</strong> for local Lakewood shipments).
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

  return (
    <div className={styles.checkoutContainer}>
      <div className="container">
        <h1 className={styles.pageTitle}>Checkout</h1>

        <div className={styles.checkoutLayout}>
          {/* Billing Form Column */}
          <div className={styles.formColumn}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <h2 className={styles.sectionTitle}>Delivery Information</h2>

              <div className={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Name"
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 732-555-0199"
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <h2 className={styles.sectionTitle} style={{ marginTop: "24px" }}>Shipping Address</h2>

              <div className="form-group">
                <label className="form-label">Street Address *</label>
                <input
                  type="text"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  placeholder="e.g. 123 Main Street, Apt 4B"
                  className="form-control"
                  required
                />
              </div>

              <div className={styles.addressGrid}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Lakewood"
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">State *</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="NJ">NJ - New Jersey</option>
                    <option value="NY">NY - New York</option>
                    <option value="PA">PA - Pennsylvania</option>
                    <option value="CT">CT - Connecticut</option>
                    <option value="DE">DE - Delaware</option>
                    <option value="MD">MD - Maryland</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1.5 }}>
                  <label className="form-label">Zip Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="e.g. 08701"
                    className="form-control"
                    required
                  />
                </div>
              </div>

              {/* Lakewood NJ localized banner */}
              {isLakewoodNJ && (
                <div className={styles.lakewoodNotice}>
                  <span className={styles.lakewoodIcon}>📦</span>
                  <div>
                    <strong>Local MailPak Shipping Available:</strong>
                    <p>Orders to Lakewood, NJ are dispatched via MailPak. If you require same-day shipping, please request it in the Order Notes below.</p>
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginTop: "12px" }}>
                <label className="form-label">Order Notes / Same-day Requests</label>
                <textarea
                  name="orderNotes"
                  value={formData.orderNotes}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="e.g. Deliver to front porch. For Lakewood orders: Please accommodate next-business-day shipping."
                  className="form-control"
                  style={{ resize: "none" }}
                ></textarea>
              </div>

              <h2 className={styles.sectionTitle} style={{ marginTop: "30px" }}>Payment Method</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
                <div style={{ padding: '16px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', backgroundColor: paymentMethod === 'card' ? 'var(--primary-bg)' : 'white' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: paymentMethod === 'card' ? '16px' : '0' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--dark-text)' }}>Credit or Debit Card</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--medium-text)' }}>Secure payment via Sola</div>
                    </div>
                  </label>

                  {paymentMethod === 'card' && (
                    <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Card Number *</label>
                        <div className={styles.ifieldWrapper}>
                          <IField
                            type={CARD_TYPE}
                            account={account}
                            ref={ifieldRef}
                            onToken={handleCardToken}
                            onUpdate={handleCardUpdate}
                            onError={handleError}
                            options={{
                              autoSubmit: false,
                              placeholder: "•••• •••• •••• ••••",
                              iFieldstyle: {
                                width: '100%',
                                boxSizing: 'border-box',
                                margin: '0',
                                padding: '0',
                                border: 'none',
                                outline: 'none',
                                fontSize: '16px',
                                fontFamily: 'inherit',
                                backgroundColor: 'transparent'
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className={styles.formGrid}>
                        <div className="form-group">
                          <label className="form-label">Expiration Date *</label>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                              type="text"
                              name="expMonth"
                              inputMode="numeric"
                              value={expMonth}
                              onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, '').substring(0, 2))}
                              placeholder="MM"
                              className="form-control"
                              style={{ flex: 1 }}
                              required={paymentMethod === 'card'}
                            />
                            <span style={{ display: 'flex', alignItems: 'center', fontSize: '1.2rem' }}>/</span>
                            <input
                              type="text"
                              name="expYear"
                              inputMode="numeric"
                              value={expYear}
                              onChange={(e) => setExpYear(e.target.value.replace(/\D/g, '').substring(0, 4))}
                              placeholder="YYYY"
                              className="form-control"
                              style={{ flex: 1 }}
                              required={paymentMethod === 'card'}
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">CVV *</label>
                          <div className={styles.ifieldWrapper}>
                            <IField
                              type={CVV_TYPE}
                              account={account}
                              ref={cvvRef}
                              issuer={cardIssuer}
                              onToken={handleCvvToken}
                              options={{
                                autoSubmit: false,
                                placeholder: "•••",
                                iFieldstyle: {
                                  width: '100%',
                                  boxSizing: 'border-box',
                                  margin: '0',
                                  padding: '0',
                                  border: 'none',
                                  outline: 'none',
                                  fontSize: '16px',
                                  fontFamily: 'inherit',
                                  backgroundColor: 'transparent'
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', cursor: 'pointer', backgroundColor: paymentMethod === 'cash' ? 'var(--primary-bg)' : 'white' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--dark-text)' }}>Cash / Pay upon arrangement</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--medium-text)' }}>We will contact you to finalize payment</div>
                  </div>
                </label>
              </div>

              {isSubmitting ? (
                <button type="button" className="btn btn-disabled" style={{ width: "100%", padding: "14px" }} disabled>
                  <span className={styles.spinner}></span> Processing Order...
                </button>
              ) : (
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "14px" }}>
                  {paymentMethod === 'card' ? 'Proceed to Payment' : 'Place Order'}
                </button>
              )}
            </form>
          </div>

          {/* Cart Summary Column */}
          <div className={styles.summaryColumn}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Your Order</h2>

              <div className={styles.itemsSummaryList}>
                {cartItems.map((item) => {
                  const itemPrice = getItemPrice(item);
                  return (
                    <div key={item.key} className={styles.summaryItem}>
                      <div className={styles.summaryItemDetails}>
                        <span className={styles.summaryItemName}>
                          {item.name} <strong style={{ color: "var(--primary)" }}>x{item.quantity}</strong>
                        </span>
                        {Object.keys(item.options).length > 0 && (
                          <span className={styles.summaryItemOption}>
                            {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(", ")}
                          </span>
                        )}
                        {item.addons.length > 0 && (
                          <span className={styles.summaryItemOption}>
                            Add-ons: {item.addons.map(a => a.name).join(", ")}
                          </span>
                        )}
                      </div>
                      <span className={styles.summaryItemPrice}>
                        ${(itemPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className={styles.totalBlock}>
                <div className={styles.summaryRow}>
                  <span>Item count:</span>
                  <span>{cartCount} units</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping:</span>
                  <span style={{ fontWeight: 600, color: "var(--secondary)" }}>UPS Ground / MailPak</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.summaryRow} style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                  <span>Total:</span>
                  <span className={styles.grandTotal}>${cartSubtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className={styles.checkoutDisclaimer}>
                Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our <Link href="/privacy-policy" style={{ textDecoration: "underline", color: "var(--primary)" }}>privacy policy</Link>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
