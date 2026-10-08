"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../Admin.module.css";
import { useRouter } from "next/navigation";

export default function AdminSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    SMTP_HOST: "",
    SMTP_PORT: "",
    SMTP_USER: "",
    SMTP_PASSWORD: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          SMTP_HOST: data.SMTP_HOST || "",
          SMTP_PORT: data.SMTP_PORT || "",
          SMTP_USER: data.SMTP_USER || "",
          SMTP_PASSWORD: data.SMTP_PASSWORD || "",
        });
      } else {
        if (res.status === 401) {
          router.replace("/admin/login");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save settings");
      }

      setNotice("Settings saved successfully.");
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className={styles.adminPage}><div className={styles.shell}>Loading settings...</div></div>;

  return (
    <section className={styles.adminPage}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.eyebrow}>Dandicraft commerce</p>
            <h1>System Settings</h1>
          </div>
          <div className={styles.topActions}>
            <Link href="/admin" className={styles.secondaryButton}>Back to Dashboard</Link>
          </div>
        </header>

        {notice && <div className={styles.notice}>{notice}</div>}
        {error && <div className={styles.error} role="alert">{error}</div>}

        <div className={styles.editor}>
          <h2>Email Delivery (SMTP)</h2>
          <form onSubmit={handleSubmit} className={styles.formGrid}>
            
            <div className={styles.field}>
              <label htmlFor="SMTP_HOST">SMTP Host</label>
              <input
                type="text"
                id="SMTP_HOST"
                value={settings.SMTP_HOST}
                onChange={(e) => setSettings({ ...settings, SMTP_HOST: e.target.value })}
                placeholder="e.g. smtp.gmail.com"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="SMTP_PORT">SMTP Port</label>
              <input
                type="text"
                id="SMTP_PORT"
                value={settings.SMTP_PORT}
                onChange={(e) => setSettings({ ...settings, SMTP_PORT: e.target.value })}
                placeholder="e.g. 587 or 465"
                required
              />
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="SMTP_USER">SMTP User (Email Address)</label>
              <input
                type="email"
                id="SMTP_USER"
                value={settings.SMTP_USER}
                onChange={(e) => setSettings({ ...settings, SMTP_USER: e.target.value })}
                required
              />
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="SMTP_PASSWORD">SMTP Password (or App Password)</label>
              <input
                type="password"
                id="SMTP_PASSWORD"
                value={settings.SMTP_PASSWORD}
                onChange={(e) => setSettings({ ...settings, SMTP_PASSWORD: e.target.value })}
                placeholder={settings.SMTP_PASSWORD === '••••••••' ? "Leave unchanged to keep current password" : "Enter password"}
              />
              <p className={styles.subhead}>
                For Gmail, you must use an App Password, not your account password.
              </p>
            </div>

            <div className={styles.formActions} style={{ gridColumn: "1 / -1", marginTop: "20px" }}>
              <button type="submit" className={styles.primaryButton} disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </section>
  );
}
