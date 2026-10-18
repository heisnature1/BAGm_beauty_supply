import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-blush-light flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <nav className="flex items-center gap-2 text-xs text-charcoal-400">
            <Link href="/" className="hover:text-brand-700">Home</Link>
            <span>/</span>
            <span className="text-brand-700 font-semibold">Privacy Policy</span>
          </nav>

          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-100 shadow-card space-y-6 text-charcoal-700 text-xs sm:text-sm leading-relaxed">
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-charcoal-900 pb-4 border-b border-gray-100">
              Privacy Policy
            </h1>

            <p><strong>Effective Date:</strong> October 2026 | <strong>Jurisdiction:</strong> Ghana</p>

            <h3 className="font-serif font-bold text-lg text-charcoal-900 pt-2">1. Information We Collect</h3>
            <p>
              BAGm Beauty Supply collects information necessary to process your beauty orders, arrange delivery or pickup, and communicate with you. This includes your name, email address, telephone/Mobile Money number, delivery address (including GhanaPost GPS or landmarks), and purchase history.
            </p>

            <h3 className="font-serif font-bold text-lg text-charcoal-900 pt-2">2. Payment Security</h3>
            <p>
              All card and Mobile Money transactions are processed securely through certified payment gateways (such as Paystack). We do not store raw card numbers, PINs, or CVVs on our servers.
            </p>

            <h3 className="font-serif font-bold text-lg text-charcoal-900 pt-2">3. Use of Personal Data</h3>
            <p>
              Your data is used strictly for fulfilling your orders, coordinating with local dispatch couriers in Ghana, sending transactional receipts and status notifications, and maintaining verified purchase customer review authenticity.
            </p>

            <h3 className="font-serif font-bold text-lg text-charcoal-900 pt-2">4. Marketing &amp; Newsletter Communications</h3>
            <p>
              We only send promotional emails and skincare education to visitors who have explicitly opted in. You may unsubscribe at any time using the one-click unsubscribe link provided in every newsletter.
            </p>

            <h3 className="font-serif font-bold text-lg text-charcoal-900 pt-2">5. Data Retention &amp; Rights</h3>
            <p>
              You may request access to, correction of, or deletion of your personal account information at any time by contacting our support team at <a href="mailto:support@bagmbeauty.com" className="text-brand-700 underline">support@bagmbeauty.com</a>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
