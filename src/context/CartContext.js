"use client";

import React, { createContext, useContext, startTransition, useState, useEffect } from "react";

const CartContext = createContext();

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
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("dandicraft_cart");
      if (storedCart) {
        try {
          startTransition(() => setCartItems(JSON.parse(storedCart)));
        } catch (e) {
          console.error("Error parsing cart storage:", e);
        }
      }
      startTransition(() => setIsLoaded(true));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("dandicraft_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = (product, selectedOptions = {}, selectedAddons = [], quantity = 1, uploadFile = null) => {
    const key = getCartItemKey(product.id, selectedOptions, selectedAddons, uploadFile);
    const parsedQty = parseInt(quantity, 10) || 1;
    
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.key === key);
      
      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += parsedQty;
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
            image: product.image || "",
            minQty: product.minQty || 1,
            requiresQuote: product.requiresQuote || false
          }
        ];
      }
    });
  };

  const removeFromCart = (key) => {
    setCartItems(prevItems => prevItems.filter(item => item.key !== key));
  };

  const updateQuantity = (key, newQuantity) => {
    const parsedQty = parseInt(newQuantity, 10);
    if (isNaN(parsedQty)) return;

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.key === key
          ? { ...item, quantity: Math.max(item.minQty || 1, parsedQty) }
          : item
      )
    );
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
        validateCartMOQ
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
