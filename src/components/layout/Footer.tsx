'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, ArrowRight, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { Logo } from '@/components/common/Logo';

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

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
    <footer className="bg-charcoal-950 text-charcoal-200 border-t border-charcoal-800">
      {/* Top Value Propositions */}
      <div className="border-b border-charcoal-800/80 bg-charcoal-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-4 rounded-xl bg-charcoal-900/40 border border-charcoal-800">
              <div className="w-12 h-12 rounded-full bg-brand-900/60 text-brand-400 flex items-center justify-center shrink-0 border border-brand-800/50">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-serif font-semibold text-base">100% Authentic Beauty</h4>
                <p className="text-xs text-charcoal-400 mt-1 leading-relaxed">
                  Carefully sourced directly from authorized global labs and certified Ghanaian beauty artisans.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-4 rounded-xl bg-charcoal-900/40 border border-charcoal-800">
              <div className="w-12 h-12 rounded-full bg-gold-900/40 text-gold-400 flex items-center justify-center shrink-0 border border-gold-800/50">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-serif font-semibold text-base">Reliable Ghana Fulfilment</h4>
                <p className="text-xs text-charcoal-400 mt-1 leading-relaxed">
                  Express delivery across Greater Accra, nationwide courier across all regions, and pickup in East Legon.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-4 rounded-xl bg-charcoal-900/40 border border-charcoal-800">
              <div className="w-12 h-12 rounded-full bg-brand-900/60 text-brand-400 flex items-center justify-center shrink-0 border border-brand-800/50">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-serif font-semibold text-base">Tailored Routine Guidance</h4>
                <p className="text-xs text-charcoal-400 mt-1 leading-relaxed">
                  Interactive skincare routine questionnaire to discover formulations suited for your skin profile.
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
            <p className="text-xs sm:text-sm text-charcoal-400 max-w-sm leading-relaxed">
              BAGm Beauty Supply is Ghana’s premier beauty destination, offering authentic international skincare, handcrafted Ghanaian botanicals, and personalized beauty solutions.
            </p>

            <div className="space-y-2 text-xs text-charcoal-300 pt-2">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Plot 42 Lagos Avenue, East Legon, Accra, Ghana</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+233 24 123 4567 / +233 55 987 6543</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>support@bagmbeauty.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Mon – Sat: 9:00 AM – 7:00 PM GMT</span>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h5 className="font-serif font-semibold text-white text-sm tracking-wider uppercase mb-4 border-b border-brand-800 pb-1.5 inline-block">
              Categories
            </h5>
            <ul className="space-y-2.5 text-xs sm:text-sm text-charcoal-400">
              <li>
                <Link href="/categories/skincare" className="hover:text-brand-400 transition-colors">
                  Skincare Essentials
                </Link>
              </li>
              <li>
                <Link href="/categories/facial-care" className="hover:text-brand-400 transition-colors">
                  Facial Cleansers & Toners
                </Link>
              </li>
              <li>
                <Link href="/categories/serums-and-treatments" className="hover:text-brand-400 transition-colors">
                  Serums & Treatments
                </Link>
              </li>
              <li>
                <Link href="/categories/sun-protection" className="hover:text-brand-400 transition-colors">
                  Invisible Sunscreens (SPF)
                </Link>
              </li>
              <li>
                <Link href="/categories/body-care" className="hover:text-brand-400 transition-colors">
                  Body Care & Shea Soufflés
                </Link>
              </li>
              <li>
                <Link href="/categories/body-splashes-and-sprays" className="hover:text-brand-400 transition-colors">
                  Body Splashes & Mists
                </Link>
              </li>
              <li>
                <Link href="/categories/makeup" className="hover:text-brand-400 transition-colors">
                  Makeup & Beauty Tools
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div>
            <h5 className="font-serif font-semibold text-white text-sm tracking-wider uppercase mb-4 border-b border-brand-800 pb-1.5 inline-block">
              Customer Care
            </h5>
            <ul className="space-y-2.5 text-xs sm:text-sm text-charcoal-400">
              <li>
                <Link href="/routine-finder" className="hover:text-brand-400 transition-colors text-gold-400">
                  Skincare Routine Finder
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-brand-400 transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/policy/delivery" className="hover:text-brand-400 transition-colors">
                  Delivery & Pickup Policy
                </Link>
              </li>
              <li>
                <Link href="/policy/returns" className="hover:text-brand-400 transition-colors">
                  Returns & Refunds Policy
                </Link>
              </li>
              <li>
                <Link href="/policy/privacy" className="hover:text-brand-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policy/terms" className="hover:text-brand-400 transition-colors">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-brand-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-400 transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-4">
            <h5 className="font-serif font-semibold text-white text-sm tracking-wider uppercase mb-4 border-b border-brand-800 pb-1.5 inline-block">
              Stay Connected
            </h5>
            <p className="text-xs text-charcoal-400 leading-relaxed">
              Subscribe to receive curated skincare rituals, new product arrivals, and beauty education.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-2.5">
              <div className="flex rounded-xl overflow-hidden border border-charcoal-700 bg-charcoal-900 focus-within:border-brand-500">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-transparent text-xs text-white px-3 py-2.5 w-full focus:outline-none placeholder-charcoal-500"
                />
                <button
                  type="submit"
                  disabled={status === 'loading' || !consentChecked}
                  className="bg-brand-700 hover:bg-brand-600 disabled:opacity-40 text-white px-3.5 transition-colors flex items-center justify-center"
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
                  className="mt-0.5 rounded border-charcoal-700 text-brand-600 focus:ring-0 bg-charcoal-900 text-xs"
                />
                <span className="text-[11px] text-charcoal-400 leading-tight">
                  I consent to receive beauty updates and educational articles from BAGm Beauty Supply.
                </span>
              </label>

              {status === 'success' && (
                <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{message}</span>
                </div>
              )}

              {status === 'error' && (
                <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs animate-fade-in">
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Payment Methods & Copyright */}
        <div className="mt-12 pt-8 border-t border-charcoal-800/80 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-charcoal-500">
          <p>© {new Date().getFullYear()} BAGm Beauty Supply. All rights reserved. Accra, Ghana.</p>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] text-charcoal-400">Secure Payments for Ghana:</span>
            <span className="px-2 py-1 rounded bg-charcoal-900 border border-charcoal-800 text-[10px] text-charcoal-300 font-semibold">
              MTN MoMo
            </span>
            <span className="px-2 py-1 rounded bg-charcoal-900 border border-charcoal-800 text-[10px] text-charcoal-300 font-semibold">
              Telecel Cash
            </span>
            <span className="px-2 py-1 rounded bg-charcoal-900 border border-charcoal-800 text-[10px] text-charcoal-300 font-semibold">
              AT Money
            </span>
            <span className="px-2 py-1 rounded bg-charcoal-900 border border-charcoal-800 text-[10px] text-charcoal-300 font-semibold">
              Visa & Mastercard
            </span>
            <span className="px-2 py-1 rounded bg-charcoal-900 border border-charcoal-800 text-[10px] text-charcoal-300 font-semibold">
              Bank Transfer
            </span>
            <span className="px-2 py-1 rounded bg-charcoal-900 border border-charcoal-800 text-[10px] text-charcoal-300 font-semibold">
              Cash on Delivery
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
