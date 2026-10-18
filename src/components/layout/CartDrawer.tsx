'use client';

import React from 'react';
import Link from 'next/link';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../providers/CartProvider';
import { formatGHS } from '@/lib/utils';

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, updateQuantity, removeItem, subtotal, totalItems } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-up">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-brand-100 flex items-center justify-between bg-blush-light">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-700" />
              <h2 className="font-serif font-bold text-lg text-charcoal-900">Your Shopping Bag</h2>
              <span className="bg-brand-100 text-brand-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 text-charcoal-400 hover:text-charcoal-700 rounded-full hover:bg-brand-100/50 transition-colors"
              aria-label="Close Shopping Bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-lg text-charcoal-900">Your bag is currently empty</h3>
                  <p className="text-xs sm:text-sm text-charcoal-500 mt-1 max-w-xs">
                    Explore our curated collection of luxury skincare, facial treatments, and fragrances.
                  </p>
                </div>
                <button
                  onClick={closeDrawer}
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors shadow-sm"
                >
                  <Link href="/shop" onClick={closeDrawer}>
                    Discover Products
                  </Link>
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.sku}
                  className="flex gap-3.5 p-3 rounded-xl border border-brand-100 bg-white hover:border-brand-200 transition-colors"
                >
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=120'}
                    alt={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      {item.brandName && (
                        <p className="text-[11px] font-medium text-brand-700 uppercase tracking-wide">
                          {item.brandName}
                        </p>
                      )}
                      <h4 className="text-xs sm:text-sm font-semibold text-charcoal-900 line-clamp-2 leading-snug">
                        {item.name}
                      </h4>
                      {item.variantName && (
                        <p className="text-[11px] text-charcoal-500 mt-0.5">Variant: {item.variantName}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-50">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                          className="p-1 hover:bg-gray-200 text-charcoal-600 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-charcoal-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1 hover:bg-gray-200 text-charcoal-600 disabled:opacity-40 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs sm:text-sm font-bold text-charcoal-900">
                          {formatGHS(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.sku)}
                          className="text-charcoal-400 hover:text-red-500 p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-brand-100 bg-blush-light space-y-3.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-charcoal-600 font-medium">Subtotal</span>
                <span className="font-serif font-bold text-lg text-charcoal-900">{formatGHS(subtotal)}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-charcoal-500 bg-white p-2.5 rounded-lg border border-brand-100">
                <Truck className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Delivery or Pickup options calculated at checkout.</span>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-[0.99]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl border border-brand-200 bg-white hover:bg-brand-50 text-charcoal-800 text-xs font-semibold transition-colors text-center"
                >
                  View Full Bag Details
                </Link>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-charcoal-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Authentic Beauty Products & Secure Payments in Ghana</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
