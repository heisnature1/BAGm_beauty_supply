'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  ShoppingBag,
  Sun,
  CreditCard,
  Volume2,
  VolumeX,
  Play,
  Pause,
} from 'lucide-react';
import { StoreSettings } from '@/types';

export function HeroBanner({ settings }: { settings: StoreSettings }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blush via-blush-light to-white pt-8 pb-14 sm:pt-12 sm:pb-20 border-b border-brand-100/60">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-28 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-gold-200/30 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Text Banner */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-brand-200 text-brand-900 text-xs font-bold tracking-wide shadow-xs backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-gold-500 shrink-0" />
            <span>Ghana’s Premier Luxury Beauty &amp; Skincare Destination</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal-900 leading-[1.12]">
            {settings.hero_headline || 'Your Beauty. Your Ritual. Your Glow.'}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-charcoal-600 max-w-2xl mx-auto font-normal leading-relaxed">
            {settings.hero_subtitle ||
              'Discover authentic Ghanaian botanicals, curated global dermatological science, and personalized skincare rituals.'}
          </p>

          {/* Main Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-all shadow-luxury hover:shadow-luxury-hover active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shop With Us</span>
              <ArrowRight className="w-4 h-4 text-gold-300" />
            </Link>

            <Link
              href="/routine-finder"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl border border-brand-200 bg-white hover:bg-brand-50 text-brand-900 font-semibold text-xs sm:text-sm transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>Take Skincare Routine Quiz</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Cinematic Video Hero Showcase Stage */}
        <div className="relative rounded-3xl overflow-hidden shadow-luxury-hover border-4 border-white bg-charcoal-950 p-2 sm:p-3 mb-8">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-charcoal-950">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            >
              <source src="/images/page.mp4" type="video/mp4" />
              <source src="/page.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Video Control Bar Overlay */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 pointer-events-auto">
              <button
                onClick={togglePlay}
                className="p-2.5 rounded-full bg-charcoal-900/80 hover:bg-charcoal-900 text-white backdrop-blur-md transition-all border border-white/20 shadow-md"
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={toggleMute}
                className="p-2.5 rounded-full bg-charcoal-900/80 hover:bg-charcoal-900 text-white backdrop-blur-md transition-all border border-white/20 shadow-md"
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Floating Quick Action Overlay */}
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600/95 hover:bg-brand-600 text-white text-xs font-bold backdrop-blur-md shadow-lg transition-all hover:scale-105 active:scale-95 border border-white/20"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Shop With Us</span>
                <ArrowRight className="w-3.5 h-3.5 text-gold-300" />
              </Link>
            </div>
          </div>
        </div>

        {/* Micro Trust Proof Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs sm:text-sm text-charcoal-700 font-semibold">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/80 border border-brand-100 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
            <span>100% Authentic Lab Formulations</span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/80 border border-brand-100 shadow-2xs">
            <Truck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Same-Day Greater Accra Delivery</span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/80 border border-brand-100 shadow-2xs">
            <Sun className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Zero White Cast SPFs for Melanin Skin</span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/80 border border-brand-100 shadow-2xs">
            <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>MTN MoMo, Telecel Cash &amp; Cards</span>
          </div>
        </div>
      </div>
    </section>
  );
}
