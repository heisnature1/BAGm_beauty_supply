import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import Link from 'next/link';

export default function TermsPage() {
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
            <span className="text-brand-700 font-semibold">Terms &amp; Conditions</span>
          </nav>

          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-100 shadow-card space-y-6 text-charcoal-700 text-xs sm:text-sm leading-relaxed">
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-charcoal-900 pb-4 border-b border-gray-100">
              Terms &amp; Conditions
            </h1>

            <p><strong>Effective Date:</strong> October 2026 | <strong>Jurisdiction:</strong> Republic of Ghana</p>

            <h3 className="font-serif font-bold text-lg text-charcoal-900 pt-2">1. Store Operations &amp; Pricing</h3>
            <p>
              All prices displayed on BAGm Beauty Supply are in Ghanaian Cedis (GH₵) and represent the regular selling price. We do not apply unadvertised markups or hidden fees at checkout. Prices are subject to adjustment by the business owner as market conditions dictate.
            </p>

            <h3 className="font-serif font-bold text-lg text-charcoal-900 pt-2">2. Order Acceptance &amp; Payment Verification</h3>
            <p>
              Your placement of an order constitutes an offer to purchase. An order is confirmed and processed for dispatch only once verified payment is confirmed via Mobile Money, Card, or authenticated Bank Transfer.
            </p>

            <h3 className="font-serif font-bold text-lg text-charcoal-900 pt-2">3. Product Descriptions &amp; Ingredients</h3>
            <p>
              We provide accurate ingredient lists and usage instructions supplied directly by brand manufacturers. We do not manufacture false health or medical claims. Products are cosmetic in nature.
            </p>

            <h3 className="font-serif font-bold text-lg text-charcoal-900 pt-2">4. User Accounts &amp; Conduct</h3>
            <p>
              Customers are responsible for safeguarding their account passwords. Any fraudulent or abusive actions, including repeated bad-faith orders, may result in account termination.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
