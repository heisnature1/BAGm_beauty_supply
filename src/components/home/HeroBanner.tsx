'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartHandshake,
  ShoppingBag,
  Check,
  Star,
  RotateCw,
  Box,
  Layers,
} from 'lucide-react';
import { StoreSettings } from '@/types';
import { useCart } from '../providers/CartProvider';
import { useToast } from '../providers/ToastProvider';
import { formatGHS } from '@/lib/utils';
import { Product3DConfig } from './Product3DViewer';

// Dynamically import 3D viewer with SSR disabled for optimal WebGL performance
const Product3DViewer = dynamic(
  () => import('./Product3DViewer').then((mod) => mod.Product3DViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[380px] sm:min-h-[460px] flex flex-col items-center justify-center space-y-3 bg-blush-light rounded-3xl border border-brand-100 animate-pulse">
        <Box className="w-10 h-10 text-brand-400 animate-bounce" />
        <p className="text-xs font-bold text-brand-700">Loading 3D Product Experience...</p>
      </div>
    ),
  }
);

interface HeroProductItem {
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
  config3D: Product3DConfig;
}

const HERO_PRODUCTS: HeroProductItem[] = [
  {
    id: 'prod-bagm-peptide-cream',
    sku: 'BAGM-CR-001',
    name: 'BAGm Silk Barrier Peptide Cream 50ml',
    slug: 'bagm-silk-barrier-peptide-cream-50ml',
    brand: 'BAGm Signature',
    origin: 'BAGm',
    tag: '✨ BAGm Signature Formula',
    headline: 'Rich Peptides & Baobab Oil For Radiant Skin Barrier',
    subtitle:
      'Formulated specifically for melanin-rich skin in West African heat. Non-greasy satin finish with 48H deep hydration and peptide cellular repair.',
    price: 340.0,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
    rating: 5.0,
    reviewsCount: 38,
    badges: ['💧 48H Hydration Lock', '🌿 Ghanaian Baobab Seed Oil', '🛡️ Multi-Peptides'],
    config3D: {
      id: 'jar-peptide',
      name: 'Silk Barrier Peptide Cream',
      brand: 'BAGm Signature',
      type: 'jar',
      glassColor: 0xfff0f3,
      liquidColor: 0xfffcf5,
      capColor: 0xd4af37,
      labelBg: 0xffffff,
      labelTitle: 'SILK BARRIER',
      labelSubtitle: 'Peptide & Baobab Cream',
      accentGold: true,
    },
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
      'Maximum UVA/UVB broad spectrum defense with Mexoryl 400. Sweat & tropical humidity resistant with a transparent radiant finish.',
    price: 320.0,
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviewsCount: 52,
    badges: ['🛡️ SPF 50+ Broad Spectrum', '✨ 100% Clear On Dark Skin', '⚡ Ultra-Light Fluid'],
    config3D: {
      id: 'flask-anthelios',
      name: 'Anthelios Invisible Fluid',
      brand: 'La Roche-Posay',
      type: 'flask',
      glassColor: 0xffeedd,
      liquidColor: 0xffffff,
      capColor: 0xe67e22,
      labelBg: 0xffffff,
      labelTitle: 'ANTHELIOS 400',
      labelSubtitle: 'Invisible Fluid SPF 50+',
      accentGold: false,
    },
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
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800',
    rating: 5.0,
    reviewsCount: 29,
    badges: ['🌰 100% Pure Raw Shea', '👑 Long-Lasting Warm Oud', '✨ Velvety Glow Soufflé'],
    config3D: {
      id: 'jar-kaeme',
      name: 'Eternal Oud Shea Soufflé',
      brand: 'Kaeme Ghana',
      type: 'jar',
      glassColor: 0xfdfbf7,
      liquidColor: 0xfbf1dd,
      capColor: 0x8c6b26,
      labelBg: 0xffffff,
      labelTitle: 'ETERNAL OUD',
      labelSubtitle: 'Whipped Shea Soufflé',
      accentGold: true,
    },
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
    image: 'https://images.unsplash.com/photo-1608248597359-216259021419?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    reviewsCount: 64,
    badges: ['💧 10% High-Purity Niacinamide', '✨ Fades Dark Spots', '⚡ Oil Balance'],
    config3D: {
      id: 'dropper-niacinamide',
      name: 'Niacinamide 10% + Zinc 1%',
      brand: 'The Ordinary',
      type: 'dropper',
      glassColor: 0xffffff,
      liquidColor: 0xf8f9fa,
      capColor: 0xd4af37,
      labelBg: 0xffffff,
      labelTitle: 'NIACINAMIDE 10%',
      labelSubtitle: 'Zinc 1% Blemish Active',
      accentGold: true,
    },
  },
];

export function HeroBanner({ settings }: { settings: StoreSettings }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const { addItem } = useCart();
  const { showToast } = useToast();

  const current = HERO_PRODUCTS[selectedIndex];

  const handleQuickAdd = () => {
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

    setAddedSuccess(true);
    showToast({
      title: 'Added to Shopping Bag!',
      message: `${current.name} (${formatGHS(current.price)})`,
      image: current.image,
      type: 'cart',
    });

    setTimeout(() => setAddedSuccess(false), 2000);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blush via-blush-light to-white pt-8 pb-14 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24 border-b border-brand-100/60">
      {/* Ambient background decorative light halos */}
      <div className="absolute top-1/4 -left-28 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-gold-200/30 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline, Description & Actions */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left z-10">
            {/* Tag Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-brand-200 text-brand-800 text-xs font-bold tracking-wide shadow-xs backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                <span>{current.tag}</span>
              </span>

              {current.origin === 'Ghanaian' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <span>Ghanaian Artisan 🇬🇭</span>
                </span>
              )}

              {current.origin === 'BAGm' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-900 text-xs font-bold">
                  <span>Signature Formula</span>
                </span>
              )}
            </div>

            {/* Dynamic Headline */}
            <h1
              key={`h1-${current.id}`}
              className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal-900 leading-[1.12] animate-fade-in"
            >
              {current.headline}
            </h1>

            {/* Subtitle */}
            <p
              key={`p-${current.id}`}
              className="text-sm sm:text-base lg:text-lg text-charcoal-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed animate-fade-in"
            >
              {current.subtitle}
            </p>

            {/* Key Benefits Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              {current.badges.map((b) => (
                <span
                  key={b}
                  className="px-3 py-1 rounded-lg bg-brand-50/80 border border-brand-100 text-charcoal-700 text-xs font-medium backdrop-blur-xs"
                >
                  {b}
                </span>
              ))}
            </div>

            {/* Actions: Quick Add & Explore */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
              <button
                onClick={handleQuickAdd}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-98 ${
                  addedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-600 hover:bg-brand-700 text-white shadow-luxury hover:shadow-luxury-hover'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Quick Add • {formatGHS(current.price)}</span>
                  </>
                )}
              </button>

              <Link
                href={`/product/${current.slug}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-brand-200 bg-white/95 hover:bg-brand-50 text-brand-900 font-semibold text-sm transition-all shadow-xs"
              >
                <span>View Full Details</span>
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
                <span>Routine Guidance</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Product Interactive Canvas */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md sm:max-w-lg lg:max-w-none">
              {/* 3D Canvas Box */}
              <div className="relative rounded-3xl overflow-hidden shadow-luxury-hover border-4 border-white bg-gradient-to-b from-white via-blush-light to-brand-50/50 aspect-square sm:aspect-[4/3] lg:aspect-[4/3] flex items-center justify-center group">
                <Product3DViewer
                  product={current.config3D}
                  className="w-full h-full"
                />

                {/* Rating Badge Top Left */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-brand-100 text-xs font-bold text-charcoal-900">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span>{current.rating.toFixed(1)}</span>
                  <span className="text-[10px] text-charcoal-400">({current.reviewsCount} verified reviews)</span>
                </div>
              </div>

              {/* 3D Product Switcher Pills */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {HERO_PRODUCTS.map((prod, idx) => {
                  const isSel = selectedIndex === idx;
                  return (
                    <button
                      key={prod.id}
                      onClick={() => setSelectedIndex(idx)}
                      className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                        isSel
                          ? 'bg-white border-brand-500 shadow-md ring-2 ring-brand-200/60'
                          : 'bg-white/70 hover:bg-white border-brand-100 hover:border-brand-200'
                      }`}
                    >
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-9 h-9 rounded-xl object-cover shrink-0 border border-gray-100"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider block truncate">
                          {prod.brand}
                        </span>
                        <p className="text-[11px] font-bold text-charcoal-900 truncate">
                          {prod.config3D.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
