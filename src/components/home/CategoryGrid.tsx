'use client';

import React from 'react';
import Link from 'next/link';
import { Category } from '@/types';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useGsapStaggerReveal } from '@/lib/gsap';

const CATEGORY_BADGES: { [slug: string]: string } = {
  'skincare': '👑 Most Popular',
  'facial-care': '✨ Clinical Essentials',
  'sun-protection': '☀️ Zero White Cast',
  'body-care': '🇬🇭 Raw Northern Shea',
  'body-lotions-and-creams': '💧 48H Hydration',
  'body-splashes-and-sprays': '🌸 Long-Lasting Mists',
  'serums-and-treatments': '🔬 Active Formulations',
  'makeup': '💄 Complexion Radiance',
};

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const gridRef = useGsapStaggerReveal('.gsap-category-card', [categories], {
    stagger: 0.08,
    duration: 0.7,
    y: 20,
  });

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white via-blush-light/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span>Curated Beauty Essentials</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 tracking-tight">
            Shop by Category
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-2">
            Explore dermatologist-grade facial actives, rich whipped body butters, zero-cast SPFs, and luxury Ghanaian botanicals.
          </p>
        </div>

        {/* Circular / Rounded Category Quick Badges */}
        <div className="flex items-center justify-center flex-wrap gap-2.5 sm:gap-3 mb-10">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="px-4 py-2 rounded-full bg-white border border-brand-200 text-xs font-bold text-charcoal-800 hover:text-brand-700 hover:border-brand-400 hover:bg-brand-50/50 shadow-2xs transition-all hover:scale-102 flex items-center gap-1.5"
            >
              <span>{c.name}</span>
            </Link>
          ))}
        </div>

        {/* Category Cards Grid */}
        <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const badge = CATEGORY_BADGES[cat.slug] || '✨ Curated';
            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="gsap-category-card group relative rounded-3xl overflow-hidden aspect-[4/5] bg-blush-light border border-brand-100 shadow-card hover:shadow-luxury-hover transition-all duration-500 flex flex-col justify-between p-4 sm:p-5"
              >
                {/* Background Image with Hover Zoom */}
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600'}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Soft Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/85 via-charcoal-950/30 to-black/10 group-hover:from-brand-950/90 transition-colors duration-500" />

                {/* Top Badge */}
                <div className="relative z-10 flex justify-start">
                  <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] sm:text-[11px] font-bold text-charcoal-900 shadow-xs">
                    {badge}
                  </span>
                </div>

                {/* Bottom Title & Counter */}
                <div className="relative z-10 text-white flex items-end justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-base sm:text-lg tracking-tight group-hover:text-gold-300 transition-colors">
                      {cat.name}
                    </h3>
                    {cat.product_count !== undefined && (
                      <p className="text-[11px] text-white/80 font-medium mt-0.5">
                        {cat.product_count} {cat.product_count === 1 ? 'Product' : 'Products'}
                      </p>
                    )}
                  </div>

                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-brand-600 group-hover:scale-110 transition-all shrink-0 shadow-xs">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
