'use client';

import React, { useState, useEffect } from 'react';
import { ReturnRequest } from '@/types';
import { formatGHS, formatDate } from '@/lib/utils';
import { RotateCcw, CheckCircle2, XCircle, AlertCircle, Eye, X, Save, RefreshCw } from 'lucide-react';

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);

  // Form State
  const [status, setStatus] = useState<string>('approved');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [isResellable, setIsResellable] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundMethod, setRefundMethod] = useState('momo_reversal');
  const [refundRef, setRefundRef] = useState('');
  const [saving, setSaving] = useState(false);

  const loadReturns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/returns');
      const data = await res.json();
      if (data?.returns) setReturns(data.returns);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  const handleOpenReview = (ret: ReturnRequest) => {
    setSelectedReturn(ret);
    setStatus(ret.status);
    setInspectionNotes(ret.inspection_notes || '');
    setIsResellable(ret.is_resellable === 1);
    setRefundAmount(ret.refund_amount || 0);
    setRefundMethod(ret.refund_method || 'momo_reversal');
    setRefundRef(ret.refund_reference || '');
    setModalOpen(true);
  };

  const handleSaveReturnStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;
    setSaving(true);

    try {
      const res = await fetch('/api/admin/returns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedReturn.id,
          status,
          inspection_notes: inspectionNotes,
          is_resellable: isResellable ? 1 : 0,
          refund_amount: Number(refundAmount),
          refund_method: refundMethod,
          refund_reference: refundRef,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setModalOpen(false);
        loadReturns();
      } else {
        alert(data.error || 'Failed to update return request');
      }
    } catch {
      alert('Error updating return request');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif font-bold text-2xl text-white">Returns &amp; Refunds Management</h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Review customer return claims, inspect stock, and record verified refunds.
          </p>
        </div>
      </div>

      <div className="bg-charcoal-950 rounded-3xl border border-charcoal-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-charcoal-900/60 text-[11px] uppercase tracking-wider text-charcoal-400 border-b border-charcoal-800">
              <tr>
                <th className="py-3 px-4">Return #</th>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Product / Qty</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800 text-charcoal-300">
              {returns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-charcoal-500">
                    No return requests submitted.
                  </td>
                </tr>
              ) : (
                returns.map((ret: any) => (
                  <tr key={ret.id} className="hover:bg-charcoal-900/40">
                    <td className="py-3 px-4 font-mono font-bold text-white">#{ret.return_number}</td>
                    <td className="py-3 px-4 font-mono text-charcoal-400">#{ret.order_number}</td>
                    <td className="py-3 px-4 font-medium text-white">
                      {ret.product_name} (Qty: {ret.quantity})
                    </td>
                    <td className="py-3 px-4 text-charcoal-400 capitalize">{ret.reason.replace('_', ' ')}</td>
                    <td className="py-3 px-4 text-charcoal-400 font-mono text-[11px]">{formatDate(ret.created_at)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ret.status === 'refunded'
                            ? 'bg-purple-950 text-purple-400 border border-purple-800'
                            : ret.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : ret.status === 'rejected'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {ret.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenReview(ret)}
                        className="px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-[11px] font-semibold"
                      >
                        Review Request
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && selectedReturn && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-xl text-white">Review Return #{selectedReturn.return_number}</h3>
                <p className="text-xs text-charcoal-400">Order: #{selectedReturn.order_number}</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-charcoal-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-charcoal-950 rounded-2xl border border-charcoal-800 text-xs space-y-2 text-charcoal-300">
              <p><strong>Customer:</strong> {selectedReturn.customer_name} ({selectedReturn.customer_email})</p>
              <p><strong>Product:</strong> {selectedReturn.product_name} (Qty: {selectedReturn.quantity})</p>
              <p><strong>Reason:</strong> {selectedReturn.reason.replace('_', ' ')}</p>
              <p><strong>Customer Explanation:</strong> {selectedReturn.explanation}</p>
            </div>

            <form onSubmit={handleSaveReturnStatus} className="space-y-3 text-xs">
              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">Return Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white"
                >
                  <option value="requested">Requested (Pending Review)</option>
                  <option value="approved">Approved for Collection / Return</option>
                  <option value="item_received">Item Received in Hub</option>
                  <option value="inspected">Inspected &amp; Evaluated</option>
                  <option value="refund_approved">Refund Approved</option>
                  <option value="refunded">Refunded (Completed)</option>
                  <option value="rejected">Rejected (Does Not Meet Policy)</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">Inspection &amp; Assessment Notes</label>
                <textarea
                  rows={2}
                  placeholder="Notes on item physical condition, seal integrity, etc..."
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white"
                />
              </div>

              <label className="flex items-center gap-2 p-3 bg-charcoal-950 rounded-xl border border-charcoal-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isResellable}
                  onChange={(e) => setIsResellable(e.target.checked)}
                  className="rounded text-brand-600"
                />
                <div>
                  <span className="font-bold text-white block">Restock Item to Inventory (Resellable)</span>
                  <span className="text-[10px] text-charcoal-400">
                    Check if packaging is 100% factory sealed and safe for resale in Ghana.
                  </span>
                </div>
              </label>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="font-bold uppercase text-charcoal-400 block mb-1">Refund Amount (GH₵)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white font-serif font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-charcoal-400 block mb-1">Refund Method</label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white"
                  >
                    <option value="momo_reversal">Mobile Money Reversal</option>
                    <option value="bank_transfer">Direct Bank Transfer</option>
                    <option value="cash">Cash Refund</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">Refund Transaction Reference</label>
                <input
                  type="text"
                  placeholder="e.g. MOMO_REF_991823"
                  value={refundRef}
                  onChange={(e) => setRefundRef(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-charcoal-700 text-charcoal-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold"
                >
                  {saving ? 'Saving...' : 'Save Return Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
