'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { useCart } from '@/components/providers/CartProvider';
import { Product } from '@/types';
import { formatGHS } from '@/lib/utils';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist, count } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlistIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    fetch('/api/products')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.products) {
          const matched = data.products.filter((p: Product) => wishlistIds.includes(p.id));
          setProducts(matched);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [wishlistIds]);

  return (
    <div className="min-h-screen bg-blush-light flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-charcoal-400">
            <Link href="/" className="hover:text-brand-700">Home</Link>
            <span>/</span>
            <span className="text-brand-700 font-semibold">My Wishlist</span>
          </nav>

          <div className="flex items-center justify-between pb-4 border-b border-brand-200">
            <div>
              <h1 className="font-serif font-bold text-3xl text-charcoal-900">My Beauty Wishlist</h1>
              <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
                You have {count} saved {count === 1 ? 'item' : 'items'} in your wishlist.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-charcoal-500 font-semibold">Loading wishlist...</div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-brand-100 shadow-card space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 mx-auto">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-xl text-charcoal-900">Your wishlist is empty</h3>
              <p className="text-xs sm:text-sm text-charcoal-500">
                Tap the heart icon on any product to save it here for later.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
              >
                <span>Discover Formulations</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl p-5 border border-brand-100 shadow-card flex flex-col justify-between space-y-4"
                >
                  <div className="flex gap-4">
                    <img
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=160'}
                      alt={p.name}
                      className="w-24 h-24 rounded-2xl object-cover border border-gray-100 shrink-0"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">{p.brand_name}</span>
                      <Link href={`/product/${p.slug}`} className="font-semibold text-xs sm:text-sm text-charcoal-900 hover:text-brand-700 line-clamp-2 block">
                        {p.name}
                      </Link>
                      <p className="font-serif font-bold text-sm text-charcoal-900 pt-1">{formatGHS(p.price)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() =>
                        addItem({
                          productId: p.id,
                          name: p.name,
                          sku: p.sku,
                          price: p.price,
                          quantity: 1,
                          image: p.images?.[0] || '',
                          maxStock: p.stock_quantity,
                          brandName: p.brand_name,
                        })
                      }
                      className="flex-1 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Bag</span>
                    </button>
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className="p-2.5 text-charcoal-400 hover:text-red-500 rounded-xl border border-gray-200 hover:border-red-200 transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
