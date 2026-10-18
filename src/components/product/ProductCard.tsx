'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';
import { Product } from '@/types';
import { formatGHS } from '@/lib/utils';
import { useCart } from '../providers/CartProvider';
import { useWishlist } from '../providers/WishlistProvider';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      className="group relative bg-white rounded-2xl border border-brand-100/80 hover:border-brand-300 shadow-card hover:shadow-luxury transition-all duration-300 flex flex-col overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-blush-light">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered && secondaryImage ? secondaryImage : primaryImage}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.brand_origin === 'BAGm' && (
            <span className="bg-brand-700 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
              BAGm Signature
            </span>
          )}
          {product.brand_origin === 'Ghanaian' && (
            <span className="bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
              Ghanaian Brand 🇬🇭
            </span>
          )}
          {product.is_bestseller === 1 && (
            <span className="bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
              Bestseller
            </span>
          )}
          {product.is_new_arrival === 1 && (
            <span className="bg-gold-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
              New Arrival
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-charcoal-800 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all shadow-xs z-10 ${
            inWishlist
              ? 'bg-brand-600 text-white'
              : 'bg-white/80 hover:bg-white text-charcoal-600 hover:text-brand-600'
          }`}
          aria-label={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add Overlay on Hover for Desktop */}
        <div className="absolute bottom-2.5 inset-x-2.5 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md ${
              isOutOfStock
                ? 'bg-charcoal-300 text-charcoal-600 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-600 hover:bg-brand-700 text-white active:scale-98'
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
                <span>Quick Add</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-brand-700 font-semibold uppercase tracking-wider mb-1">
            <span>{product.brand_name}</span>
            {product.category_name && (
              <span className="text-charcoal-400 font-normal normal-case text-[10px] hidden sm:inline">
                {product.category_name}
              </span>
            )}
          </div>

          <Link href={`/product/${product.slug}`} className="block group-hover:text-brand-700 transition-colors">
            <h3 className="font-medium text-charcoal-900 text-xs sm:text-sm line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Genuine Ratings from DB */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3 h-3 fill-current" />
            </div>
            <span className="text-xs font-bold text-charcoal-800">
              {product.average_rating || 5.0}
            </span>
            <span className="text-[11px] text-charcoal-400">
              ({product.review_count || 0})
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-serif font-bold text-sm sm:text-base text-charcoal-900">
              {formatGHS(product.price)}
            </span>
            {isLowStock && !isOutOfStock && (
              <span className="text-[10px] font-medium text-amber-600">
                Only {product.stock_quantity} left
              </span>
            )}
          </div>

          {/* Mobile Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`sm:hidden p-2 rounded-lg transition-colors ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400'
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
  );
}
