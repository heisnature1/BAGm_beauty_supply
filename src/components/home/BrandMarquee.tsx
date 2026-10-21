'use client';

import React from 'react';
import Link from 'next/link';
import { Brand } from '@/types';
import { ArrowRight, Sparkles, Crown } from 'lucide-react';
import { useGsapStaggerReveal } from '@/lib/gsap';

export function BrandMarquee({ brands }: { brands: Brand[] }) {
  const brandGridRef = useGsapStaggerReveal('.gsap-brand-card', [brands], {
    stagger: 0.05,
    duration: 0.6,
    y: 16,
  });

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white via-blush-light/60 to-white border-y border-brand-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span>Curated Houses</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 tracking-tight">
            Brand Showcase
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-2">
            Showcasing celebrated international dermatological innovators and handcrafted Ghanaian botanical artisans.
          </p>
        </div>

        <div ref={brandGridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="gsap-brand-card bg-white rounded-3xl p-6 border border-brand-100/90 hover:border-brand-300 shadow-card hover:shadow-luxury-hover transition-all duration-300 text-center flex flex-col items-center justify-between group hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-50 to-blush flex items-center justify-center text-brand-800 font-serif font-bold text-xl border border-brand-200/60 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-xs mb-3 group-hover:scale-105">
                {brand.name.substring(0, 2).toUpperCase()}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600 block mb-1">
                  {brand.origin === 'BAGm' ? '👑 Signature Line' : brand.origin === 'Ghanaian' ? '🇬🇭 Ghana Artisan' : '🌍 International'}
                </span>
                <h3 className="font-serif font-bold text-sm sm:text-base text-charcoal-900 group-hover:text-brand-700 transition-colors">
                  {brand.name}
                </h3>
                {brand.product_count !== undefined && (
                  <p className="text-[11px] text-charcoal-400 mt-0.5">
                    {brand.product_count} {brand.product_count === 1 ? 'Product' : 'Products'}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 w-full text-[11px] text-charcoal-500 flex items-center justify-center gap-1 group-hover:text-brand-700 font-bold">
                <span>View Products</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
