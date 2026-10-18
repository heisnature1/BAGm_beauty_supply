'use client';

import React from 'react';
import { Sparkles, ShieldCheck, Truck, Sun, Heart, MapPin } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: ShieldCheck, text: '100% Verified Authentic Lab Formulations' },
  { icon: Truck, text: 'Same-Day Accra Delivery & Nationwide Ghana Courier' },
  { icon: Sun, text: 'Zero White Cast Invisible Sunscreens for Melanin Skin' },
  { icon: Sparkles, text: 'Handcrafted Ghanaian Botanicals & Clinical Global Science' },
  { icon: MapPin, text: 'Flagship Hub & Order Pickup in East Legon, Accra' },
  { icon: Heart, text: 'Personalized Skincare Routine Finder & Guidance' },
];

export function TrustMarquee() {
  return (
    <div className="bg-gradient-to-r from-blush via-white to-blush text-brand-950 py-3.5 overflow-hidden border-y border-brand-200/80 shadow-2xs relative">
      <div className="flex w-max animate-marquee space-x-12 items-center text-xs font-bold tracking-wider uppercase">
        {/* Repeating twice for seamless infinite loop */}
        {[...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS].map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center gap-2.5 shrink-0 text-charcoal-800">
              <Icon className="w-4 h-4 text-brand-600 shrink-0" />
              <span>{item.text}</span>
              <span className="text-gold-500 font-bold ml-4">✦</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
