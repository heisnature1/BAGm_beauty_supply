'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

interface WishlistContextType {
  wishlistIds: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const WISHLIST_STORAGE_KEY = 'bagm_wishlist_ids';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // If user is logged in, fetch from backend, otherwise from local storage
    if (user) {
      fetch('/api/wishlist')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.items)) {
            setWishlistIds(data.items.map((i: any) => i.product_id));
          }
        })
        .catch(() => {});
    } else {
      try {
        const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (saved) {
          setWishlistIds(JSON.parse(saved));
        }
      } catch {}
    }
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    const isPresent = wishlistIds.includes(productId);
    const updated = isPresent ? wishlistIds.filter((id) => id !== productId) : [...wishlistIds, productId];

    setWishlistIds(updated);

    if (user) {
      try {
        await fetch('/api/wishlist', {
          method: isPresent ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
      } catch (err) {
        console.error('Failed to sync wishlist with server', err);
      }
    } else {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        count: wishlistIds.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
