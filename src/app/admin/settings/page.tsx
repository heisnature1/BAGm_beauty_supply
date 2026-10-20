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
    moolre_enabled: 'true',
    moolre_environment: 'sandbox',
    moolre_account_number: 'MOOLRE-GH-BAGM-01',
    moolre_public_key: 'moolre_pk_sandbox_bagm_beauty_2026',
    moolre_secret_key: 'moolre_sk_sandbox_bagm_beauty_2026',
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
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
              System Preferences
            </span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900">Store Configuration &amp; Logistics</h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Configure Ghana delivery rates, bank transfer instructions, and inventory thresholds.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Store configuration settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Delivery & Logistics Rates */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200/80 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-rose-100">
            <Truck className="w-4 h-4 text-brand-600" />
            <h3 className="font-serif font-bold text-base text-charcoal-900">Ghana Delivery Rates &amp; Free Threshold</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1.5">
                Complimentary Delivery Threshold (GH₵)
              </label>
              <input
                type="number"
                value={settings.free_delivery_threshold}
                onChange={(e) => handleChange('free_delivery_threshold', e.target.value)}
                className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 font-serif font-bold focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
              />
              <p className="text-[10px] text-charcoal-500 mt-1">Free delivery automatically applied above this cart subtotal.</p>
            </div>

            <div>
              <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1.5">
                Default Accra Central / East Legon Rate (GH₵)
              </label>
              <input
                type="number"
                value={settings.fee_accra_central}
                onChange={(e) => handleChange('fee_accra_central', e.target.value)}
                className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 font-serif font-bold focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1.5">
                Outer Greater Accra Rate (GH₵)
              </label>
              <input
                type="number"
                value={settings.fee_accra_outer}
                onChange={(e) => handleChange('fee_accra_outer', e.target.value)}
                className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 font-serif font-bold focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1.5">
                Nationwide Intercity VIP Parcel Rate (GH₵)
              </label>
              <input
                type="number"
                value={settings.fee_nationwide}
                onChange={(e) => handleChange('fee_nationwide', e.target.value)}
                className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 font-serif font-bold focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Inventory & Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200/80 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-rose-100">
            <Bell className="w-4 h-4 text-amber-600" />
            <h3 className="font-serif font-bold text-base text-charcoal-900">Stock Warnings &amp; Notification Emails</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1.5">
                Default Low Stock Trigger (Units)
              </label>
              <input
                type="number"
                value={settings.low_stock_threshold}
                onChange={(e) => handleChange('low_stock_threshold', e.target.value)}
                className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 font-serif font-bold focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1.5">
                Administrator Alert Recipient
              </label>
              <input
                type="email"
                value={settings.admin_notification_email}
                onChange={(e) => handleChange('admin_notification_email', e.target.value)}
                className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 font-mono focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Moolre Payment Gateway Configuration */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-rose-100">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-600" />
              <h3 className="font-serif font-bold text-base text-charcoal-900">Moolre Payment Gateway (Ghana)</h3>
            </div>
            <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              https://sandbox.moolre.com
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100 text-[11px] text-charcoal-600 leading-relaxed">
              Moolre handles real-time Mobile Money (MTN MoMo, Telecel Cash, AT Money), Visa &amp; Mastercard, and Ghana GhIPSS instant bank transfers.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1.5">
                  Gateway Environment
                </label>
                <select
                  value={settings.moolre_environment}
                  onChange={(e) => handleChange('moolre_environment', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 font-semibold focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                >
                  <option value="sandbox">Sandbox (https://sandbox.moolre.com)</option>
                  <option value="production">Production Live (https://api.moolre.com)</option>
                </select>
              </div>

              <div>
                <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1.5">
                  Moolre Merchant / Account Number
                </label>
                <input
                  type="text"
                  value={settings.moolre_account_number}
                  onChange={(e) => handleChange('moolre_account_number', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 font-mono focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                  placeholder="MOOLRE-GH-BAGM-01"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1.5">
                  Moolre Secret Key (sk_...)
                </label>
                <input
                  type="password"
                  value={settings.moolre_secret_key}
                  onChange={(e) => handleChange('moolre_secret_key', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 font-mono focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                  placeholder="moolre_sk_sandbox_..."
                />
              </div>

              <div>
                <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1.5">
                  Moolre Public Key (pk_...)
                </label>
                <input
                  type="text"
                  value={settings.moolre_public_key}
                  onChange={(e) => handleChange('moolre_public_key', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 font-mono focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                  placeholder="moolre_pk_sandbox_..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Configuration */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200/80 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-rose-100">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <h3 className="font-serif font-bold text-base text-charcoal-900">Offline Payment Instructions (Bank &amp; MoMo)</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer p-3 bg-rose-50/50 rounded-xl border border-rose-200">
              <input
                type="checkbox"
                checked={settings.cod_enabled === 'true'}
                onChange={(e) => handleChange('cod_enabled', e.target.checked ? 'true' : 'false')}
                className="rounded text-brand-600"
              />
              <span className="text-charcoal-900 font-semibold">Enable Cash on Delivery (COD) for Greater Accra</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1.5">Bank Name</label>
                <input
                  type="text"
                  value={settings.bank_name}
                  onChange={(e) => handleChange('bank_name', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1.5">Account Name</label>
                <input
                  type="text"
                  value={settings.bank_account_name}
                  onChange={(e) => handleChange('bank_account_name', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1.5">Account Number</label>
                <input
                  type="text"
                  value={settings.bank_account_number}
                  onChange={(e) => handleChange('bank_account_number', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 font-mono focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1.5">Bank Branch</label>
                <input
                  type="text"
                  value={settings.bank_branch}
                  onChange={(e) => handleChange('bank_branch', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1.5">MTN / Telecel MoMo Number</label>
                <input
                  type="text"
                  value={settings.momo_number}
                  onChange={(e) => handleChange('momo_number', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 font-mono focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1.5">MoMo Merchant Account Name</label>
                <input
                  type="text"
                  value={settings.momo_account_name}
                  onChange={(e) => handleChange('momo_account_name', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-soft transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Settings...' : 'Save Configuration Changes'}</span>
        </button>
      </form>
    </div>
  );
}
