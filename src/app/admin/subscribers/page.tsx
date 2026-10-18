'use client';

import React, { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import { Mail, Download, Trash2, CheckCircle2 } from 'lucide-react';

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/subscribers');
      const data = await res.json();
      if (data?.subscribers) setSubscribers(data.subscribers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Email,Status,Date Subscribed\n' +
      subscribers.map((s) => `"${s.email}","${s.status}","${s.created_at}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bagm_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif font-bold text-2xl text-white">Newsletter Subscribers</h1>
          <p className="text-xs text-charcoal-400 mt-1">
            VIP beauty journal subscribers receiving periodic product updates.
          </p>
        </div>

        {subscribers.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-brand-400" />
            <span>Export Subscribers CSV</span>
          </button>
        )}
      </div>

      <div className="bg-charcoal-950 rounded-3xl border border-charcoal-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-charcoal-900/60 text-[11px] uppercase tracking-wider text-charcoal-400 border-b border-charcoal-800">
              <tr>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Subscribed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800 text-charcoal-300">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-charcoal-500">
                    No newsletter subscribers registered yet.
                  </td>
                </tr>
              ) : (
                subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-charcoal-900/40">
                    <td className="py-3 px-4 font-mono font-medium text-white">{s.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {s.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-charcoal-400 font-mono text-[11px]">
                      {formatDate(s.created_at)}
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
