'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Star, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { formatGHS } from '@/lib/utils';

interface GlowCard {
  id: string;
  name: string;
  location: string;
  image: string;
  skinType: string;
  concern: string;
  quote: string;
  rating: number;
  featuredProduct: {
    name: string;
    slug: string;
    price: number;
    brand: string;
  };
}

const GLOW_CARDS: GlowCard[] = [
  {
    id: '1',
    name: 'Akosua D.',
    location: 'East Legon, Accra',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    skinType: 'Combination / Oily',
    concern: 'Hyperpigmentation & Sun Protection',
    quote:
      'Finding a sunscreen that doesn’t leave a chalky purple cast on dark skin in Accra was impossible until La Roche-Posay Invisible Fluid from BAGm. 10/10.',
    rating: 5,
    featuredProduct: {
      name: 'La Roche-Posay Anthelios Invisible Fluid SPF 50+',
      slug: 'la-roche-posay-anthelios-uvmune-400-invisible-fluid-spf-50',
      price: 320.0,
      brand: 'La Roche-Posay',
    },
  },
  {
    id: '2',
    name: 'Efua M.',
    location: 'Airport Residential, Accra',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800',
    skinType: 'Dry / Sensitive',
    concern: 'Barrier Repair',
    quote:
      'The BAGm Silk Barrier Cream is magic. My skin feels like velvet all day, and it never feels heavy or greasy under makeup in Ghana heat.',
    rating: 5,
    featuredProduct: {
      name: 'BAGm Silk Barrier Peptide Cream 50ml',
      slug: 'bagm-silk-barrier-peptide-cream-50ml',
      price: 340.0,
      brand: 'BAGm Signature',
    },
  },
  {
    id: '3',
    name: 'Nana Yaw B.',
    location: 'Kumasi, Ashanti',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    skinType: 'Oily / Blemish-Prone',
    concern: 'Enlarged Pores & Excess Sebum',
    quote:
      'The Ordinary Niacinamide delivered in 48 hours to Kumasi. Cleared my T-zone congestion within two weeks. Authentic products only.',
    rating: 5,
    featuredProduct: {
      name: 'The Ordinary Niacinamide 10% + Zinc 1%',
      slug: 'the-ordinary-niacinamide-10-zinc-1-30ml',
      price: 180.0,
      brand: 'The Ordinary',
    },
  },
];

export function CommunityGlow() {
  return (
    <section className="py-16 sm:py-20 bg-blush-light/80 border-b border-brand-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-brand-200 text-brand-800 text-xs font-bold uppercase tracking-wider mb-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>Real Skin. Real Melanin Radiance.</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 tracking-tight">
              Glow With BAGm
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-2 max-w-xl">
              Verified customer experiences from across Greater Accra and Ghana. Authenticity and clinical results you can trust.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-brand-700 bg-white px-4 py-2.5 rounded-2xl border border-brand-200 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Genuine Verified Purchases</span>
          </div>
        </div>

        {/* 3-Column Glow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {GLOW_CARDS.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-3xl p-6 border border-brand-100 shadow-card hover:shadow-luxury transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* User Header */}
                <div className="flex items-center gap-3.5">
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-13 h-13 rounded-full object-cover border-2 border-brand-200 shadow-xs group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <h3 className="font-serif font-bold text-base text-charcoal-900 flex items-center gap-1.5">
                      <span>{card.name}</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </h3>
                    <p className="text-[11px] text-charcoal-400">{card.location}</p>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(card.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-800 text-[10px] font-bold">
                    {card.skinType}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-charcoal-600 text-[10px] font-medium">
                    {card.concern}
                  </span>
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-charcoal-700 italic leading-relaxed">
                  &ldquo;{card.quote}&rdquo;
                </p>
              </div>

              {/* Tagged Product Box */}
              <div className="mt-6 pt-4 border-t border-brand-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider block">
                    Routine Formula:
                  </span>
                  <p className="text-xs font-bold text-charcoal-900 truncate max-w-[180px]">
                    {card.featuredProduct.name}
                  </p>
                  <span className="text-xs font-semibold text-brand-700">
                    {formatGHS(card.featuredProduct.price)}
                  </span>
                </div>

                <Link
                  href={`/product/${card.featuredProduct.slug}`}
                  className="p-2.5 rounded-xl bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white transition-colors"
                  aria-label={`View ${card.featuredProduct.name}`}
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
