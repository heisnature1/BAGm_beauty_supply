'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake, Truck } from 'lucide-react';
import { StoreSettings } from '@/types';

export function HeroBanner({ settings }: { settings: StoreSettings }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blush via-blush-light to-white pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-brand-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-brand-200/80 shadow-xs text-brand-800 text-xs font-semibold tracking-wide backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>Ghana’s Premier Luxury Beauty & Skincare Destination</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal-900 leading-[1.15]">
              {settings.hero_headline || 'Your Beauty. Your Ritual. Your Glow.'}
            </h1>

            <p className="text-base sm:text-lg text-charcoal-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {settings.hero_subtitle ||
                'Discover beauty and skincare essentials selected to help you build a routine that feels right for you.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href={settings.hero_primary_cta_link || '/shop'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-98"
              >
                <span>{settings.hero_primary_cta_text || 'Shop Beauty'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={settings.hero_secondary_cta_link || '/routine-finder'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-brand-200 bg-white/90 hover:bg-brand-50 text-brand-900 font-semibold text-sm transition-all shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-gold-500" />
                <span>{settings.hero_secondary_cta_text || 'Routine Finder'}</span>
              </Link>
            </div>

            {/* Micro Trust Proof */}
            <div className="pt-6 border-t border-brand-100 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-charcoal-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Verified Authentic</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Express Ghana Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-gold-600 shrink-0" />
                <span>Ghanaian & Global Brands</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Collage */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative Glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-brand-300/40 via-gold-200/30 to-brand-100/50 rounded-3xl filter blur-2xl -z-10" />

              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white aspect-[4/5]">
                <img
                  src={
                    settings.hero_image_url ||
                    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1200'
                  }
                  alt="BAGm Beauty Supply Skincare Rituals"
                  className="w-full h-full object-cover"
                />

                {/* Floating Product Highlight Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-brand-100 shadow-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider block">
                      Featured Formula
                    </span>
                    <h4 className="text-xs sm:text-sm font-semibold text-charcoal-900">
                      BAGm Silk Barrier Peptide Cream
                    </h4>
                    <p className="text-xs font-bold text-brand-700 mt-0.5">GH₵ 340.00</p>
                  </div>
                  <Link
                    href="/product/bagm-silk-barrier-peptide-cream-50ml"
                    className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-colors"
                    aria-label="View Product"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
