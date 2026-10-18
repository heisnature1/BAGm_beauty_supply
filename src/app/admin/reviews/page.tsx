'use client';

import React, { useState, useEffect } from 'react';
import { Review } from '@/types';
import { formatDate } from '@/lib/utils';
import { Star, ShieldCheck, Check, X, Trash2 } from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (data?.reviews) setReviews(data.reviews);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        loadReviews();
      }
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadReviews();
      }
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif font-bold text-2xl text-white">Verified Customer Reviews Moderation</h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Moderate genuine customer feedback submitted by verified purchasers.
          </p>
        </div>
      </div>

      <div className="bg-charcoal-950 rounded-3xl border border-charcoal-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-charcoal-900/60 text-[11px] uppercase tracking-wider text-charcoal-400 border-b border-charcoal-800">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Review Content</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800 text-charcoal-300">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-charcoal-500">
                    No customer reviews to display.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-charcoal-900/40">
                    <td className="py-3 px-4 font-semibold text-white">{r.product_name}</td>
                    <td className="py-3 px-4">
                      <span className="block text-white font-medium">{r.first_name} {r.last_name}</span>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified Purchase</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'fill-current' : 'text-charcoal-700'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      {r.title && <strong className="block text-white mb-0.5">{r.title}</strong>}
                      <p className="line-clamp-2 text-charcoal-400">{r.comment}</p>
                    </td>
                    <td className="py-3 px-4 text-charcoal-400 font-mono text-[11px]">{formatDate(r.created_at)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : r.status === 'rejected'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'approved')}
                            className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-lg"
                            title="Approve Review"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'rejected')}
                            className="p-1.5 bg-red-950 hover:bg-red-900 text-red-300 rounded-lg"
                            title="Reject Review"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 text-charcoal-500 hover:text-red-400 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
