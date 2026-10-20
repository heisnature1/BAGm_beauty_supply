'use client';

import React, { useState, useEffect } from 'react';
import { formatGHS, formatDate } from '@/lib/utils';
import { DollarSign, TrendingUp, TrendingDown, Plus, X, Trash2, Calendar, FileText } from 'lucide-react';

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalCogs: 0,
    grossProfit: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
  });
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState('Packaging & Boxes');
  const [amount, setAmount] = useState<number>(0);
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [payMethod, setPayMethod] = useState('Mobile Money');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/expenses');
      const data = await res.json();
      if (data?.expenses) setExpenses(data.expenses);
      if (data?.summary) setSummary(data.summary);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          amount: Number(amount),
          description: desc,
          date,
          payment_method: payMethod,
        }),
      });
      if (res.ok) {
        setModalOpen(false);
        setAmount(0);
        setDesc('');
        loadData();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense entry?')) return;
    await fetch(`/api/admin/expenses?id=${id}`, { method: 'DELETE' });
    loadData();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
              Financial Accounting
            </span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900">Expenses &amp; Net Profit Tracker</h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Track operational business expenses in Ghana and evaluate live gross &amp; net margins.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start shadow-soft transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-rose-200/80 shadow-card space-y-1">
          <span className="text-[10px] uppercase font-bold text-charcoal-500">Total Confirmed Revenue</span>
          <p className="font-serif font-bold text-xl sm:text-2xl text-charcoal-900">{formatGHS(summary.totalRevenue)}</p>
          <p className="text-[11px] text-charcoal-500">From all paid customer orders</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-rose-200/80 shadow-card space-y-1">
          <span className="text-[10px] uppercase font-bold text-charcoal-500">Cost of Goods Sold (COGS)</span>
          <p className="font-serif font-bold text-xl sm:text-2xl text-amber-700">{formatGHS(summary.totalCogs)}</p>
          <p className="text-[11px] text-charcoal-500">Wholesale product acquisition cost</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-rose-200/80 shadow-card space-y-1">
          <span className="text-[10px] uppercase font-bold text-charcoal-500">Total Operating Expenses (OpEx)</span>
          <p className="font-serif font-bold text-xl sm:text-2xl text-rose-600">{formatGHS(summary.totalExpenses)}</p>
          <p className="text-[11px] text-charcoal-500">Logistics, packaging, marketing &amp; hub</p>
        </div>

        <div className="p-5 rounded-2xl bg-brand-50/60 border border-brand-200 shadow-card space-y-1">
          <span className="text-[10px] uppercase font-bold text-brand-700">Net Operating Profit</span>
          <p className="font-serif font-bold text-2xl text-emerald-700">{formatGHS(summary.netProfit)}</p>
          <p className="text-[11px] text-brand-700 font-semibold">Margin: {summary.profitMargin.toFixed(1)}%</p>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-rose-200/80 shadow-card overflow-hidden">
        <div className="p-4 border-b border-rose-100 bg-rose-50/30">
          <h3 className="font-serif font-bold text-sm text-charcoal-900">Expense Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-rose-50/50 text-[11px] uppercase tracking-wider text-charcoal-600 border-b border-rose-100">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100/70 text-charcoal-700">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-charcoal-500">
                    No operating expenses recorded yet.
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-rose-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-charcoal-500">{e.date}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-charcoal-700 border border-rose-200">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-charcoal-900">{e.description}</td>
                    <td className="py-3 px-4 text-charcoal-500">{e.payment_method}</td>
                    <td className="py-3 px-4 text-right font-serif font-bold text-rose-600">
                      -{formatGHS(e.amount)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="p-1 text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-rose-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-charcoal-900">Record Operating Expense</h3>
              <button onClick={() => setModalOpen(false)} className="text-charcoal-400 hover:text-charcoal-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1">Expense Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                >
                  <option value="Packaging & Boxes">Packaging &amp; Branded Boxes</option>
                  <option value="Courier & Logistics">Accra Courier &amp; Rider Delivery</option>
                  <option value="Import Clearing & Port Duties">Import Clearing &amp; Port Duties (Tema)</option>
                  <option value="Store Rent & Utilities">East Legon Hub Rent &amp; Utilities</option>
                  <option value="Marketing & Influencer Gifting">Marketing &amp; Content Creation</option>
                  <option value="Software & Subscriptions">Software &amp; Domain Subscriptions</option>
                  <option value="General Admin">General Admin &amp; Office</option>
                </select>
              </div>

              <div>
                <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1">Amount Spent (GH₵)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 font-serif font-bold focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1">Description / Memo</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500 Custom Blush Pink Mailer Boxes"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 font-mono focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1">Paid Via</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                  >
                    <option value="Mobile Money (MTN / Telecel)">Mobile Money</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Petty Cash">Petty Cash</option>
                  </select>
                </div>
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
                  {saving ? 'Recording...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
