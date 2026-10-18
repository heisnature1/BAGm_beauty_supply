'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  ShoppingBag,
  Sun,
  CreditCard,
} from 'lucide-react';
import { StoreSettings } from '@/types';

export function HeroBanner({ settings }: { settings: StoreSettings }) {
  return (
    <section className="relative w-full overflow-hidden bg-charcoal-950">
      {/* Full-Bleed Edge-to-Edge Hero Video Background */}
      <div className="relative w-full min-h-[580px] sm:min-h-[640px] lg:min-h-[720px] xl:min-h-[780px] flex items-center justify-center">
        {/* HTML5 Muted Looping Video without any pause controls */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        >
          <source src="/images/page.mp4" type="video/mp4" />
          <source src="/page.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Luxury Dark Gradient Tint Overlay for Crisp Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-charcoal-950/85 pointer-events-none" />

        {/* Direct Text & Action Overlay on Video */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28 text-center text-white space-y-6">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs sm:text-sm font-bold tracking-wide shadow-md backdrop-blur-md animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-gold-300 shrink-0" />
            <span>Ghana’s Premier Luxury Beauty &amp; Skincare Destination</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[1.12] drop-shadow-lg max-w-4xl mx-auto">
            {settings.hero_headline || 'Your Beauty. Your Ritual. Your Glow.'}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-xl text-white/95 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-md">
            {settings.hero_subtitle ||
              'Discover curated beauty and skincare essentials selected to help you build a routine that feels right for you.'}
          </p>

          {/* Call to Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm sm:text-base transition-all shadow-luxury hover:shadow-luxury-hover hover:scale-102 active:scale-98"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span>Shop With Us</span>
              <ArrowRight className="w-4 h-4 text-gold-300" />
            </Link>

            <Link
              href="/routine-finder"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/40 font-semibold text-xs sm:text-sm sm:text-base backdrop-blur-md transition-all shadow-md hover:scale-102 active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-gold-300" />
              <span>Take Skincare Routine Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Micro Trust Proof Ribbon Beneath Full-Bleed Video Banner */}
      <div className="bg-gradient-to-r from-blush via-white to-blush border-y border-brand-200/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm text-charcoal-800 font-bold">
            <div className="flex items-center gap-2.5 p-2 sm:p-2.5">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
              <span>100% Authentic Lab Formulations</span>
            </div>
            <div className="flex items-center gap-2.5 p-2 sm:p-2.5">
              <Truck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Same-Day Greater Accra Delivery</span>
            </div>
            <div className="flex items-center gap-2.5 p-2 sm:p-2.5">
              <Sun className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Zero White Cast Melanin SPFs</span>
            </div>
            <div className="flex items-center gap-2.5 p-2 sm:p-2.5">
              <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>MTN MoMo, Telecel Cash &amp; Cards</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
