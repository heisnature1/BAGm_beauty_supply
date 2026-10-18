import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import Link from 'next/link';
import { Truck, Building, Clock, MapPin } from 'lucide-react';

export default function DeliveryPolicyPage() {
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
            <span className="text-brand-700 font-semibold">Delivery &amp; Pickup Policy</span>
          </nav>

          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-100 shadow-card space-y-6 text-charcoal-700 text-xs sm:text-sm leading-relaxed">
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-charcoal-900 pb-4 border-b border-gray-100">
              Delivery &amp; Pickup Policy
            </h1>

            <h3 className="font-serif font-bold text-lg text-charcoal-900 pt-2 flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-600" />
              <span>1. Home &amp; Office Delivery in Ghana</span>
            </h3>
            <p>
              We deliver to residential and commercial addresses across all 16 regions of Ghana. Our delivery fees and timeframes are structured transparently based on zone:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Greater Accra Central (Airport, Osu, Cantonments, Labone):</strong> GH₵ 35.00 • Same-day / 24 hours.</li>
              <li><strong>Greater Accra Outskirts (East Legon, Spintex, Tema, Dansoman, Madina):</strong> GH₵ 45.00 • 24–48 hours.</li>
              <li><strong>Greater Accra Extended (Kasoa, Amasaman, Prampram):</strong> GH₵ 60.00 • 48 hours.</li>
              <li><strong>Ashanti Region (Kumasi Metro, KNUST, Ahodwo):</strong> GH₵ 65.00 • 48–72 hours via express courier.</li>
              <li><strong>Western &amp; Central (Takoradi, Cape Coast):</strong> GH₵ 65.00 • 48–72 hours via express courier.</li>
              <li><strong>Eastern, Volta &amp; Northern Regions:</strong> GH₵ 80.00 • 3–4 business days via regional courier.</li>
            </ul>

            <h3 className="font-serif font-bold text-lg text-charcoal-900 pt-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-brand-600" />
              <span>2. Free Store Pickup (East Legon Flagship)</span>
            </h3>
            <p>
              Customers can choose free pickup at our flagship store located at <strong>Plot 42 Lagos Avenue, East Legon, Accra</strong>.
              Orders are typically ready for collection within 2 to 4 hours of payment confirmation. Please present your Order Confirmation email or SMS upon collection.
            </p>

            <h3 className="font-serif font-bold text-lg text-charcoal-900 pt-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-600" />
              <span>3. Delivery Scheduling &amp; Dispatch Notifications</span>
            </h3>
            <p>
              When your order is dispatched, you will receive an email containing the courier details and tracking reference. Our courier will call your phone prior to arrival.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
