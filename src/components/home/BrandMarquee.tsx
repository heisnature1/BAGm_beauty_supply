'use client';

import React from 'react';
import Link from 'next/link';
import { Brand } from '@/types';
import { ArrowRight, Sparkles } from 'lucide-react';

export function BrandMarquee({ brands }: { brands: Brand[] }) {
  return (
    <section className="py-16 bg-blush-light border-y border-brand-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 tracking-widest uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span>Curated Houses</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
            Brand Showcase
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-2">
            Showcasing celebrated international dermatological innovators and handcrafted Ghanaian botanical artisans.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="bg-white rounded-2xl p-5 border border-brand-100 hover:border-brand-300 shadow-card hover:shadow-luxury transition-all text-center flex flex-col items-center justify-between group"
            >
              <div className="w-16 h-16 rounded-full bg-brand-50/80 flex items-center justify-center text-brand-800 font-serif font-bold text-xl border border-brand-100 group-hover:bg-brand-600 group-hover:text-white transition-colors mb-3">
                {brand.name.substring(0, 2).toUpperCase()}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600 block mb-0.5">
                  {brand.origin === 'BAGm' ? 'Signature Line' : brand.origin === 'Ghanaian' ? 'Ghana 🇬🇭' : 'International 🌍'}
                </span>
                <h3 className="font-serif font-bold text-sm text-charcoal-900 group-hover:text-brand-700 transition-colors">
                  {brand.name}
                </h3>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-100 w-full text-[11px] text-charcoal-500 flex items-center justify-center gap-1 group-hover:text-brand-700 font-medium">
                <span>View Products</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
