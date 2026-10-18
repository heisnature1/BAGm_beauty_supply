import React from 'react';
import { getDb } from '@/lib/db';
import { parseProductRow } from '@/lib/products';
import { formatGHS, formatDateOnly } from '@/lib/utils';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye, FileSpreadsheet, Sparkles, Filter } from 'lucide-react';

export const revalidate = 0;

export default function AdminProductsPage() {
  const db = getDb();
  const rows = db.prepare(`
    SELECT p.*, b.name as brand_name, c.name as category_name
    FROM products p
    JOIN brands b ON p.brand_id = b.id
    JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `).all() as any[];

  const products = rows.map(parseProductRow);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-white">Product Catalogue</h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Manage your skincare, facial treatments, body butters, and beauty catalog.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/admin/products/export"
            download
            className="px-4 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </a>
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-charcoal-950 rounded-3xl border border-charcoal-800 overflow-hidden">
        <div className="p-4 border-b border-charcoal-800 flex items-center justify-between">
          <span className="text-xs text-charcoal-400 font-semibold">
            Total Products: <strong className="text-white">{products.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-charcoal-900/50 text-[11px] uppercase tracking-wider text-charcoal-400 border-b border-charcoal-800">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price (GH₵)</th>
                <th className="py-3 px-4">Cost (GH₵)</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800 text-charcoal-300">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-charcoal-900/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=80'}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-charcoal-900 border border-charcoal-800"
                      />
                      <div>
                        <span className="font-semibold text-white block line-clamp-1">{p.name}</span>
                        <span className="font-mono text-[10px] text-charcoal-500">SKU: {p.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-white">{p.brand_name}</td>
                  <td className="py-3 px-4 text-charcoal-400">{p.category_name}</td>
                  <td className="py-3 px-4 font-serif font-bold text-white">{formatGHS(p.price)}</td>
                  <td className="py-3 px-4 text-charcoal-400">{formatGHS(p.cost_price)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-bold ${
                        p.stock_quantity <= 0
                          ? 'text-red-400'
                          : p.stock_quantity <= p.low_stock_threshold
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {p.stock_quantity} units
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.is_published === 1 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {p.is_published === 1 ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/product/${p.slug}`}
                        target="_blank"
                        className="p-1.5 text-charcoal-400 hover:text-white rounded-lg hover:bg-charcoal-800"
                        title="View on store"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/admin/products/new?id=${p.id}`}
                        className="p-1.5 text-brand-400 hover:text-brand-300 rounded-lg hover:bg-charcoal-800"
                        title="Edit Product"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
