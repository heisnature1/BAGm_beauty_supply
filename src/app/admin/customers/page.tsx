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
    <div className="space-y-6">
      <div>
        <h1 className="font-serif font-bold text-2xl text-white">Registered Customer Directory</h1>
        <p className="text-xs text-charcoal-400 mt-1">
          View registered customer accounts, contact details, and lifetime spending.
        </p>
      </div>

      <div className="bg-charcoal-950 rounded-3xl border border-charcoal-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-charcoal-900/60 text-[11px] uppercase tracking-wider text-charcoal-400 border-b border-charcoal-800">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Ghana Phone</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800 text-charcoal-300">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-charcoal-500">
                    No customers registered yet.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-charcoal-900/40">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-900 text-brand-300 font-bold flex items-center justify-center font-serif">
                          {c.first_name[0]}
                        </div>
                        <div>
                          <span className="font-semibold text-white block">{c.first_name} {c.last_name}</span>
                          <span className="text-[10px] text-charcoal-500 capitalize">{c.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-charcoal-300">{c.email}</td>
                    <td className="py-3 px-4 font-mono text-charcoal-300">{c.phone || '—'}</td>
                    <td className="py-3 px-4 font-bold text-white">
                      {c.order_count || 0} orders
                    </td>
                    <td className="py-3 px-4 font-serif font-bold text-emerald-400">
                      {formatGHS(c.total_spend || 0)}
                    </td>
                    <td className="py-3 px-4 text-charcoal-400 font-mono text-[11px]">
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
