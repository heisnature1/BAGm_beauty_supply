'use client';

import React, { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import { MessageSquare, Mail, Phone, CheckCircle, Clock } from 'lucide-react';

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/enquiries');
      const data = await res.json();
      if (data?.enquiries) setEnquiries(data.enquiries);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/enquiries', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif font-bold text-2xl text-white">Customer Inquiries &amp; Consultations</h1>
        <p className="text-xs text-charcoal-400 mt-1">
          Review messages, skincare questions, and assistance requests from customers.
        </p>
      </div>

      <div className="space-y-4">
        {enquiries.length === 0 ? (
          <div className="bg-charcoal-950 p-12 text-center rounded-3xl border border-charcoal-800 text-charcoal-500 text-xs">
            No customer inquiries received yet.
          </div>
        ) : (
          enquiries.map((enq) => (
            <div
              key={enq.id}
              className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-charcoal-800">
                <div>
                  <h3 className="font-serif font-bold text-base text-white">{enq.subject}</h3>
                  <p className="text-xs text-charcoal-400">
                    From <strong className="text-white">{enq.name}</strong> •{' '}
                    <a href={`mailto:${enq.email}`} className="text-brand-400 underline">
                      {enq.email}
                    </a>{' '}
                    {enq.phone && `• ${enq.phone}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-charcoal-500 font-mono">{formatDate(enq.created_at)}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      enq.status === 'replied'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {enq.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-charcoal-300 leading-relaxed whitespace-pre-wrap">{enq.message}</p>

              <div className="pt-2 flex items-center justify-end gap-2 text-xs">
                {enq.status !== 'replied' && (
                  <button
                    onClick={() => handleUpdateStatus(enq.id, 'replied')}
                    className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-xl font-semibold flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark as Replied</span>
                  </button>
                )}
                {enq.status !== 'closed' && (
                  <button
                    onClick={() => handleUpdateStatus(enq.id, 'closed')}
                    className="px-3 py-1.5 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 rounded-xl font-semibold"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
