'use client';

import React from 'react';
import Link from 'next/link';
import { Category } from '@/types';
import { ArrowUpRight } from 'lucide-react';

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-700 tracking-widest uppercase">
            Curated Collections
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 mt-2">
            Shop by Category
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-2">
            Explore targeted facial treatments, rich whipped body butters, restorative serums, and luxury mists.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-blush-light border border-brand-100 shadow-card hover:shadow-luxury transition-all duration-300 flex flex-col justify-end p-4 sm:p-5"
            >
              <img
                src={cat.image_url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600'}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-charcoal-950/30 to-transparent" />

              <div className="relative z-10 text-white flex items-end justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg tracking-tight group-hover:text-brand-200 transition-colors">
                    {cat.name}
                  </h3>
                  {cat.product_count !== undefined && (
                    <p className="text-[11px] text-white/80 font-medium">
                      {cat.product_count} {cat.product_count === 1 ? 'Product' : 'Products'}
                    </p>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-brand-600 transition-colors shrink-0">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
