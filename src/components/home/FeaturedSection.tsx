'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { ProductCard } from '../product/ProductCard';
import { ArrowRight, Sparkles } from 'lucide-react';

interface FeaturedSectionProps {
  featured: Product[];
  bestsellers: Product[];
  newArrivals: Product[];
}

export function FeaturedSection({ featured, bestsellers, newArrivals }: FeaturedSectionProps) {
  const [activeTab, setActiveTab] = useState<'bestsellers' | 'newArrivals' | 'featured'>('bestsellers');

  const currentProducts =
    activeTab === 'bestsellers'
      ? bestsellers
      : activeTab === 'newArrivals'
      ? newArrivals
      : featured;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 tracking-widest uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>Curated Edit</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
              The Beauty Spotlight
            </h2>
          </div>

          {/* Tab Controls */}
          <div className="flex items-center gap-2 bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200/60 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('bestsellers')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'bestsellers'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Bestsellers
            </button>
            <button
              onClick={() => setActiveTab('newArrivals')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'newArrivals'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              New Arrivals
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'featured'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              BAGm Signature
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {currentProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-brand-200 bg-white hover:bg-brand-50 text-brand-900 font-semibold text-sm transition-all shadow-xs group"
          >
            <span>Explore All Beauty Formulations</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
