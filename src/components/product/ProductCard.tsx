'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Star, Check, Eye, X, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { Product } from '@/types';
import { formatGHS } from '@/lib/utils';
import { useCart } from '../providers/CartProvider';
import { useWishlist } from '../providers/WishlistProvider';
import { useToast } from '../providers/ToastProvider';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500';
  const secondaryImage = product.images?.[1] || primaryImage;

  const isOutOfStock = product.stock_status === 'out_of_stock' || product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: 1,
      image: primaryImage,
      maxStock: product.stock_quantity,
      brandName: product.brand_name,
    });

    setIsAdded(true);
    showToast({
      title: 'Added to Shopping Bag!',
      message: `${product.name} (${formatGHS(product.price)})`,
      image: primaryImage,
      type: 'cart',
    });

    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    showToast({
      title: inWishlist ? 'Removed from Wishlist' : 'Saved to Wishlist ❤️',
      message: product.name,
      image: primaryImage,
      type: 'wishlist',
    });
  };

  const handleOpenQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  return (
    <>
      <div
        className="group relative bg-white rounded-3xl border border-brand-100/90 hover:border-brand-300 shadow-card hover:shadow-luxury-hover transition-all duration-300 flex flex-col overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image Container */}
        <div className="relative aspect-square w-full overflow-hidden bg-blush-light">
          <Link href={`/product/${product.slug}`} className="block w-full h-full">
            <img
              src={isHovered && secondaryImage ? secondaryImage : primaryImage}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
            {product.brand_origin === 'BAGm' && (
              <span className="bg-brand-700 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                BAGm Signature
              </span>
            )}
            {product.brand_origin === 'Ghanaian' && (
              <span className="bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                Ghanaian Brand 🇬🇭
              </span>
            )}
            {product.is_bestseller === 1 && (
              <span className="bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                Bestseller 🔥
              </span>
            )}
            {product.is_new_arrival === 1 && (
              <span className="bg-gold-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                New Arrival ✨
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-charcoal-800 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                Out of Stock
              </span>
            )}
          </div>

          {/* Top Right Actions (Wishlist & Quick View) */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
            <button
              onClick={handleToggleWishlist}
              className={`p-2 rounded-full backdrop-blur-md transition-all shadow-xs ${
                inWishlist
                  ? 'bg-brand-600 text-white scale-105'
                  : 'bg-white/85 hover:bg-white text-charcoal-600 hover:text-brand-600'
              }`}
              aria-label={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleOpenQuickView}
              className="p-2 rounded-full bg-white/85 hover:bg-white text-charcoal-600 hover:text-brand-700 backdrop-blur-md transition-all shadow-xs opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center"
              aria-label="Quick View Product"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Add Overlay on Hover for Desktop */}
          <div className="absolute bottom-3 inset-x-3 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 ${
                isOutOfStock
                  ? 'bg-charcoal-300 text-charcoal-600 cursor-not-allowed'
                  : isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-600 hover:bg-brand-700 text-white'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added to Bag!</span>
                </>
              ) : isOutOfStock ? (
                <span>Out of Stock</span>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Quick Add • {formatGHS(product.price)}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Product Information */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] text-brand-700 font-bold uppercase tracking-wider mb-1">
              <span>{product.brand_name}</span>
              {product.category_name && (
                <span className="text-charcoal-400 font-normal normal-case text-[10px] hidden sm:inline">
                  {product.category_name}
                </span>
              )}
            </div>

            <Link href={`/product/${product.slug}`} className="block group-hover:text-brand-700 transition-colors">
              <h3 className="font-semibold text-charcoal-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                {product.name}
              </h3>
            </Link>

            {/* Ratings from DB */}
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex items-center text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-xs font-bold text-charcoal-800">
                {product.average_rating || 5.0}
              </span>
              <span className="text-[11px] text-charcoal-400">
                ({product.review_count || 0} reviews)
              </span>
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-gray-100 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-serif font-bold text-sm sm:text-base text-charcoal-900">
                {formatGHS(product.price)}
              </span>
              {isLowStock && !isOutOfStock && (
                <span className="text-[10px] font-bold text-amber-600 animate-pulse">
                  ⚡ Only {product.stock_quantity} left in stock
                </span>
              )}
            </div>

            {/* Mobile Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`sm:hidden p-2 rounded-xl transition-all shadow-xs ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white'
              }`}
              aria-label="Add to cart"
            >
              {isAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-brand-100 relative animate-scale-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setQuickViewOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-gray-100 transition-colors"
              aria-label="Close Quick View"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="aspect-square rounded-2xl overflow-hidden bg-blush-light border border-brand-100">
                <img
                  src={primaryImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-brand-700 uppercase tracking-widest block">
                    {product.brand_name}
                  </span>
                  <h3 className="font-serif font-bold text-xl text-charcoal-900 mt-1">
                    {product.name}
                  </h3>
                  <p className="text-lg font-serif font-bold text-brand-700 mt-1">
                    {formatGHS(product.price)}
                  </p>
                </div>

                <p className="text-xs text-charcoal-600 leading-relaxed line-clamp-3">
                  {product.description}
                </p>

                {product.benefits && product.benefits.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-800 block">
                      Key Highlights:
                    </span>
                    <ul className="text-xs text-charcoal-600 space-y-1">
                      {product.benefits.slice(0, 3).map((b, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-gold-500 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={(e) => {
                      handleAddToCart(e);
                      setQuickViewOpen(false);
                    }}
                    disabled={isOutOfStock}
                    className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag • {formatGHS(product.price)}</span>
                  </button>

                  <Link
                    href={`/product/${product.slug}`}
                    onClick={() => setQuickViewOpen(false)}
                    className="w-full py-2.5 px-4 rounded-xl border border-brand-200 bg-white hover:bg-brand-50 text-brand-900 font-semibold text-xs text-center transition-colors"
                  >
                    View Full Product Details &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
