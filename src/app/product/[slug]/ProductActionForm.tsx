'use client';

import React, { useState } from 'react';
import { Product, ProductVariant } from '@/types';
import { formatGHS } from '@/lib/utils';
import { useCart } from '@/components/providers/CartProvider';
import { useWishlist } from '@/components/providers/WishlistProvider';
import { ShoppingBag, Heart, Plus, Minus, Check, AlertCircle } from 'lucide-react';

export function ProductActionForm({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentSKU = selectedVariant ? selectedVariant.sku : product.sku;
  const currentStock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;

  const isOutOfStock = product.stock_status === 'out_of_stock' || currentStock <= 0;
  const isLowStock = currentStock > 0 && currentStock <= product.low_stock_threshold;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant?.id || null,
      name: product.name,
      variantName: selectedVariant?.name || null,
      sku: currentSKU,
      price: currentPrice,
      quantity,
      image: product.images?.[0] || '',
      maxStock: currentStock,
      brandName: product.brand_name,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Price & Stock Badge */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
            {formatGHS(currentPrice)}
          </span>
          <span className="text-xs text-charcoal-400 block mt-0.5">Regular Selling Price (GHS)</span>
        </div>

        <div>
          {isOutOfStock ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-charcoal-600 border border-gray-200">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Only {currentStock} left in stock</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>In Stock &amp; Ready to Ship</span>
            </span>
          )}
        </div>
      </div>

      {/* Variants (Sizes / Shades / Volumes) */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
            Select Size / Shade:
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-200'
                      : 'border-gray-200 bg-white text-charcoal-700 hover:border-brand-300'
                  }`}
                >
                  <span>{v.name}</span>
                  <span className="ml-1.5 text-charcoal-400">({formatGHS(v.price)})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity Selector & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Quantity */}
        <div className="flex items-center justify-between border border-gray-200 bg-white rounded-xl p-1 w-full sm:w-auto shrink-0 shadow-xs">
          <button
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            disabled={quantity <= 1 || isOutOfStock}
            className="p-2 text-charcoal-600 hover:text-charcoal-900 disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-4 text-sm font-bold text-charcoal-900">{quantity}</span>
          <button
            onClick={() => setQuantity((prev) => Math.min(currentStock, prev + 1))}
            disabled={quantity >= currentStock || isOutOfStock}
            className="p-2 text-charcoal-600 hover:text-charcoal-900 disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Add to Cart CTA */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex-1 w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
            isOutOfStock
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
              : isAdded
              ? 'bg-emerald-600 text-white'
              : 'bg-brand-600 hover:bg-brand-700 text-white hover:shadow-lg'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added to Bag!</span>
            </>
          ) : isOutOfStock ? (
            <span>Sold Out</span>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Shopping Bag ({formatGHS(currentPrice * quantity)})</span>
            </>
          )}
        </button>

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product.id)}
          className={`p-3.5 rounded-xl border transition-all shrink-0 shadow-xs ${
            inWishlist
              ? 'bg-brand-600 border-brand-600 text-white'
              : 'bg-white border-brand-200 text-charcoal-700 hover:bg-brand-50 hover:text-brand-700'
          }`}
          aria-label={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  );
}
