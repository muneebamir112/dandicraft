"use client";

import { useEffect, useState } from "react";
import fallbackProducts from "@/data/products.json";

export function useProducts() {
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/products", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load the product catalog.");
        return response.json();
      })
      .then((catalog) => {
        if (Array.isArray(catalog)) setProducts(catalog);
      })
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") setError(fetchError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { products, loading, error };
}
