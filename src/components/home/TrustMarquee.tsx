'use client';

import React from 'react';
import { Sparkles, ShieldCheck, Truck, Sun, Heart, MapPin, CheckCircle2 } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: ShieldCheck, text: '100% Verified Authentic Lab Formulations' },
  { icon: Truck, text: 'Same-Day Delivery in Greater Accra & Nationwide Courier' },
  { icon: Sun, text: 'Zero White Cast Sun Protection for Melanin Skin' },
  { icon: Sparkles, text: 'Ghanaian Artisanal Botanicals & Global Dermatological Science' },
  { icon: MapPin, text: 'Flagship Hub & Order Pickup at East Legon, Accra' },
  { icon: Heart, text: 'Personalized Tropical Skincare Routine Finder' },
];

export function TrustMarquee() {
  return (
    <div className="bg-charcoal-950 text-white py-3.5 overflow-hidden border-y border-brand-900/50 relative">
      <div className="flex w-max animate-marquee space-x-12 items-center text-xs font-semibold tracking-wider uppercase">
        {/* Repeating twice for seamless infinite loop */}
        {[...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS].map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center gap-2.5 shrink-0 text-charcoal-200">
              <Icon className="w-4 h-4 text-gold-400 shrink-0" />
              <span>{item.text}</span>
              <span className="text-brand-500 font-bold ml-4">•</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
