'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { ProductCard } from '../product/ProductCard';
import { ArrowRight, Sparkles, Flame, Sun, Crown, Heart } from 'lucide-react';

interface FeaturedSectionProps {
  featured: Product[];
  bestsellers: Product[];
  newArrivals: Product[];
}

export function FeaturedSection({ featured, bestsellers, newArrivals }: FeaturedSectionProps) {
  const [activeTab, setActiveTab] = useState<'bestsellers' | 'newArrivals' | 'featured' | 'sunCare' | 'ghanaian'>('bestsellers');

  // Filter products by tab
  const getDisplayProducts = () => {
    switch (activeTab) {
      case 'bestsellers':
        return bestsellers;
      case 'newArrivals':
        return newArrivals;
      case 'featured':
        return featured.filter((p) => p.brand_origin === 'BAGm');
      case 'sunCare':
        return [...featured, ...bestsellers, ...newArrivals].filter(
          (p) => p.category_slug === 'sun-protection' || p.category_id === 'cat-sun-protection' || p.name.toLowerCase().includes('spf')
        );
      case 'ghanaian':
        return [...featured, ...bestsellers, ...newArrivals].filter((p) => p.brand_origin === 'Ghanaian');
      default:
        return bestsellers;
    }
  };

  const displayProducts = getDisplayProducts();
  // De-duplicate if needed
  const uniqueProducts = Array.from(new Map(displayProducts.map((p) => [p.id, p])).values());

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>Curated Edit</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 tracking-tight">
              The Beauty Spotlight
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-2">
              Trending formulations chosen by beauty enthusiasts in Accra, Kumasi, and Takoradi.
            </p>
          </div>

          {/* Interactive Tab Controls */}
          <div className="flex items-center gap-1.5 bg-gray-100/90 p-1.5 rounded-2xl border border-gray-200/80 overflow-x-auto no-scrollbar self-start md:self-auto max-w-full">
            <button
              onClick={() => setActiveTab('bestsellers')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'bestsellers'
                  ? 'bg-white text-brand-700 shadow-sm scale-102'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Bestsellers</span>
            </button>
            <button
              onClick={() => setActiveTab('newArrivals')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'newArrivals'
                  ? 'bg-white text-brand-700 shadow-sm scale-102'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>New Arrivals</span>
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'featured'
                  ? 'bg-white text-brand-700 shadow-sm scale-102'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-brand-600" />
              <span>BAGm Signature</span>
            </button>
            <button
              onClick={() => setActiveTab('sunCare')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'sunCare'
                  ? 'bg-white text-brand-700 shadow-sm scale-102'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Sun Protection</span>
            </button>
            <button
              onClick={() => setActiveTab('ghanaian')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'ghanaian'
                  ? 'bg-white text-brand-700 shadow-sm scale-102'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <span>🇬🇭 Ghanaian Brands</span>
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {uniqueProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl border-2 border-brand-200 bg-white hover:bg-brand-50 text-brand-900 font-bold text-sm transition-all shadow-sm hover:shadow-luxury group"
          >
            <span>Explore All 100% Genuine Formulations</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
