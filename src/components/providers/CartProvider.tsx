'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'bagm_beauty_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to storage', e);
      }
    }
  }, [items, isLoaded]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.sku === item.sku);
      if (existing) {
        const newQty = Math.min(existing.quantity + item.quantity, item.maxStock);
        return prev.map((i) => (i.sku === item.sku ? { ...i, quantity: newQty } : i));
      } else {
        return [...prev, item];
      }
    });
    setIsDrawerOpen(true);
  };

  const removeItem = (sku: string) => {
    setItems((prev) => prev.filter((i) => i.sku !== sku));
  };

  const updateQuantity = (sku: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(sku);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.sku === sku) {
          const clamped = Math.min(quantity, i.maxStock);
          return { ...i, quantity: clamped };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        totalItems,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        toggleDrawer: () => setIsDrawerOpen((prev) => !prev),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
