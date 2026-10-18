import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import Link from 'next/link';
import { RotateCcw, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ReturnsPolicyPage() {
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
            <span className="text-brand-700 font-semibold">Returns &amp; Refunds Policy</span>
          </nav>

          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-100 shadow-card space-y-6 text-charcoal-700 text-xs sm:text-sm leading-relaxed">
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-charcoal-900 pb-4 border-b border-gray-100">
              Returns &amp; Refunds Policy
            </h1>

            <p><strong>Return Window:</strong> 7 Days from Delivery Date | <strong>Location:</strong> Accra, Ghana</p>

            <h3 className="font-serif font-bold text-lg text-charcoal-900 pt-2 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-brand-600" />
              <span>1. Return Eligibility</span>
            </h3>
            <p>
              We want you to love your beauty rituals. You may request a return within <strong>7 days of delivery</strong> under the following qualifying conditions:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Product was damaged or leaked during transit.</li>
              <li>Incorrect product or size was dispatched.</li>
              <li>Product possesses a verified manufacturing defect.</li>
              <li>Unopened, unused products in original intact protective factory seal and packaging.</li>
            </ul>

            <h3 className="font-serif font-bold text-lg text-charcoal-900 pt-4">2. Hygiene &amp; Non-Returnable Items</h3>
            <p>
              Due to strict health, hygiene, and cosmetic safety standards in Ghana, cosmetic items, skincare creams, and essences that have been opened, unsealed, or sampled cannot be returned for resale or refund unless found to be defective upon opening.
            </p>

            <h3 className="font-serif font-bold text-lg text-charcoal-900 pt-4">3. Return Request Process</h3>
            <p>
              To request a return, navigate to your <strong>Account &rarr; Order Details</strong> page and click <em>Request Return</em>. Describe the issue and provide clear photos if damaged. Our administration team will review and approve collection within 2 business days.
            </p>

            <h3 className="font-serif font-bold text-lg text-charcoal-900 pt-4">4. Refund Issuance</h3>
            <p>
              Approved refunds are credited back to the original payment method (Mobile Money wallet or Bank Card) or issued via bank transfer once returned goods are inspected.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
