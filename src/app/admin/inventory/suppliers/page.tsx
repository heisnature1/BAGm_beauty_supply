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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/inventory"
            className="p-2 bg-charcoal-800 hover:bg-charcoal-700 text-white rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif font-bold text-2xl text-white">Suppliers &amp; Manufacturers</h1>
            <p className="text-xs text-charcoal-400">
              Manage local Ghanaian beauty artisans and international product suppliers.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suppliers.map((s) => (
          <div key={s.id} className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-brand-400" />
              <h3 className="font-bold text-base text-white">{s.name}</h3>
            </div>
            {s.contact_person && <p className="text-charcoal-300">Contact: {s.contact_person}</p>}
            {s.email && (
              <p className="text-charcoal-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-charcoal-500" />
                <span>{s.email}</span>
              </p>
            )}
            {s.phone && (
              <p className="text-charcoal-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-charcoal-500" />
                <span>{s.phone}</span>
              </p>
            )}
            {s.address && (
              <p className="text-charcoal-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-charcoal-500" />
                <span>{s.address}</span>
              </p>
            )}
            {s.notes && <p className="text-[11px] text-charcoal-500 pt-2 border-t border-charcoal-800">{s.notes}</p>}
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-white">Add New Supplier</h3>
              <button onClick={() => setModalOpen(false)} className="text-charcoal-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">Company / Supplier Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nokware Skincare Ghana Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Thutu"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold uppercase text-charcoal-400 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="sales@supplier.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-charcoal-400 block mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+233 24 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">Address / Location</label>
                <input
                  type="text"
                  placeholder="Accra, Ghana"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-charcoal-700 text-charcoal-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold"
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
