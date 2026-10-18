'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle, ShieldAlert } from 'lucide-react';

export function RoutineFinderTeaser() {
  return (
    <section className="py-16 bg-gradient-to-r from-blush via-blush-light to-brand-50 border-y border-brand-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-200/80 shadow-luxury grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>Interactive Beauty Consultation</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 leading-tight">
              Not Sure Where to Start? <br />
              <span className="text-brand-600">Find Your Perfect Routine.</span>
            </h2>

            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-xl">
              Answer 4 simple questions about your skin type, primary concerns, and routine preferences. Our algorithm analyzes actual product formulations to curate an exact, step-by-step skincare routine tailored to you.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-charcoal-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tailored for Oily, Dry, Sensitive & Combination skin</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Addresses dark spots, dryness, pores & texture</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Matched against genuine database formulations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ghanaian climate & humidity considerations</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/routine-finder"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all shadow-md active:scale-98"
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

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-xl border border-brand-100 aspect-square bg-blush">
              <img
                src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800"
                alt="Skincare Routine Consultation"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[11px] font-bold text-gold-300 uppercase tracking-widest">Personalized Regimen</span>
                <p className="font-serif text-lg font-bold">Cleanser • Essence • Serum • Barrier Cream • SPF</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
