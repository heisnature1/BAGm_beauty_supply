'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Sliders, Shield, Truck, CreditCard, Bell } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    free_delivery_threshold: '600',
    fee_accra_central: '35',
    fee_accra_outer: '55',
    fee_nationwide: '75',
    low_stock_threshold: '5',
    admin_notification_email: 'orders@bagmbeauty.com',
    cod_enabled: 'true',
    bank_name: 'Standard Chartered Ghana',
    bank_account_name: 'BAGm Beauty Supply Ltd',
    bank_account_number: '0100123456789',
    bank_branch: 'East Legon Branch',
    momo_number: '+233 24 123 4567',
    momo_account_name: 'BAGm Beauty Supply',
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data?.settings) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
    } catch {}
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
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
          <h1 className="font-serif font-bold text-2xl text-white">Store Configuration &amp; Logistics Settings</h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Configure Ghana delivery rates, bank transfer instructions, and inventory thresholds.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Store configuration settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Delivery & Logistics Rates */}
        <div className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-charcoal-800">
            <Truck className="w-4 h-4 text-brand-400" />
            <h3 className="font-serif font-bold text-base text-white">Ghana Delivery Rates &amp; Free Threshold</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">
                Complimentary Delivery Threshold (GH₵)
              </label>
              <input
                type="number"
                value={settings.free_delivery_threshold}
                onChange={(e) => handleChange('free_delivery_threshold', e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white font-serif font-bold"
              />
              <p className="text-[10px] text-charcoal-500 mt-1">Free delivery automatically applied above this cart subtotal.</p>
            </div>

            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">
                Default Accra Central / East Legon Rate (GH₵)
              </label>
              <input
                type="number"
                value={settings.fee_accra_central}
                onChange={(e) => handleChange('fee_accra_central', e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white font-serif font-bold"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">
                Outer Greater Accra Rate (GH₵)
              </label>
              <input
                type="number"
                value={settings.fee_accra_outer}
                onChange={(e) => handleChange('fee_accra_outer', e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white font-serif font-bold"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">
                Nationwide Intercity VIP Parcel Rate (GH₵)
              </label>
              <input
                type="number"
                value={settings.fee_nationwide}
                onChange={(e) => handleChange('fee_nationwide', e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white font-serif font-bold"
              />
            </div>
          </div>
        </div>

        {/* Inventory & Alerts */}
        <div className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-charcoal-800">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="font-serif font-bold text-base text-white">Stock Warnings &amp; Notification Emails</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">
                Default Low Stock Trigger (Units)
              </label>
              <input
                type="number"
                value={settings.low_stock_threshold}
                onChange={(e) => handleChange('low_stock_threshold', e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white font-serif font-bold"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-charcoal-400 block mb-1">
                Administrator Alert Recipient
              </label>
              <input
                type="email"
                value={settings.admin_notification_email}
                onChange={(e) => handleChange('admin_notification_email', e.target.value)}
                className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Payment Configuration */}
        <div className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-charcoal-800">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <h3 className="font-serif font-bold text-base text-white">Offline Payment Instructions (Bank &amp; MoMo)</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer pb-2 border-b border-charcoal-800">
              <input
                type="checkbox"
                checked={settings.cod_enabled === 'true'}
                onChange={(e) => handleChange('cod_enabled', e.target.checked ? 'true' : 'false')}
                className="rounded text-brand-600"
              />
              <span className="text-white font-semibold">Enable Cash on Delivery (COD) for Greater Accra</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={settings.bank_name}
                  onChange={(e) => handleChange('bank_name', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">Account Name</label>
                <input
                  type="text"
                  value={settings.bank_account_name}
                  onChange={(e) => handleChange('bank_account_name', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">Account Number</label>
                <input
                  type="text"
                  value={settings.bank_account_number}
                  onChange={(e) => handleChange('bank_account_number', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">Bank Branch</label>
                <input
                  type="text"
                  value={settings.bank_branch}
                  onChange={(e) => handleChange('bank_branch', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">MTN / Telecel MoMo Number</label>
                <input
                  type="text"
                  value={settings.momo_number}
                  onChange={(e) => handleChange('momo_number', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">MoMo Merchant Account Name</label>
                <input
                  type="text"
                  value={settings.momo_account_name}
                  onChange={(e) => handleChange('momo_account_name', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white"
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
          <span>{saving ? 'Saving Settings...' : 'Save Configuration Changes'}</span>
        </button>
      </form>
    </div>
  );
}
