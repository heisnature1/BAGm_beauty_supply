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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
            Inbox &amp; Support
          </span>
        </div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900">Customer Inquiries &amp; Consultations</h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Review messages, skincare questions, and assistance requests from customers across Ghana.
        </p>
      </div>

      <div className="space-y-4">
        {enquiries.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-rose-200/80 text-charcoal-500 text-xs shadow-card">
            No customer inquiries received yet.
          </div>
        ) : (
          enquiries.map((enq) => (
            <div
              key={enq.id}
              className="bg-white p-6 rounded-2xl border border-rose-200/80 shadow-card space-y-3 hover:border-brand-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-rose-100">
                <div>
                  <h3 className="font-serif font-bold text-base text-charcoal-900">{enq.subject}</h3>
                  <p className="text-xs text-charcoal-500">
                    From <strong className="text-charcoal-900">{enq.name}</strong> •{' '}
                    <a href={`mailto:${enq.email}`} className="text-brand-600 underline">
                      {enq.email}
                    </a>{' '}
                    {enq.phone && `• ${enq.phone}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-charcoal-500 font-mono">{formatDate(enq.created_at)}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      enq.status === 'replied'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {enq.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-charcoal-700 leading-relaxed whitespace-pre-wrap">{enq.message}</p>

              <div className="pt-2 flex items-center justify-end gap-2 text-xs">
                {enq.status !== 'replied' && (
                  <button
                    onClick={() => handleUpdateStatus(enq.id, 'replied')}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-emerald-700 rounded-xl font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark as Replied</span>
                  </button>
                )}
                {enq.status !== 'closed' && (
                  <button
                    onClick={() => handleUpdateStatus(enq.id, 'closed')}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-charcoal-700 border border-rose-200 rounded-xl font-semibold transition-colors cursor-pointer"
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
