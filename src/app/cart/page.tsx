'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { useCart } from '@/components/providers/CartProvider';
import { formatGHS } from '@/lib/utils';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Building,
  RotateCcw,
} from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, totalItems } = useCart();

  return (
    <div className="min-h-screen bg-blush-light flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-charcoal-400 mb-6">
            <Link href="/" className="hover:text-brand-700">Home</Link>
            <span>/</span>
            <span className="text-brand-700 font-semibold">Shopping Bag</span>
          </nav>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
                Your Shopping Bag
              </h1>
              <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
                You have {totalItems} {totalItems === 1 ? 'item' : 'items'} in your beauty bag.
              </p>
            </div>

            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-charcoal-500 hover:text-red-600 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Bag</span>
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-brand-100 shadow-card max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h2 className="font-serif font-bold text-xl text-charcoal-900">Your bag is currently empty</h2>
              <p className="text-xs sm:text-sm text-charcoal-500">
                Explore our selection of premium skincare, cleansers, shea soufflés, and sunscreens.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md transition-all"
              >
                <span>Discover Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Item Table */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-white rounded-3xl p-6 border border-brand-100 shadow-card divide-y divide-gray-100">
                  {items.map((item) => (
                    <div key={item.sku} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=160'}
                          alt={item.name}
                          className="w-20 h-20 rounded-2xl object-cover border border-gray-100 shrink-0"
                        />
                        <div className="space-y-1">
                          {item.brandName && (
                            <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wide">
                              {item.brandName}
                            </span>
                          )}
                          <Link href={`/product/${item.sku}`} className="font-medium text-sm text-charcoal-900 hover:text-brand-700 block">
                            {item.name}
                          </Link>
                          {item.variantName && (
                            <p className="text-xs text-charcoal-500">Option: {item.variantName}</p>
                          )}
                          <p className="text-xs font-bold text-charcoal-800 sm:hidden">
                            {formatGHS(item.price)} each
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-gray-50">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                          <button
                            onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                            className="p-1.5 hover:bg-gray-200 text-charcoal-600 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-charcoal-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="p-1.5 hover:bg-gray-200 text-charcoal-600 disabled:opacity-40 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price Subtotal */}
                        <div className="text-right">
                          <p className="font-serif font-bold text-base text-charcoal-900">
                            {formatGHS(item.price * item.quantity)}
                          </p>
                          <p className="text-[11px] text-charcoal-400 hidden sm:block">
                            {formatGHS(item.price)} each
                          </p>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.sku)}
                          className="p-2 text-charcoal-400 hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900"
                  >
                    <span>&larr; Continue Shopping</span>
                  </Link>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white rounded-3xl p-6 border border-brand-100 shadow-card space-y-5">
                  <h3 className="font-serif font-bold text-lg text-charcoal-900 pb-3 border-b border-gray-100">
                    Order Summary
                  </h3>

                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="flex items-center justify-between text-charcoal-600">
                      <span>Subtotal ({totalItems} items)</span>
                      <span className="font-semibold text-charcoal-900">{formatGHS(subtotal)}</span>
                    </div>

                    <div className="flex items-center justify-between text-charcoal-600">
                      <span>Delivery / Pickup Fee</span>
                      <span className="text-charcoal-500 italic">Calculated at checkout</span>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-base">
                      <span className="font-bold text-charcoal-900">Estimated Total</span>
                      <span className="font-serif font-bold text-xl text-brand-700">{formatGHS(subtotal)}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-98"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <div className="pt-3 border-t border-gray-100 space-y-2 text-[11px] text-charcoal-500">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Encrypted SSL checkout with Ghanaian payment options</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>Express home delivery across Greater Accra</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>Free pickup available at East Legon flagship hub</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
