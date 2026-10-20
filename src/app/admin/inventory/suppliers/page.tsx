'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Supplier } from '@/types';
import { formatDate } from '@/lib/utils';
import { Building, Plus, ArrowLeft, Mail, Phone, MapPin, X } from 'lucide-react';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/inventory/suppliers');
      const data = await res.json();
      if (data?.suppliers) setSuppliers(data.suppliers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/inventory/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact_person: contactPerson, email, phone, address, notes }),
      });
      if (res.ok) {
        setModalOpen(false);
        setName('');
        setContactPerson('');
        setEmail('');
        setPhone('');
        setAddress('');
        setNotes('');
        loadSuppliers();
      }
    } catch {
      alert('Failed to save supplier');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/inventory"
            className="p-2.5 bg-white hover:bg-rose-50 text-charcoal-700 border border-rose-200/90 rounded-xl transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                Supply Chain
              </span>
            </div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900">Suppliers &amp; Manufacturers</h1>
            <p className="text-xs text-charcoal-500 mt-1">
              Manage local Ghanaian beauty artisans and international product suppliers.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-soft transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suppliers.map((s) => (
          <div key={s.id} className="bg-white p-6 rounded-2xl border border-rose-200/80 shadow-card space-y-3 text-xs hover:border-brand-300 transition-colors">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-base text-charcoal-900">{s.name}</h3>
            </div>
            {s.contact_person && <p className="text-charcoal-700">Contact: {s.contact_person}</p>}
            {s.email && (
              <p className="text-charcoal-600 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-charcoal-400" />
                <span>{s.email}</span>
              </p>
            )}
            {s.phone && (
              <p className="text-charcoal-600 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-charcoal-400" />
                <span>{s.phone}</span>
              </p>
            )}
            {s.address && (
              <p className="text-charcoal-600 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-charcoal-400" />
                <span>{s.address}</span>
              </p>
            )}
            {s.notes && <p className="text-[11px] text-charcoal-500 pt-2 border-t border-rose-100">{s.notes}</p>}
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-rose-200 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-charcoal-900">Add New Supplier</h3>
              <button onClick={() => setModalOpen(false)} className="text-charcoal-400 hover:text-charcoal-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div>
                <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1">Company / Supplier Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nokware Skincare Ghana Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Tutu"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="sales@supplier.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+233 24 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1">Address / Location</label>
                <input
                  type="text"
                  placeholder="Accra, Ghana"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-rose-200 text-charcoal-700 font-semibold hover:bg-rose-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-soft transition-all"
                >
                  {saving ? 'Saving...' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
