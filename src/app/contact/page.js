"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./Contact.module.css";

function ContactForm() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    quantity: "",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // Prefill subject line from query parameters if present
  useEffect(() => {
    const subjectParam = searchParams.get("subject");
    if (subjectParam) {
      setFormData(prev => ({
        ...prev,
        subject: decodeURIComponent(subjectParam)
      }));
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert("Please fill in all the required fields.");
      return;
    }

    setIsSubmitting(true);

    // Simulate sending message
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <div className={styles.contactContainer}>
      {/* Banner */}
      <div className={styles.contactBanner}>
        <div className="container">
          <span className={styles.bannerSubtitle}>Get in Touch</span>
          <h1 className={styles.bannerTitle}>Contact & Quote Request</h1>
          <p className={styles.bannerText}>
            Planning a summer camp craft program, school activity, or interested in ordering Plaster Crafts? Send us a message below.
          </p>
        </div>
      </div>

      <section className="section-padding">
        <div className="container">
          <div className={styles.contactLayout}>
            {/* Form Box */}
            <div className={styles.formColumn}>
              {isSent ? (
                <div className={styles.successState}>
                  <div className={styles.successIcon}>✓</div>
                  <h2>Message Sent Successfully!</h2>
                  <p>
                    Thank you for reaching out to Dandicraft. We have received your inquiry regarding <strong>"{formData.subject || "General Inquiry"}"</strong>.
                  </p>
                  <p style={{ marginTop: "8px" }}>
                    A customer representative will review your request and respond to your email address (<strong>{formData.email}</strong>) within <strong>24 business hours</strong>.
                  </p>
                  <button onClick={() => {
                    setIsSent(false);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      subject: "",
                      quantity: "",
                      message: ""
                    });
                  }} className="btn btn-secondary" style={{ marginTop: "24px" }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <h2 className={styles.formTitle}>Submit Inquiry Form</h2>
                  
                  <div className={styles.formGrid}>
                    <div className="form-group">
                      <label className="form-label">Your Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Sarah Jenkins"
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="e.g. sarah@campfun.org"
                        className="form-control"
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formGrid}>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g. 732-555-0144"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Estimated Volume / Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        placeholder="e.g. 50 (optional)"
                        className="form-control"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject / Purpose *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="e.g. Bulk discount quote, plaster catalog order"
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message Details *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="6"
                      placeholder="Detail your request here. If ordering custom designs or plaster pieces, please specify preferred styles and estimated dates."
                      className="form-control"
                      required
                    ></textarea>
                  </div>

                  {isSubmitting ? (
                    <button type="button" className="btn btn-disabled" style={{ width: "100%" }} disabled>
                      Sending Message...
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                      Send Message Inquiry
                    </button>
                  )}
                </form>
              )}
            </div>

            {/* Information Column */}
            <div className={styles.infoColumn}>
              <div className={styles.infoCard}>
                <h3 className={styles.infoCardTitle}>Contact Channels</h3>
                
                <div className={styles.contactItem}>
                  <div className={styles.iconCircle}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.infoIcon}>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <span className={styles.itemLabel}>Call Us Directly</span>
                    <a href="tel:7329421197" className={styles.itemVal}>732-942-1197</a>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <div className={styles.iconCircle}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.infoIcon}>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <span className={styles.itemLabel}>General Email Inbox</span>
                    <a href="mailto:info@dandicraft.com" className={styles.itemVal}>info@dandicraft.com</a>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <div className={styles.iconCircle}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.infoIcon}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <span className={styles.itemLabel}>Corporate Location</span>
                    <span className={styles.itemVal}>Lakewood, New Jersey</span>
                  </div>
                </div>

                <div className={styles.cardDivider}></div>

                <div className={styles.safetyBadgeRow}>
                  <span className={styles.safetyIcon}>🛡️</span>
                  <div>
                    <strong>SGS safety guarantees</strong>
                    <p style={{ fontSize: "0.8rem", color: "var(--muted-text)", marginTop: "2px" }}>
                      Paints and supplies are tested lead-free and safe for children.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Contact() {
  return (
    <Suspense fallback={
      <div className="container section-padding" style={{ textAlign: "center" }}>
        <h2>Loading form...</h2>
      </div>
    }>
      <ContactForm />
    </Suspense>
  );
}
