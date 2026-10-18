'use client';

import React, { useState } from 'react';
import { Download, FileSpreadsheet, BarChart3, ShieldCheck, DollarSign, Package } from 'lucide-react';

export default function AdminReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (type: string, filename: string) => {
    setDownloading(type);
    try {
      const res = await fetch(`/api/admin/reports?type=${type}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      alert('Failed to download report');
    } finally {
      setDownloading(null);
    }
  };

  const reports = [
    {
      id: 'sales',
      title: 'Sales & Revenue Ledger',
      description: 'Comprehensive line-item order transactions, payment methods, delivery fees, and net customer billing.',
      icon: DollarSign,
      filename: `bagm_sales_ledger_${new Date().toISOString().split('T')[0]}.csv`,
    },
    {
      id: 'inventory_valuation',
      title: 'Inventory Stock Valuation Report',
      description: 'Live physical warehouse stock on hand, wholesale unit cost, retail value, and total assets in GH₵.',
      icon: Package,
      filename: `bagm_inventory_valuation_${new Date().toISOString().split('T')[0]}.csv`,
    },
    {
      id: 'stock_movements',
      title: 'Stock Movements & Restock Audit',
      description: 'Audit log of every stock alteration: customer checkouts, manual adjustments, purchase order receipts, and cancellations.',
      icon: FileSpreadsheet,
      filename: `bagm_stock_audit_${new Date().toISOString().split('T')[0]}.csv`,
    },
    {
      id: 'customers',
      title: 'Customer Directory & Lifetime Value',
      description: 'Registered Ghanaian customers, order counts, and cumulative lifetime revenue generation.',
      icon: BarChart3,
      filename: `bagm_customer_directory_${new Date().toISOString().split('T')[0]}.csv`,
    },
    {
      id: 'expenses',
      title: 'Operating Expenses Ledger',
      description: 'Breakdown of logistics, packaging, hub overhead, and port customs clearing expenses.',
      icon: FileSpreadsheet,
      filename: `bagm_expenses_ledger_${new Date().toISOString().split('T')[0]}.csv`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif font-bold text-2xl text-white">Financial &amp; Operational Reports Export</h1>
        <p className="text-xs text-charcoal-400 mt-1">
          Generate structured CSV spreadsheets for bookkeeping, GRA tax reporting, and warehouse inventory reconciliation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r) => {
          const Icon = r.icon;
          const isCurrent = downloading === r.id;

          return (
            <div
              key={r.id}
              className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-800 text-brand-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-white">{r.title}</h3>
                </div>
                <p className="text-xs text-charcoal-400 leading-relaxed">{r.description}</p>
              </div>

              <button
                onClick={() => handleDownload(r.id, r.filename)}
                disabled={!!downloading}
                className="w-full py-3 bg-charcoal-900 hover:bg-charcoal-800 text-white border border-charcoal-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-brand-400" />
                <span>{isCurrent ? 'Generating CSV...' : 'Download CSV Report'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
