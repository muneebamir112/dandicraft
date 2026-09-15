"use client";

import { useEffect, useState } from "react";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCatalog() {
      try {
        const response = await fetch("/api/products", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Could not load the product catalog.");
        const catalog = await response.json();
        if (!Array.isArray(catalog)) throw new Error("Invalid product catalog response.");
        if (controller.signal.aborted) return;
        setProducts(catalog);
        setError("");
      } catch (fetchError) {
        if (!controller.signal.aborted) setError(fetchError.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    // Remove catalogs saved by older versions of the storefront.
    try {
      localStorage.removeItem("dandicraft_products");
    } catch {
      // Storage may be unavailable in restricted browsing modes.
    }

    const refreshCatalog = () => loadCatalog();
    const refreshVisibleCatalog = () => {
      if (document.visibilityState === "visible") loadCatalog();
    };

    loadCatalog();
    window.addEventListener("focus", refreshCatalog);
    document.addEventListener("visibilitychange", refreshVisibleCatalog);

    return () => {
      controller.abort();
      window.removeEventListener("focus", refreshCatalog);
      document.removeEventListener("visibilitychange", refreshVisibleCatalog);
    };
  }, []);

  return { products, loading, error };
}
