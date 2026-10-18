'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Megaphone, Home, MapPin, Sparkles } from 'lucide-react';

export default function AdminContentPage() {
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementActive, setAnnouncementActive] = useState(true);
  const [heroHeadline, setHeroHeadline] = useState('');
  const [heroSubheadline, setHeroSubheadline] = useState('');
  const [heroCtaText, setHeroCtaText] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeHours, setStoreHours] = useState('');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data?.settings) {
        const s = data.settings;
        setAnnouncementText(s.announcement_text || 'Complimentary Delivery in Accra on Orders Above GH₵ 600 • Genuine Beauty Formulations');
        setAnnouncementActive(s.announcement_active !== 'false');
        setHeroHeadline(s.hero_headline || 'Curated Luxury Skincare & Authentic Beauty');
        setHeroSubheadline(s.hero_subheadline || 'Formulated for melanin-rich skin and tropical Ghanaian climates. 100% genuine Ghanaian, International, and signature formulations.');
        setHeroCtaText(s.hero_cta_text || 'Shop Formulations');
        setStoreAddress(s.store_address || 'Lagos Avenue, East Legon, Accra, Ghana');
        setStorePhone(s.store_phone || '+233 24 000 0000');
        setStoreHours(s.store_hours || 'Mon - Sat: 9:00 AM - 7:00 PM | Sun: 12:00 PM - 5:00 PM');
      }
    } catch {}
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            announcement_text: announcementText,
            announcement_active: announcementActive ? 'true' : 'false',
            hero_headline: heroHeadline,
            hero_subheadline: heroSubheadline,
            hero_cta_text: heroCtaText,
            store_address: storeAddress,
            store_phone: storePhone,
            store_hours: storeHours,
          },
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif font-bold text-2xl text-white">Storefront Content &amp; Announcements</h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Update top announcement notices, hero banner copy, and physical hub details.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Storefront content updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Announcement Bar */}
        <div className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-charcoal-800">
            <Megaphone className="w-4 h-4 text-brand-400" />
            <h3 className="font-serif font-bold text-base text-white">Top Announcement Bar</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">
                Announcement Message (Delivery / Consultation Notice)
              </label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="e.g. Complimentary Delivery in Accra on Orders Above GH₵ 600"
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white font-medium"
              />
              <p className="text-[10px] text-charcoal-500 mt-1">
                Note: No discount codes or coupon mentions allowed per store policy.
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={announcementActive}
                onChange={(e) => setAnnouncementActive(e.target.checked)}
                className="rounded text-brand-600"
              />
              <span className="text-white font-semibold">Enable Announcement Bar on Storefront</span>
            </label>
          </div>
        </div>

        {/* Hero Section Copy */}
        <div className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-charcoal-800">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <h3 className="font-serif font-bold text-base text-white">Homepage Hero Banner</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">Hero Main Headline</label>
              <input
                type="text"
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white font-serif font-bold text-base"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">Hero Subheadline / Bio</label>
              <textarea
                rows={3}
                value={heroSubheadline}
                onChange={(e) => setHeroSubheadline(e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white leading-relaxed"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">Hero Button Label</label>
              <input
                type="text"
                value={heroCtaText}
                onChange={(e) => setHeroCtaText(e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white"
              />
            </div>
          </div>
        </div>

        {/* Physical Store & Contact Information */}
        <div className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-charcoal-800">
            <MapPin className="w-4 h-4 text-brand-400" />
            <h3 className="font-serif font-bold text-base text-white">East Legon Store &amp; Operating Hours</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">Store Address</label>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">Opening Hours</label>
                <input
                  type="text"
                  value={storeHours}
                  onChange={(e) => setStoreHours(e.target.value)}
                  className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Content Settings'}</span>
        </button>
      </form>
    </div>
  );
}
