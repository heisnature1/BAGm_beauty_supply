'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2, ShieldAlert, Heart, Sun, Droplets, Zap } from 'lucide-react';

const PREVIEW_ROUTINES = [
  {
    id: 'oily',
    label: 'Oily & Blemish-Prone',
    icon: Droplets,
    badge: 'Pore & Sebum Control',
    steps: [
      { step: '1. Cleanse', desc: 'Hydrating Botanical Foam Cleanser' },
      { step: '2. Treat', desc: 'The Ordinary Niacinamide 10% + Zinc' },
      { step: '3. Hydrate', desc: 'Weightless Gel-Cream Moisturizer' },
      { step: '4. Protect', desc: 'Anthelios Invisible SPF 50+ Fluid' },
    ],
  },
  {
    id: 'dry',
    label: 'Dry & Harmattan Dehydrated',
    icon: Sun,
    badge: 'Deep Lipid Nourishment',
    steps: [
      { step: '1. Cleanse', desc: 'CeraVe Hydrating Lotion Cleanser' },
      { step: '2. Essence', desc: 'BAGm Botanical Radiance Essence' },
      { step: '3. Seal', desc: 'Kaeme Luxury Whipped Shea Soufflé' },
      { step: '4. Protect', desc: 'Broad-Spectrum Daily Barrier SPF' },
    ],
  },
  {
    id: 'hyperpigmentation',
    label: 'Melanin Hyperpigmentation',
    icon: Sparkles,
    badge: 'Even Tone & Radiance',
    steps: [
      { step: '1. Cleanse', desc: 'Clarifying African Black Wash' },
      { step: '2. Brighten', desc: 'Vitamin C & Alpha Arbutin Complex' },
      { step: '3. Repair', desc: 'BAGm Silk Barrier Peptide Cream' },
      { step: '4. Shield', desc: 'Mexoryl 400 Zero White Cast SPF 50+' },
    ],
  },
  {
    id: 'sensitive',
    label: 'Sensitive & Damaged Barrier',
    icon: Heart,
    badge: 'Calming & Lipid Restore',
    steps: [
      { step: '1. Cleanse', desc: 'Fragrance-Free Ultra Gentle Wash' },
      { step: '2. Soothe', desc: 'COSRX 96 Snail Mucin Essence' },
      { step: '3. Fortify', desc: 'Multi-Peptide Ceramide Barrier Balm' },
      { step: '4. Defense', desc: 'Mineral Sheer Daily Sunblock' },
    ],
  },
];

export function RoutineFinderTeaser() {
  const [selectedProfile, setSelectedProfile] = useState(PREVIEW_ROUTINES[0]);

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-r from-blush via-blush-light to-brand-50/70 border-y border-brand-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 lg:p-14 border border-brand-200/80 shadow-luxury grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>Interactive Beauty Consultation</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 leading-[1.15] tracking-tight">
              Not Sure Where to Start? <br />
              <span className="text-brand-600">Find Your Perfect Routine.</span>
            </h2>

            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-xl">
              Answer 4 simple questions about your skin type, primary concerns, and routine preferences. Our algorithm analyzes actual product formulations to curate an exact, step-by-step skincare routine tailored to you.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-charcoal-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tailored for Oily, Dry, Sensitive & Melanin skin</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Addresses dark spots, dryness, pores & texture</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Matched against genuine database formulations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ghanaian climate & humidity considerations</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/routine-finder"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-all shadow-md hover:shadow-luxury active:scale-98"
              >
                <span>Take Skincare Quiz (2 mins)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-1.5 text-[11px] text-charcoal-400">
                <ShieldAlert className="w-3.5 h-3.5 text-charcoal-400" />
                <span>Provides general beauty guidance, not medical diagnosis.</span>
              </div>
            </div>
          </div>

          {/* Right Interactive Preview Card */}
          <div className="lg:col-span-5">
            <div className="bg-blush-light rounded-3xl p-6 sm:p-7 border border-brand-200/80 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-brand-100 pb-3">
                <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider">
                  Live Routine Preview
                </span>
                <span className="text-[10px] font-semibold bg-white px-2.5 py-0.5 rounded-full border border-brand-100 text-charcoal-600">
                  {selectedProfile.badge}
                </span>
              </div>

              {/* Profile selector buttons */}
              <div className="grid grid-cols-2 gap-2">
                {PREVIEW_ROUTINES.map((p) => {
                  const isSel = selectedProfile.id === p.id;
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProfile(p)}
                      className={`p-2 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSel
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-white hover:bg-brand-50 text-charcoal-700 border border-brand-100'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSel ? 'text-gold-300' : 'text-brand-600'}`} />
                      <span className="truncate">{p.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Step By Step List */}
              <div className="space-y-2 pt-2">
                {selectedProfile.steps.map((st, i) => (
                  <div key={i} className="bg-white p-3 rounded-xl border border-brand-100 shadow-2xs flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-700">{st.step}</span>
                    <span className="text-xs text-charcoal-800 font-medium truncate max-w-[190px]">{st.desc}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center">
                <Link
                  href="/routine-finder"
                  className="text-xs font-bold text-brand-700 hover:text-brand-900 underline underline-offset-2"
                >
                  Customize this routine for your skin profile &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
