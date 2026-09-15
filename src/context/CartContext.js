"use client";

import React, { createContext, useContext, startTransition, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const CartContext = createContext();

async function getAvailableProducts(signal) {
  const response = await fetch("/api/products", {
    cache: "no-store",
    signal,
  });
  if (!response.ok) return null;

  const products = await response.json();
  if (!Array.isArray(products)) return null;
  return new Map(products.map((product) => [product.id, product]));
}

function reconcileCartItems(items, availableProducts) {
  const remainingStock = new Map();

  return items.reduce((nextItems, item) => {
    const product = availableProducts.get(item.id);
    if (!product) return nextItems;

    const minQty = product.minQty || 1;
    let quantity = Math.max(minQty, Math.floor(Number(item.quantity) || minQty));

    if (product.trackInventory) {
      const remaining = remainingStock.has(product.id)
        ? remainingStock.get(product.id)
        : product.stockQuantity;
      quantity = Math.min(quantity, remaining);
      if (quantity < minQty) return nextItems;
      remainingStock.set(product.id, remaining - quantity);
    }

    nextItems.push({
      ...item,
      slug: product.slug,
      name: product.name,
      category: product.category,
      basePrice: product.price,
      image: product.images?.[0] || product.image || "",
      minQty,
      requiresQuote: product.requiresQuote,
      trackInventory: product.trackInventory,
      stockQuantity: product.stockQuantity,
      quantity,
    });
    return nextItems;
  }, []);
}

export function useCart() {
  return useContext(CartContext);
}

// Helper to generate a unique key for cart items based on their options and addons
export const getCartItemKey = (productId, options = {}, addons = [], uploadFile = null) => {
  const sortedOptions = Object.keys(options)
    .sort()
    .map(key => `${key}:${options[key]}`)
    .join("|");
  
  const sortedAddons = addons
    .map(a => a.name)
    .sort()
    .join("|");
  
  const fileHash = uploadFile ? (typeof uploadFile === 'string' ? uploadFile.substring(0, 30) : uploadFile.name) : "";

  return `${productId}-${sortedOptions}-${sortedAddons}-${fileHash}`;
};

export const CartProvider = ({ children }) => {
  const pathname = usePathname();
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load the saved cart and remove products that are no longer published.
  useEffect(() => {
    const controller = new AbortController();
    let initialized = false;

    async function initializeCart() {
      let savedItems = [];

      try {
        const storedCart = localStorage.getItem("dandicraft_cart");
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          if (Array.isArray(parsedCart)) savedItems = parsedCart;
        }
      } catch (storageError) {
        console.error("Error parsing cart storage:", storageError);
      }

      if (savedItems.length > 0) {
        try {
          const availableProducts = await getAvailableProducts(controller.signal);
          if (availableProducts) {
            savedItems = reconcileCartItems(savedItems, availableProducts);
          }
        } catch (catalogError) {
          if (catalogError.name !== "AbortError") {
            console.error("Could not validate saved cart:", catalogError);
          }
        }
      }

      if (controller.signal.aborted) return;
      startTransition(() => {
        setCartItems(savedItems);
        setIsLoaded(true);
      });
      initialized = true;
    }

    async function refreshCart() {
      if (!initialized) return;
      try {
        const availableProducts = await getAvailableProducts(controller.signal);
        if (!availableProducts || controller.signal.aborted) return;
        setCartItems((current) => reconcileCartItems(current, availableProducts));
      } catch (catalogError) {
        if (catalogError.name !== "AbortError") {
          console.error("Could not refresh cart availability:", catalogError);
        }
      }
    }

    const refreshVisibleCart = () => {
      if (document.visibilityState === "visible") refreshCart();
    };

    initializeCart();
    window.addEventListener("focus", refreshCart);
    document.addEventListener("visibilitychange", refreshVisibleCart);

    return () => {
      controller.abort();
      window.removeEventListener("focus", refreshCart);
      document.removeEventListener("visibilitychange", refreshVisibleCart);
    };
  }, []);

  // Client-side navigation does not fire a window focus event.
  useEffect(() => {
    if (!isLoaded || (pathname !== "/cart" && !pathname.startsWith("/checkout"))) return;

    const controller = new AbortController();

    async function validateCurrentCart() {
      try {
        const availableProducts = await getAvailableProducts(controller.signal);
        if (!availableProducts || controller.signal.aborted) return;
        setCartItems((current) => reconcileCartItems(current, availableProducts));
      } catch (catalogError) {
        if (catalogError.name !== "AbortError") {
          console.error("Could not validate current cart:", catalogError);
        }
      }
    }

    validateCurrentCart();
    return () => controller.abort();
  }, [isLoaded, pathname]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("dandicraft_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = (product, selectedOptions = {}, selectedAddons = [], quantity = 1, uploadFile = null) => {
    const key = getCartItemKey(product.id, selectedOptions, selectedAddons, uploadFile);
    const minQty = product.minQty || 1;
    const parsedQty = Math.max(minQty, parseInt(quantity, 10) || minQty);
    const quantityAlreadyInCart = cartItems.reduce(
      (total, item) => total + (item.id === product.id ? item.quantity : 0),
      0
    );

    if (product.trackInventory && quantityAlreadyInCart + parsedQty > product.stockQuantity) {
      return {
        added: false,
        message: `Only ${product.stockQuantity} units are available, including quantities already in your cart.`,
      };
    }
    
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.key === key);
      
      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + parsedQty,
        };
        return updatedItems;
      } else {
        // Add new item
        return [
          ...prevItems,
          {
            key,
            id: product.id,
            slug: product.slug,
            name: product.name,
            category: product.category,
            basePrice: product.price,
            options: selectedOptions,
            addons: selectedAddons,
            quantity: parsedQty,
            uploadFile: uploadFile, // base64 string or file info
            image: product.images?.[0] || product.image || "",
            minQty,
            requiresQuote: product.requiresQuote || false,
            trackInventory: product.trackInventory || false,
            stockQuantity: product.stockQuantity || 0,
          }
        ];
      }
    });
    return { added: true };
  };

  const removeFromCart = (key) => {
    setCartItems(prevItems => prevItems.filter(item => item.key !== key));
  };

  const updateQuantity = (key, newQuantity) => {
    const parsedQty = parseInt(newQuantity, 10);
    if (isNaN(parsedQty)) return;

    setCartItems(prevItems => prevItems.map(item => {
      if (item.key !== key) return item;

      const minQty = item.minQty || 1;
      if (!item.trackInventory) {
        return { ...item, quantity: Math.max(minQty, parsedQty) };
      }

      const otherQuantity = prevItems.reduce(
        (total, otherItem) => total + (
          otherItem.id === item.id && otherItem.key !== key ? otherItem.quantity : 0
        ),
        0
      );
      const maximumForItem = Math.max(0, item.stockQuantity - otherQuantity);
      if (maximumForItem < minQty) return item;
      return { ...item, quantity: Math.min(maximumForItem, Math.max(minQty, parsedQty)) };
    }));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Helper to calculate total price of an item including its addons
  const getItemPrice = (item) => {
    const addonsTotal = item.addons.reduce((sum, addon) => sum + addon.price, 0);
    return item.basePrice + addonsTotal;
  };

  // Subtotal for items that are check-out-able (price > 0)
  const cartSubtotal = cartItems.reduce((sum, item) => {
    return sum + (getItemPrice(item) * item.quantity);
  }, 0);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartItemCount = cartItems.length;

  // Validate if all items meet their MOQ (Minimum Order Quantity)
  const validateCartMOQ = () => {
    return cartItems.every(item => item.quantity >= (item.minQty || 1));
  };

  const validateCartStock = () => {
    const quantities = new Map();
    for (const item of cartItems) {
      if (!item.trackInventory) continue;
      quantities.set(item.id, (quantities.get(item.id) || 0) + item.quantity);
      if (quantities.get(item.id) > item.stockQuantity) return false;
    }
    return true;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoaded,
        cartCount,
        cartItemCount,
        cartSubtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemPrice,
        validateCartMOQ,
        validateCartStock
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
