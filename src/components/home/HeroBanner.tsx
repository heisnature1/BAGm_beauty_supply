'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartHandshake,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Check,
  Star,
  Flame,
} from 'lucide-react';
import { StoreSettings } from '@/types';
import { useCart } from '../providers/CartProvider';
import { useToast } from '../providers/ToastProvider';
import { formatGHS } from '@/lib/utils';

interface HeroSlide {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  origin: 'BAGm' | 'Ghanaian' | 'International';
  tag: string;
  headline: string;
  subtitle: string;
  price: number;
  image: string;
  rating: number;
  reviewsCount: number;
  badges: string[];
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'prod-bagm-peptide-cream',
    sku: 'BAGM-CR-001',
    name: 'BAGm Silk Barrier Peptide Cream 50ml',
    slug: 'bagm-silk-barrier-peptide-cream-50ml',
    brand: 'BAGm Signature',
    origin: 'BAGm',
    tag: '✨ BAGm Signature Formulation',
    headline: 'Rich Peptides & Baobab Oil For Radiant Skin Barrier',
    subtitle:
      'Formulated specifically for melanin-rich skin in West African heat. Non-greasy satin finish with 48H deep hydration and peptide repair.',
    price: 340.0,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=1200',
    rating: 5.0,
    reviewsCount: 38,
    badges: ['💧 48H Hydration Lock', '🌿 Ghanaian Baobab Seed Oil', '🛡️ Multi-Peptides'],
  },
  {
    id: 'prod-laroche-anthelios',
    sku: 'LRP-SPF-050',
    name: 'La Roche-Posay Anthelios Invisible Fluid SPF 50+',
    slug: 'la-roche-posay-anthelios-uvmune-400-invisible-fluid-spf-50',
    brand: 'La Roche-Posay',
    origin: 'International',
    tag: '☀️ 100% Zero White Cast Guaranteed',
    headline: 'Invisible Daily Sun Protection For Melanin-Rich Skin',
    subtitle:
      'Maximum UVA/UVB broad spectrum defense with Mexoryl 400. Sweat and tropical humidity resistant with a transparent radiant finish.',
    price: 320.0,
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=1200',
    rating: 4.9,
    reviewsCount: 52,
    badges: ['🛡️ SPF 50+ Broad Spectrum', '✨ 100% Clear On Dark Skin', '⚡ Ultra-Light Fluid'],
  },
  {
    id: 'prod-kaeme-shea-souffle',
    sku: 'KAE-SH-200',
    name: 'Kaeme Eternal Oud Luxury Whipped Shea Soufflé 200g',
    slug: 'kaeme-eternal-oud-luxury-whipped-shea-souffle-200g',
    brand: 'Kaeme',
    origin: 'Ghanaian',
    tag: '🇬🇭 Handcrafted Artisanal Luxury',
    headline: 'Pure Ghanaian Shea Butter Whipped With Warm Oud',
    subtitle:
      'Unrefined Northern Ghana shea butter whipped to airy perfection with warm oriental oud and vitamin-rich botanical oils for a luminous body glow.',
    price: 220.0,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1200',
    rating: 5.0,
    reviewsCount: 29,
    badges: ['🌰 100% Pure Raw Shea', '👑 Long-Lasting Warm Oud', '✨ Velvety Glow Soufflé'],
  },
  {
    id: 'prod-ordinary-niacinamide',
    sku: 'ORD-NC-030',
    name: 'The Ordinary Niacinamide 10% + Zinc 1% 30ml',
    slug: 'the-ordinary-niacinamide-10-zinc-1-30ml',
    brand: 'The Ordinary',
    origin: 'International',
    tag: '🔬 Clinical Blemish & Pore Control',
    headline: 'Clear Dark Spots, Refine Pores & Balance Tropical Sebum',
    subtitle:
      'High-potency clinical vitamin serum that targets post-acne hyperpigmentation, decongests pores, and regulates shine in humid weather.',
    price: 180.0,
    image: 'https://images.unsplash.com/photo-1608248597359-216259021419?auto=format&fit=crop&q=80&w=1200',
    rating: 4.8,
    reviewsCount: 64,
    badges: ['💧 10% High-Purity Niacinamide', '✨ Fades Dark Spots', '⚡ Oil Balance'],
  },
];

export function HeroBanner({ settings }: { settings: StoreSettings }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [addedSlides, setAddedSlides] = useState<{ [key: string]: boolean }>({});
  const { addItem } = useCart();
  const { showToast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const slide = HERO_SLIDES[currentSlide];

  // Auto-advance slides every 5.5s
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentSlide, isPaused]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleQuickAdd = (current: HeroSlide) => {
    addItem({
      productId: current.id,
      name: current.name,
      sku: current.sku,
      price: current.price,
      quantity: 1,
      image: current.image,
      maxStock: 50,
      brandName: current.brand,
    });

    setAddedSlides((prev) => ({ ...prev, [current.id]: true }));
    showToast({
      title: 'Added to Shopping Bag!',
      message: `${current.name} (${formatGHS(current.price)})`,
      image: current.image,
      type: 'cart',
    });

    setTimeout(() => {
      setAddedSlides((prev) => ({ ...prev, [current.id]: false }));
    }, 2000);
  };

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-blush via-blush-light to-white pt-6 pb-12 sm:pt-10 sm:pb-16 lg:pt-14 lg:pb-20 border-b border-brand-100/60"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-gold-200/30 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid: Left copy, Right big product showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Text info & Action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">
            {/* Top Tag & Origin */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-brand-200 text-brand-800 text-xs font-bold tracking-wide shadow-xs backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                <span>{slide.tag}</span>
              </span>

              {slide.origin === 'Ghanaian' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <span>Ghanaian Artisan 🇬🇭</span>
                </span>
              )}

              {slide.origin === 'BAGm' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-900 text-xs font-bold">
                  <span>Signature Line</span>
                </span>
              )}
            </div>

            {/* Dynamic Headline with animation key */}
            <h1
              key={`h1-${slide.id}`}
              className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal-900 leading-[1.12] animate-fade-in"
            >
              {slide.headline}
            </h1>

            {/* Subtitle */}
            <p
              key={`p-${slide.id}`}
              className="text-sm sm:text-base lg:text-lg text-charcoal-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed animate-fade-in"
            >
              {slide.subtitle}
            </p>

            {/* Key Ingredient Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              {slide.badges.map((b) => (
                <span
                  key={b}
                  className="px-3 py-1 rounded-lg bg-brand-50/80 border border-brand-100 text-charcoal-700 text-xs font-medium backdrop-blur-xs"
                >
                  {b}
                </span>
              ))}
            </div>

            {/* Price & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
              {/* Direct Quick Add */}
              <button
                onClick={() => handleQuickAdd(slide)}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-98 ${
                  addedSlides[slide.id]
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-600 hover:bg-brand-700 text-white shadow-luxury hover:shadow-luxury-hover'
                }`}
              >
                {addedSlides[slide.id] ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Quick Add • {formatGHS(slide.price)}</span>
                  </>
                )}
              </button>

              {/* View Full Product Details */}
              <Link
                href={`/product/${slide.slug}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-brand-200 bg-white/95 hover:bg-brand-50 text-brand-900 font-semibold text-sm transition-all shadow-xs"
              >
                <span>Discover Formula</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Micro Trust Indicators */}
            <div className="pt-4 border-t border-brand-100 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-charcoal-600 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Verified Authentic</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Same-Day / Express Ghana Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-gold-600 shrink-0" />
                <span>Free Routine Guidance</span>
              </div>
            </div>
          </div>

          {/* Right Column: Big Sliding Product Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Product Card Container with Smooth Transition */}
              <div
                key={`img-${slide.id}`}
                className="relative rounded-3xl overflow-hidden shadow-luxury-hover border-4 border-white bg-white aspect-[4/5] sm:aspect-square lg:aspect-[4/5] animate-scale-in group"
              >
                <img
                  src={slide.image}
                  alt={slide.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-charcoal-950/15 to-transparent" />

                {/* Top Badge Overlay */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-md text-[11px] font-bold text-charcoal-900">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    <span>Featured Hero Spotlight</span>
                  </div>

                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-charcoal-900/80 backdrop-blur-md text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{slide.rating.toFixed(1)}</span>
                    <span className="text-[10px] text-white/70">({slide.reviewsCount})</span>
                  </div>
                </div>

                {/* Floating Bottom Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-brand-100 shadow-xl flex items-center justify-between">
                  <div className="min-w-0 pr-3">
                    <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider block truncate">
                      {slide.brand}
                    </span>
                    <h3 className="text-xs sm:text-sm font-semibold text-charcoal-900 truncate">
                      {slide.name}
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-brand-700 mt-0.5">
                      {formatGHS(slide.price)}
                    </p>
                  </div>

                  <Link
                    href={`/product/${slide.slug}`}
                    className="p-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-all shadow-sm shrink-0"
                    aria-label={`View ${slide.name}`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Slider Controls (Prev / Next Arrows) */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
                <button
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-full bg-white shadow-luxury border border-brand-100 flex items-center justify-center text-charcoal-700 hover:text-brand-700 hover:scale-105 active:scale-95 transition-all"
                  aria-label="Previous Product"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Slide indicator dots */}
                <div className="flex items-center gap-1.5 bg-white/95 px-3 py-2 rounded-full border border-brand-100 shadow-sm">
                  {HERO_SLIDES.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentSlide === idx ? 'w-6 bg-brand-600' : 'w-2 bg-brand-200 hover:bg-brand-400'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="w-10 h-10 rounded-full bg-white shadow-luxury border border-brand-100 flex items-center justify-center text-charcoal-700 hover:text-brand-700 hover:scale-105 active:scale-95 transition-all"
                  aria-label="Next Product"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Selector Ribbon at Bottom */}
        <div className="mt-14 pt-8 border-t border-brand-100/70 hidden md:grid grid-cols-4 gap-4">
          {HERO_SLIDES.map((s, idx) => {
            const isSelected = currentSlide === idx;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`p-3 rounded-2xl border transition-all text-left flex items-center gap-3 group ${
                  isSelected
                    ? 'bg-white border-brand-400 shadow-md ring-2 ring-brand-200/50'
                    : 'bg-white/60 hover:bg-white border-brand-100 hover:border-brand-200'
                }`}
              >
                <img
                  src={s.image}
                  alt={s.name}
                  className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider block truncate">
                    {s.brand}
                  </span>
                  <p className="text-xs font-semibold text-charcoal-900 truncate">
                    {s.name}
                  </p>
                  <span className="text-xs font-bold text-charcoal-700 block mt-0.5">
                    {formatGHS(s.price)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
