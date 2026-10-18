import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Heart, Award, ArrowRight, MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-blush-light flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 py-12 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>Our Story &amp; Philosophy</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal-900 leading-tight">
              Elevating Everyday Beauty into a Luxurious Ritual
            </h1>
            <p className="text-xs sm:text-base text-charcoal-600 leading-relaxed">
              At BAGm Beauty Supply, we believe beauty should feel thoughtful, authentic, and deeply nourishing. Headquartered in Accra, Ghana, we bridge the gap between world-renowned clinical science and ethical West African botanicals.
            </p>
          </div>

          {/* Core Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-8 border border-brand-100 shadow-card space-y-3">
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-charcoal-900">Uncompromising Authenticity</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Every single item in our catalogue is sourced with verified provenance directly from authorized laboratories and artisan workshops.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-brand-100 shadow-card space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-charcoal-900">Championing Ghanaian Botanicals</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                We celebrate rich indigenous ingredients like unrefined Northern shea butter, cold-pressed baobab oil, and botanical floral waters.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-brand-100 shadow-card space-y-3">
              <div className="w-12 h-12 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-charcoal-900">Climate-Minded Curation</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Formulations selected to absorb comfortably in Ghana’s warm tropical climate without heaviness, pore clogging, or white cast.
              </p>
            </div>
          </div>

          {/* Physical Presence & CTA */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-100 shadow-luxury flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">Visit Our Flagship</span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900">
                Experience BAGm in Person in East Legon, Accra
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Plot 42 Lagos Avenue, East Legon, Accra • Open Mon–Sat 9AM–7PM</span>
              </p>
            </div>

            <Link
              href="/shop"
              className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shrink-0 flex items-center gap-2"
            >
              <span>Explore The Store</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
