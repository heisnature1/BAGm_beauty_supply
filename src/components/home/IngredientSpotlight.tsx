'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Droplet, Sun, Flower2, Leaf } from 'lucide-react';
import { useCart } from '../providers/CartProvider';
import { useToast } from '../providers/ToastProvider';
import { formatGHS } from '@/lib/utils';

interface Ingredient {
  id: string;
  name: string;
  subtitle: string;
  origin: string;
  category: string;
  icon: any;
  color: string;
  description: string;
  benefits: string[];
  climateFit: string;
  featuredProduct: {
    id: string;
    sku: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    brandName: string;
  };
}

const INGREDIENTS: Ingredient[] = [
  {
    id: 'shea',
    name: 'Raw Unrefined Shea Butter',
    subtitle: 'Cold-Pressed Vitellaria Paradoxa',
    origin: 'Tamale, Northern Ghana 🇬🇭',
    category: 'Barrier Seal & Deep Moisture',
    icon: Leaf,
    color: 'from-amber-600 to-amber-700',
    description:
      'Harvested sustainably by women cooperatives in Northern Ghana. Rich in stearic and oleic fatty acids, vitamins A, E, and F to seal moisture without clogging pores.',
    benefits: [
      'Seals moisture into deep skin layers',
      'Restores skin elasticity and softness',
      'Calms irritation and sun-stressed skin',
    ],
    climateFit: 'Perfect for dry skin, Harmattan weather, and locking in hydration after baths.',
    featuredProduct: {
      id: 'prod-kaeme-shea-souffle',
      sku: 'KAE-SH-200',
      name: 'Kaeme Eternal Oud Luxury Whipped Shea Soufflé 200g',
      slug: 'kaeme-eternal-oud-luxury-whipped-shea-souffle-200g',
      price: 220.0,
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600',
      brandName: 'Kaeme',
    },
  },
  {
    id: 'peptides',
    name: 'Multi-Peptide Complex',
    subtitle: 'Palmitoyl Tripeptide-1 & Tetrapeptide-7',
    origin: 'Clinical Biotechnology 🔬',
    category: 'Firming & Cellular Repair',
    icon: Sparkles,
    color: 'from-brand-600 to-brand-800',
    description:
      'Signal peptides that communicate with fibroblasts to stimulate collagen synthesis, smoothing skin texture and fortifying weakened lipid barriers.',
    benefits: [
      'Strengthens compromised skin barrier',
      'Smooths fine lines and restores bounce',
      'Non-comedogenic, weightless satin finish',
    ],
    climateFit: 'Feather-light absorption tailored specifically for humid West African weather.',
    featuredProduct: {
      id: 'prod-bagm-peptide-cream',
      sku: 'BAGM-CR-001',
      name: 'BAGm Silk Barrier Peptide Cream 50ml',
      slug: 'bagm-silk-barrier-peptide-cream-50ml',
      price: 340.0,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600',
      brandName: 'BAGm Signature',
    },
  },
  {
    id: 'baobab',
    name: 'Wildcrafted Baobab Seed Oil',
    subtitle: 'Adansonia Digitata Seed Extract',
    origin: 'Savannah Region, Ghana 🇬🇭',
    category: 'Antioxidant & Skin Radiance',
    icon: Droplet,
    color: 'from-gold-500 to-gold-700',
    description:
      'Known as the "Tree of Life", baobab seed oil contains 9 times more vitamin C than oranges, offering potent free-radical protection and natural luminosity.',
    benefits: [
      'Fades dullness and evens complexion',
      'Delivers high-concentration omega fatty acids',
      'Non-greasy, fast-absorbing botanical lipid',
    ],
    climateFit: 'Absorbs instantly without leaving a sticky or heavy residue in heat.',
    featuredProduct: {
      id: 'prod-bagm-radiance-essence',
      sku: 'BAGM-ES-002',
      name: 'BAGm Botanical Radiance Glow Essence 120ml',
      slug: 'bagm-botanical-radiance-glow-essence-120ml',
      price: 280.0,
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600',
      brandName: 'BAGm Signature',
    },
  },
  {
    id: 'niacinamide',
    name: 'Niacinamide 10% + Zinc',
    subtitle: 'High-Purity Vitamin B3 Active',
    origin: 'Dermatological Science 💧',
    category: 'Pore & Hyperpigmentation',
    icon: ShieldCheck,
    color: 'from-blue-600 to-indigo-700',
    description:
      'The gold standard active for melanin skin: inhibits melanosome transfer to visibly fade dark marks, refines enlarged pores, and balances tropical sebum.',
    benefits: [
      'Significantly reduces visible pore size',
      'Fades post-breakout dark marks & spots',
      'Controls excess shine throughout the day',
    ],
    climateFit: 'Essential daily balancing treatment for oily and combination skin in Accra.',
    featuredProduct: {
      id: 'prod-ordinary-niacinamide',
      sku: 'ORD-NC-030',
      name: 'The Ordinary Niacinamide 10% + Zinc 1% 30ml',
      slug: 'the-ordinary-niacinamide-10-zinc-1-30ml',
      price: 180.0,
      image: 'https://images.unsplash.com/photo-1608248597359-216259021419?auto=format&fit=crop&q=80&w=600',
      brandName: 'The Ordinary',
    },
  },
  {
    id: 'mexoryl',
    name: 'Mexoryl 400 UV Filter',
    subtitle: 'Ultra-Long UVA/UVB Spectrum',
    origin: 'Advanced French Lab 🌍',
    category: 'Melanin Sun Protection',
    icon: Sun,
    color: 'from-orange-500 to-amber-600',
    description:
      'Revolutionary photostable UV filter designed to shield against ultra-long UVA rays (up to 400nm) without chalky residue or purple cast on dark skin.',
    benefits: [
      '100% transparent finish on dark skin',
      'Prevents sun-induced dark marks',
      'Ultra-fluid, sweat and water resistant',
    ],
    climateFit: 'Engineered for high UV index and year-round Ghanaian sunshine.',
    featuredProduct: {
      id: 'prod-laroche-anthelios',
      sku: 'LRP-SPF-050',
      name: 'La Roche-Posay Anthelios UVMune 400 SPF 50+',
      slug: 'la-roche-posay-anthelios-uvmune-400-invisible-fluid-spf-50',
      price: 320.0,
      image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=600',
      brandName: 'La Roche-Posay',
    },
  },
];

export function IngredientSpotlight() {
  const [activeId, setActiveId] = useState(INGREDIENTS[0].id);
  const { addItem } = useCart();
  const { showToast } = useToast();

  const current = INGREDIENTS.find((i) => i.id === activeId) || INGREDIENTS[0];

  const handleAddToCart = () => {
    addItem({
      productId: current.featuredProduct.id,
      name: current.featuredProduct.name,
      sku: current.featuredProduct.sku,
      price: current.featuredProduct.price,
      quantity: 1,
      image: current.featuredProduct.image,
      maxStock: 50,
      brandName: current.featuredProduct.brandName,
    });

    showToast({
      title: 'Added to Shopping Bag!',
      message: `${current.featuredProduct.name} (${formatGHS(current.featuredProduct.price)})`,
      image: current.featuredProduct.image,
      type: 'cart',
    });
  };

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white via-blush-light to-white border-y border-brand-100/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span>Formulation Science</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 tracking-tight">
            Pure Actives. Proven Radiance.
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-3 leading-relaxed">
            Every product at BAGm is curated for melanin-rich skin and tropical humidity. Discover the hero ingredients powering our skincare rituals.
          </p>
        </div>

        {/* Ingredient Tab Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar justify-start lg:justify-center">
          {INGREDIENTS.map((item) => {
            const isSelected = activeId === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-xs ${
                  isSelected
                    ? 'bg-brand-700 text-white shadow-luxury scale-102'
                    : 'bg-white hover:bg-brand-50 text-charcoal-700 border border-brand-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-gold-300' : 'text-brand-600'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Detailed Spotlight Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-brand-100 shadow-luxury grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center animate-fade-in">
          {/* Left Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-[11px] font-bold border border-brand-200 uppercase tracking-wide">
                {current.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-charcoal-700 text-[11px] font-semibold">
                Origin: {current.origin}
              </span>
            </div>

            <div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
                {current.name}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-brand-700 mt-0.5">
                {current.subtitle}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              {current.description}
            </p>

            {/* Benefits list */}
            <div className="space-y-2.5 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-800 block">
                Key Skin Benefits:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-charcoal-700">
                {current.benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 bg-blush-light p-2.5 rounded-xl border border-brand-100/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Climate suitability notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-2.5">
              <Sun className="w-4 h-4 text-amber-600 shrink-0" />
              <span><strong>Ghanaian Climate Match:</strong> {current.climateFit}</span>
            </div>
          </div>

          {/* Right Matching Product Card */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-br from-blush via-white to-blush-light rounded-3xl p-6 border border-brand-200 shadow-card flex flex-col items-center text-center space-y-4">
              <span className="text-[10px] font-bold text-brand-700 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-brand-100">
                Formula Powered by {current.name}
              </span>

              <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-md border-2 border-white bg-white">
                <img
                  src={current.featuredProduct.image}
                  alt={current.featuredProduct.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div>
                <span className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">
                  {current.featuredProduct.brandName}
                </span>
                <h4 className="text-sm font-bold text-charcoal-900 mt-0.5 line-clamp-1">
                  {current.featuredProduct.name}
                </h4>
                <p className="text-base font-serif font-bold text-brand-700 mt-1">
                  {formatGHS(current.featuredProduct.price)}
                </p>
              </div>

              <div className="w-full flex items-center gap-2 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <span>Add to Bag</span>
                </button>
                <Link
                  href={`/product/${current.featuredProduct.slug}`}
                  className="py-3 px-4 rounded-xl border border-brand-200 bg-white hover:bg-brand-50 text-brand-900 font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
