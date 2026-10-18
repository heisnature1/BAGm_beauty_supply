'use client';

import React from 'react';
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
  // Combine top bestsellers & featured items
  const combined = [...bestsellers, ...featured, ...newArrivals];
  const uniqueProducts = Array.from(new Map(combined.map((p) => [p.id, p])).values()).slice(0, 8);

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>Curated Edit</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 tracking-tight">
              The Beauty Spotlight
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-2">
              Trending formulations chosen by beauty enthusiasts across Greater Accra and Ghana.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-brand-200 bg-white hover:bg-brand-50 text-brand-900 text-xs sm:text-sm font-bold transition-all shadow-xs group"
          >
            <span>Shop All Formulations</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {uniqueProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
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
