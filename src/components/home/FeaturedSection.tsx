'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { ProductCard } from '../product/ProductCard';
import { ArrowRight, Sparkles, Flame, Sparkle, Heart, Stethoscope } from 'lucide-react';
import { useGsapStaggerReveal } from '@/lib/gsap';

interface FeaturedSectionProps {
  featured: Product[];
  bestsellers: Product[];
  newArrivals: Product[];
}

export function FeaturedSection({ featured, bestsellers, newArrivals }: FeaturedSectionProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'bestsellers' | 'ghanaian' | 'clinical'>('all');

  const ghanaianProducts = [...featured, ...bestsellers, ...newArrivals].filter(
    (p) => p.brand_origin === 'Ghanaian' || p.brand_origin === 'BAGm'
  );

  const clinicalProducts = [...featured, ...bestsellers, ...newArrivals].filter(
    (p) => p.brand_origin === 'International'
  );

  const getFilteredProducts = () => {
    let list: Product[] = [];
    if (activeTab === 'all') {
      list = [...bestsellers, ...featured, ...newArrivals];
    } else if (activeTab === 'bestsellers') {
      list = bestsellers.length > 0 ? bestsellers : featured;
    } else if (activeTab === 'ghanaian') {
      list = ghanaianProducts;
    } else if (activeTab === 'clinical') {
      list = clinicalProducts;
    }
    // Remove duplicates
    return Array.from(new Map(list.map((p) => [p.id, p])).values()).slice(0, 8);
  };

  const displayedProducts = getFilteredProducts();

  const productsGridRef = useGsapStaggerReveal('.gsap-product-item', [activeTab], {
    stagger: 0.06,
    duration: 0.6,
    y: 18,
  });

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title & Subheading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>Accra Beauty Spotlight</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 tracking-tight">
              Best Sellers &amp; Trending Formulations
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-2">
              Discover beloved everyday skincare rituals chosen by beauty lovers across Greater Accra and Ghana.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-brand-200 bg-white hover:bg-brand-50 text-brand-900 text-xs sm:text-sm font-bold transition-all shadow-xs group shrink-0"
          >
            <span>Shop All Formulations</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Category Pill Tabs (Everything Beauty Ghana Style) */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'all'
                ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-200'
                : 'bg-blush-light text-charcoal-700 hover:bg-brand-50 border border-brand-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>All Trending</span>
          </button>

          <button
            onClick={() => setActiveTab('bestsellers')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'bestsellers'
                ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-200'
                : 'bg-blush-light text-charcoal-700 hover:bg-brand-50 border border-brand-100'
            }`}
          >
            <Sparkle className="w-3.5 h-3.5" />
            <span>Top Best Sellers</span>
          </button>

          <button
            onClick={() => setActiveTab('ghanaian')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'ghanaian'
                ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-200'
                : 'bg-blush-light text-charcoal-700 hover:bg-brand-50 border border-brand-100'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Ghanaian Botanicals 🇬🇭</span>
          </button>

          <button
            onClick={() => setActiveTab('clinical')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'clinical'
                ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-200'
                : 'bg-blush-light text-charcoal-700 hover:bg-brand-50 border border-brand-100'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Clinical Science 🔬</span>
          </button>
        </div>

        {/* Product Grid */}
        <div ref={productsGridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayedProducts.map((product) => (
            <div key={product.id} className="gsap-product-item">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl border-2 border-brand-200 bg-white hover:bg-brand-50 text-brand-900 font-bold text-sm transition-all shadow-sm hover:shadow-luxury group"
          >
            <span>Explore Complete Beauty Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
