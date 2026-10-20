'use client';

import React, { useState, useEffect } from 'react';
import { formatGHS, formatDate } from '@/lib/utils';
import { Users, Mail, Phone, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/customers')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.customers) setCustomers(data.customers);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
            Customer Relationship Management
          </span>
        </div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900">Registered Customer Directory</h1>
        <p className="text-xs text-charcoal-500 mt-1">
          View registered customer accounts, contact details, and lifetime spending across Ghana.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-rose-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-rose-50/50 text-[11px] uppercase tracking-wider text-charcoal-600 border-b border-rose-100">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Ghana Phone</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100/70 text-charcoal-700">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-charcoal-500">
                    No customers registered yet.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-rose-50/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-rose-100 text-brand-700 font-bold flex items-center justify-center font-serif text-xs border border-rose-200">
                          {c.first_name?.[0] || 'U'}
                        </div>
                        <div>
                          <span className="font-semibold text-charcoal-900 block">{c.first_name} {c.last_name}</span>
                          <span className="text-[10px] text-charcoal-500 capitalize">{c.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-charcoal-600">{c.email}</td>
                    <td className="py-3 px-4 font-mono text-charcoal-600">{c.phone || '—'}</td>
                    <td className="py-3 px-4 font-bold text-charcoal-900">
                      {c.order_count || 0} orders
                    </td>
                    <td className="py-3 px-4 font-serif font-bold text-emerald-700">
                      {formatGHS(c.total_spend || 0)}
                    </td>
                    <td className="py-3 px-4 text-charcoal-500 font-mono text-[11px]">
                      {formatDate(c.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
