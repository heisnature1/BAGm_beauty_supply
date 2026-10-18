'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Category, Brand } from '@/types';
import { Filter, X, RotateCcw, Check } from 'lucide-react';

interface ProductFiltersProps {
  categories: Category[];
  brands: Brand[];
  totalResults: number;
}

export function ProductFilters({ categories, brands, totalResults }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const currentBrand = searchParams.get('brand') || '';
  const currentOrigin = searchParams.get('origin') || '';
  const currentSkinType = searchParams.get('skin_type') || '';
  const currentConcern = searchParams.get('concern') || '';
  const currentMinPrice = searchParams.get('min_price') || '';
  const currentMaxPrice = searchParams.get('max_price') || '';
  const currentInStock = searchParams.get('in_stock') === 'true';
  const currentSort = searchParams.get('sort') || 'newest';

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const resetFilters = () => {
    router.push('/shop');
  };

  const hasActiveFilters = Boolean(
    currentCategory || currentBrand || currentOrigin || currentSkinType || currentConcern || currentMinPrice || currentMaxPrice || currentInStock
  );

  const skinTypes = [
    { id: 'oily', label: 'Oily' },
    { id: 'dry', label: 'Dry' },
    { id: 'combination', label: 'Combination' },
    { id: 'normal', label: 'Normal' },
    { id: 'sensitive', label: 'Sensitive' },
  ];

  const skinConcerns = [
    { id: 'dryness', label: 'Dryness & Dehydration' },
    { id: 'uneven_tone', label: 'Uneven Tone & Dark Spots' },
    { id: 'excess_oil', label: 'Excess Sebum & Shine' },
    { id: 'blemishes', label: 'Blemishes & Breakouts' },
    { id: 'hydration', label: 'Barrier & Plumping Hydration' },
    { id: 'pores', label: 'Enlarged Pores' },
    { id: 'aging', label: 'Fine Lines & Elasticity' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-brand-100 p-5 shadow-card space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-700" />
          <h3 className="font-serif font-bold text-base text-charcoal-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-brand-700 hover:text-brand-900 font-semibold transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* In-Stock Only Toggle */}
      <div className="flex items-center justify-between py-2 border-b border-gray-100">
        <label htmlFor="in-stock-toggle" className="text-xs font-semibold text-charcoal-800 cursor-pointer">
          In Stock Only
        </label>
        <input
          id="in-stock-toggle"
          type="checkbox"
          checked={currentInStock}
          onChange={(e) => updateParam('in_stock', e.target.checked ? 'true' : null)}
          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
        />
      </div>

      {/* Brand Origin */}
      <div className="space-y-2 border-b border-gray-100 pb-4">
        <h4 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">Brand Heritage</h4>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: '', label: 'All Brands' },
            { id: 'BAGm', label: 'BAGm Signature' },
            { id: 'Ghanaian', label: 'Ghanaian Brands 🇬🇭' },
            { id: 'International', label: 'International' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => updateParam('origin', item.id || null)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                currentOrigin === item.id
                  ? 'bg-brand-600 text-white font-semibold'
                  : 'bg-gray-100 text-charcoal-700 hover:bg-brand-50 hover:text-brand-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2.5 border-b border-gray-100 pb-4">
        <h4 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">Categories</h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => updateParam('category', null)}
            className={`w-full flex items-center justify-between text-xs py-1 px-2 rounded-lg transition-colors ${
              !currentCategory ? 'bg-brand-50 text-brand-700 font-bold' : 'text-charcoal-700 hover:bg-gray-50'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => updateParam('category', c.slug)}
              className={`w-full flex items-center justify-between text-xs py-1 px-2 rounded-lg transition-colors ${
                currentCategory === c.slug
                  ? 'bg-brand-50 text-brand-700 font-bold'
                  : 'text-charcoal-700 hover:bg-gray-50'
              }`}
            >
              <span>{c.name}</span>
              {c.product_count !== undefined && (
                <span className="text-[10px] text-charcoal-400">({c.product_count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Skin Type */}
      <div className="space-y-2 border-b border-gray-100 pb-4">
        <h4 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">Skin Type</h4>
        <div className="flex flex-wrap gap-1.5">
          {skinTypes.map((st) => (
            <button
              key={st.id}
              onClick={() => updateParam('skin_type', currentSkinType === st.id ? null : st.id)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                currentSkinType === st.id
                  ? 'bg-brand-600 border-brand-600 text-white font-semibold'
                  : 'bg-white border-gray-200 text-charcoal-700 hover:border-brand-300'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Skin Concern */}
      <div className="space-y-2 border-b border-gray-100 pb-4">
        <h4 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">Primary Skin Concern</h4>
        <div className="space-y-1.5">
          {skinConcerns.map((sc) => (
            <button
              key={sc.id}
              onClick={() => updateParam('concern', currentConcern === sc.id ? null : sc.id)}
              className={`w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-left transition-colors ${
                currentConcern === sc.id
                  ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                  : 'text-charcoal-700 hover:bg-gray-50'
              }`}
            >
              <span>{sc.label}</span>
              {currentConcern === sc.id && <Check className="w-3.5 h-3.5 text-brand-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Brands List */}
      <div className="space-y-2 border-b border-gray-100 pb-4">
        <h4 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">Brands</h4>
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
          <button
            onClick={() => updateParam('brand', null)}
            className={`w-full flex items-center justify-between text-xs py-1 px-2 rounded-lg transition-colors ${
              !currentBrand ? 'bg-brand-50 text-brand-700 font-bold' : 'text-charcoal-700 hover:bg-gray-50'
            }`}
          >
            <span>All Brands</span>
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => updateParam('brand', b.slug)}
              className={`w-full flex items-center justify-between text-xs py-1 px-2 rounded-lg transition-colors ${
                currentBrand === b.slug
                  ? 'bg-brand-50 text-brand-700 font-bold'
                  : 'text-charcoal-700 hover:bg-gray-50'
              }`}
            >
              <span>{b.name}</span>
              {b.product_count !== undefined && (
                <span className="text-[10px] text-charcoal-400">({b.product_count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range (GH₵) */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">Price Range (GH₵)</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-charcoal-400 uppercase">Min</label>
            <input
              type="number"
              placeholder="0"
              value={currentMinPrice}
              onChange={(e) => updateParam('min_price', e.target.value || null)}
              className="w-full text-xs p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-charcoal-400 uppercase">Max</label>
            <input
              type="number"
              placeholder="1000"
              value={currentMaxPrice}
              onChange={(e) => updateParam('max_price', e.target.value || null)}
              className="w-full text-xs p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
