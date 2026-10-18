'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: 'Orders & Payments',
      q: 'What payment methods are supported on BAGm Beauty Supply?',
      a: 'We accept Mobile Money (MTN MoMo, Telecel Cash, AT Money) and credit/debit bank cards (Visa, Mastercard) via our secure Paystack integration. We also accept direct bank transfers to our Ghana Commercial Bank (GCB) account and Cash on Delivery (COD) for eligible Greater Accra delivery locations.',
    },
    {
      category: 'Orders & Payments',
      q: 'Are pending payments considered completed orders?',
      a: 'No. Pending payments or manual transfers remain in an "Awaiting Payment" status until successfully verified by our system or confirmed by our store administrator. Only verified orders are processed for packaging and dispatch.',
    },
    {
      category: 'Product Authenticity',
      q: 'Are your international and Ghanaian skincare products 100% genuine?',
      a: 'Absolutely. We source all international brands (such as CeraVe, The Ordinary, La Roche-Posay, COSRX, Fenty Skin, and Paula’s Choice) directly from authorized global laboratories and distributors. Our Ghanaian lines (Nokware, Kaeme, Skin Gourmet) and BAGm Signature products come directly from certified local producers.',
    },
    {
      category: 'Delivery & Collection',
      q: 'How long does delivery take across Greater Accra and nationwide?',
      a: 'Greater Accra Central deliveries typically arrive same-day or within 24 hours. Greater Accra Outskirts take 24–48 hours. Regional deliveries (Kumasi, Takoradi, Cape Coast, Koforidua, Tamale, etc.) are dispatched via express courier and take 2–4 business days.',
    },
    {
      category: 'Delivery & Collection',
      q: 'Can I pick up my order in person instead of paying for delivery?',
      a: 'Yes! You can choose Store Pickup at checkout for free collection from our flagship hub located at Plot 42 Lagos Avenue, East Legon, Accra. You will receive an email as soon as your package is prepared.',
    },
    {
      category: 'Returns & Refunds',
      q: 'What is BAGm Beauty Supply’s return and refund policy?',
      a: 'We offer a 7-day return policy for eligible unopened items in original packaging, or products damaged during transit. Due to strict hygiene standards, opened cosmetic items cannot be returned unless verified to be defective.',
    },
    {
      category: 'Skincare Consultation',
      q: 'Does the Skincare Routine Finder guarantee medical results?',
      a: 'Our Routine Finder offers personalized beauty and cosmetic guidance based on actual formulation profiles and active ingredients. It does not diagnose or treat medical skin conditions. We encourage customers with severe dermatological conditions to consult a licensed medical dermatologist.',
    },
  ];

  return (
    <div className="min-h-screen bg-blush-light flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold">
              <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
              <span>Help &amp; Guidance</span>
            </div>
            <h1 className="font-serif font-bold text-3xl sm:text-5xl text-charcoal-900">
              Frequently Asked Questions
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500">
              Find instant answers to questions regarding ordering, Ghanaian payments, delivery timelines, and skincare consultation.
            </p>
          </div>

          {/* Accordion FAQ List */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-100 shadow-card divide-y divide-gray-100">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="py-4 first:pt-0 last:pb-0">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left py-2 font-serif font-bold text-base sm:text-lg text-charcoal-900 hover:text-brand-700 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-charcoal-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-brand-600' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="pt-2 pb-3 text-xs sm:text-sm text-charcoal-600 leading-relaxed animate-fade-in">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Still Have Questions CTA */}
          <div className="text-center bg-brand-50/70 rounded-3xl p-8 border border-brand-200 space-y-3">
            <h3 className="font-serif font-bold text-xl text-charcoal-900">Still have questions?</h3>
            <p className="text-xs sm:text-sm text-charcoal-600 max-w-md mx-auto">
              Our Accra customer support team is available Monday through Saturday to assist you with order enquiries or product guidance.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-block px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Contact Customer Support
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
