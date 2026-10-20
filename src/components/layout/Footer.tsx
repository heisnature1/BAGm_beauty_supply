'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, Truck, Sun, CreditCard } from 'lucide-react';
import { Logo } from '@/components/common/Logo';

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const [storeInfo, setStoreInfo] = useState({
    address: 'Plot 42 Lagos Avenue, East Legon, Accra, Ghana',
    phone: '+233 24 123 4567 / +233 55 987 6543',
    email: 'support@bagmbeauty.com',
    hours: 'Monday – Saturday: 9:00 AM – 7:00 PM GMT',
  });

  useEffect(() => {
    fetch('/api/settings/announcement')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setStoreInfo((prev) => ({
            address: data.store_address || prev.address,
            phone: data.store_phone || prev.phone,
            email: data.store_email || prev.email,
            hours: data.store_hours || prev.hours,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !consentChecked) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail, consent: consentChecked }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Thank you for subscribing to BAGm Beauty updates!');
        setNewsletterEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Subscription failed. Please check your email.');
      }
    } catch {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <footer className="bg-gradient-to-b from-[#FFF5F8] via-[#FAF6F3] to-[#F5ECEE] text-charcoal-800 border-t border-brand-200/80">
      {/* Top Value Proposition Bar (Clean, Luxury, Everything Beauty Ghana Style) */}
      <div className="border-b border-brand-200/70 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Value 1 */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-brand-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0 border border-brand-200/60 shadow-2xs">
                <ShieldCheck className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h4 className="text-charcoal-900 font-serif font-bold text-base">100% Authentic Beauty</h4>
                <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                  Directly sourced from authorized global laboratories and certified Ghanaian botanical artisans. Zero fakes.
                </p>
              </div>
            </div>

            {/* Value 2 */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-brand-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/60 shadow-2xs">
                <Truck className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h4 className="text-charcoal-900 font-serif font-bold text-base">Fast Ghana Delivery</h4>
                <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                  Same-day express delivery across Greater Accra, nationwide courier across all regions, and East Legon pickup.
                </p>
              </div>
            </div>

            {/* Value 3 */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-brand-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200/60 shadow-2xs">
                <Sun className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h4 className="text-charcoal-900 font-serif font-bold text-base">Melanin-Tested Formulas</h4>
                <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                  Zero white cast sunscreens, lightweight non-greasy textures, and proven actives suited for tropical heat.
                </p>
              </div>
            </div>

            {/* Value 4 */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-brand-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60 shadow-2xs">
                <CreditCard className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-charcoal-900 font-serif font-bold text-base">Secure MoMo &amp; Cards</h4>
                <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                  Instant MTN Mobile Money, Telecel Cash, AT Money, Visa, Mastercard, and Cash on Delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="footer" size="lg" />
            <p className="text-xs sm:text-sm text-charcoal-600 max-w-sm leading-relaxed">
              BAGm Beauty Supply is Ghana’s premier luxury beauty and skincare destination, offering verified international clinical formulations, handcrafted Ghanaian botanicals, and personalized beauty guidance.
            </p>

            <div className="space-y-2.5 text-xs text-charcoal-600 pt-2">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                <span>{storeInfo.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-600 shrink-0" />
                <span>{storeInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-600 shrink-0" />
                <span>{storeInfo.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-brand-600 shrink-0" />
                <span>{storeInfo.hours}</span>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h5 className="font-serif font-bold text-charcoal-900 text-sm tracking-wider uppercase mb-4 border-b border-brand-200 pb-1.5 inline-block">
              Shop Categories
            </h5>
            <ul className="space-y-2.5 text-xs sm:text-sm text-charcoal-600">
              <li>
                <Link href="/categories/skincare" className="hover:text-brand-700 hover:translate-x-0.5 inline-block transition-all">
                  Skincare Essentials
                </Link>
              </li>
              <li>
                <Link href="/categories/facial-care" className="hover:text-brand-700 hover:translate-x-0.5 inline-block transition-all">
                  Facial Cleansers &amp; Toners
                </Link>
              </li>
              <li>
                <Link href="/categories/serums-and-treatments" className="hover:text-brand-700 hover:translate-x-0.5 inline-block transition-all">
                  Serums &amp; Treatments
                </Link>
              </li>
              <li>
                <Link href="/categories/sun-protection" className="hover:text-brand-700 hover:translate-x-0.5 inline-block transition-all">
                  Invisible Sunscreens (SPF 50+)
                </Link>
              </li>
              <li>
                <Link href="/categories/body-care" className="hover:text-brand-700 hover:translate-x-0.5 inline-block transition-all">
                  Body Care &amp; Shea Soufflés
                </Link>
              </li>
              <li>
                <Link href="/categories/body-splashes-and-sprays" className="hover:text-brand-700 hover:translate-x-0.5 inline-block transition-all">
                  Body Splashes &amp; Mists
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-brand-700 hover:translate-x-0.5 inline-block transition-all font-semibold text-brand-700">
                  Shop All Products →
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div>
            <h5 className="font-serif font-bold text-charcoal-900 text-sm tracking-wider uppercase mb-4 border-b border-brand-200 pb-1.5 inline-block">
              Customer Care
            </h5>
            <ul className="space-y-2.5 text-xs sm:text-sm text-charcoal-600">
              <li>
                <Link href="/routine-finder" className="hover:text-brand-700 font-bold text-brand-700 inline-flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                  <span>Routine Finder Quiz</span>
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-brand-700 hover:translate-x-0.5 inline-block transition-all">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/policy/delivery" className="hover:text-brand-700 hover:translate-x-0.5 inline-block transition-all">
                  Delivery &amp; Pickup Policy
                </Link>
              </li>
              <li>
                <Link href="/policy/returns" className="hover:text-brand-700 hover:translate-x-0.5 inline-block transition-all">
                  Returns &amp; Refunds Policy
                </Link>
              </li>
              <li>
                <Link href="/policy/privacy" className="hover:text-brand-700 hover:translate-x-0.5 inline-block transition-all">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policy/terms" className="hover:text-brand-700 hover:translate-x-0.5 inline-block transition-all">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-brand-700 hover:translate-x-0.5 inline-block transition-all">
                  FAQs &amp; Help
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-700 hover:translate-x-0.5 inline-block transition-all">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-4">
            <h5 className="font-serif font-bold text-charcoal-900 text-sm tracking-wider uppercase mb-4 border-b border-brand-200 pb-1.5 inline-block">
              BAGm VIP Club
            </h5>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Subscribe for expert melanin skincare tips, new product launches, and exclusive Ghanaian beauty guides.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="flex rounded-xl overflow-hidden border border-brand-200 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 shadow-2xs">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-transparent text-xs text-charcoal-900 px-3.5 py-3 w-full focus:outline-none placeholder-charcoal-400 font-medium"
                />
                <button
                  type="submit"
                  disabled={status === 'loading' || !consentChecked}
                  className="bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white px-4 transition-colors flex items-center justify-center font-bold text-xs shrink-0"
                  aria-label="Subscribe to newsletter"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5 rounded border-brand-300 text-brand-600 focus:ring-0 bg-white text-xs"
                />
                <span className="text-[11px] text-charcoal-500 leading-tight">
                  I agree to receive skincare advice and product alerts from BAGm Beauty Supply.
                </span>
              </label>

              {status === 'success' && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{message}</span>
                </div>
              )}

              {status === 'error' && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs animate-fade-in">
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Payment Methods & Copyright */}
        <div className="mt-12 pt-8 border-t border-brand-200/80 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-charcoal-500">
          <p>© {new Date().getFullYear()} BAGm Beauty Supply. All rights reserved. Accra, Ghana.</p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="text-[11px] font-semibold text-charcoal-600 mr-1">Accepted in Ghana:</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-brand-200 text-[10px] text-charcoal-800 font-bold shadow-2xs">
              MTN MoMo 🟡
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-brand-200 text-[10px] text-charcoal-800 font-bold shadow-2xs">
              Telecel Cash 🔴
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-brand-200 text-[10px] text-charcoal-800 font-bold shadow-2xs">
              AT Money 🔵
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-brand-200 text-[10px] text-charcoal-800 font-bold shadow-2xs">
              Visa &amp; Mastercard 💳
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-brand-200 text-[10px] text-charcoal-800 font-bold shadow-2xs">
              Paystack ⚡
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-brand-200 text-[10px] text-charcoal-800 font-bold shadow-2xs">
              Cash on Delivery 📦
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
