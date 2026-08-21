"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./Faq.module.css";

export default function Faq() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "Do you offer bulk pricing for schools and camps?",
      answer: "Yes, we specialize in bulk and wholesale supplies for camps, school events, paint-along parties, and creative studios. Bulk discounts depend on categories and volume. Please reach out to info@dandicraft.com with your quantities to get a custom quote."
    },
    {
      question: "Do the paint-by-numbers come with paint and brushes?",
      answer: "Yes, our standard Acrylic Paint-by-Number ($30.00) and Custom Paint-by-Number ($30.00) include all materials: the printed canvas, matching numbered acrylic paint pots, and brushes. Note: Our Washable Paint-by-Number ($12.00) series is designed for younger kids and does not include paint; it is configured to coordinate with the Crayola 18-color washable paint set (sold separately on our site)."
    },
    {
      question: "How can I purchase plaster craft figures?",
      answer: "Plaster craft pieces require special bulk packaging and cannot be purchased directly through online checkout. To place an order, please email info@dandicraft.com to request our latest plaster craft catalogs and custom quote sheets."
    },
    {
      question: "Are your paints and craft materials safe for children?",
      answer: "Absolutely. Safety is our primary concern. All paint colors and materials supplied in our kits are certified safe, lead-free, non-toxic, and conform to rigorous safety standards. They are certified safe by the internationally recognized SGS Group."
    },
    {
      question: "What is your return and refund policy?",
      answer: "All sales are final. Because our craft kits are custom-made or involve granular craft preparations, we do not accept returns, refunds, exchanges, or cancellations. If items arrive damaged or incorrect, please email photos to info@dandicraft.com within 48 hours of delivery for a replacement."
    },
    {
      question: "How long does shipping and order processing take?",
      answer: "Standard orders have a 1–2 business day handling time and ship via UPS Ground (which takes 1–3 business days). For local deliveries in Lakewood, NJ, shipments are handled via MailPak. If you require expedited or same-day shipping, let us know in your order notes."
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className={styles.faqContainer}>
      {/* Banner */}
      <div className={styles.faqBanner}>
        <div className="container">
          <span className={styles.bannerSubtitle}>Have Questions?</span>
          <h1 className={styles.bannerTitle}>Frequently Asked Questions</h1>
          <p className={styles.bannerText}>
            Find quick answers regarding bulk ordering, product safety, custom photo guidelines, shipping rates, and refund parameters.
          </p>
        </div>
      </div>

      {/* Accordion List */}
      <section className="section-padding">
        <div className="container">
          <div className={styles.faqList}>
            {faqs.map((faq, index) => {
              const isOpen = activeIndex === index;
              return (
                <div key={index} className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}>
                  <button 
                    onClick={() => toggleAccordion(index)} 
                    className={styles.faqQuestionRow}
                    aria-expanded={isOpen}
                  >
                    <span className={styles.faqQuestion}>{faq.question}</span>
                    <span className={styles.faqArrow}>
                      <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </button>
                  
                  <div className={styles.faqAnswerRow}>
                    <p className={styles.faqAnswer}>{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Need help footer */}
          <div className={styles.faqContactHelp}>
            <h3>Still need assistance?</h3>
            <p>Can't find the answer you are looking for? Our friendly team is ready to assist with group bookings or order updates.</p>
            <div className={styles.faqContactActions}>
              <Link href="/contact" className="btn btn-primary">
                Contact Customer Support
              </Link>
              <a href="mailto:info@dandicraft.com" className="btn btn-secondary">
                Email info@dandicraft.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
