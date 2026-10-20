import React from 'react';
import { getDb } from '@/lib/db';
import { parseProductRow } from '@/lib/products';
import { formatGHS, formatDateOnly } from '@/lib/utils';
import Link from 'next/link';
import { Plus, Search, Edit, Eye, FileSpreadsheet, Sparkles, Package } from 'lucide-react';

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
              Inventory & Catalog
            </span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900">
            Product Catalogue
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Manage your skincare, facial treatments, body butters, and luxury beauty catalog.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/admin/products/export"
            download
            className="px-4 py-2 bg-white hover:bg-rose-50 text-charcoal-800 border border-rose-200/90 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </a>
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-soft transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-rose-200/80 shadow-card overflow-hidden">
        <div className="p-4 border-b border-rose-100 flex items-center justify-between bg-rose-50/30">
          <span className="text-xs text-charcoal-600 font-semibold">
            Total Active Products: <strong className="text-charcoal-900">{products.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-rose-50/50 text-[11px] uppercase tracking-wider text-charcoal-600 border-b border-rose-100">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Cost</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100/70 text-charcoal-700">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-rose-50/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=80'}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover bg-rose-50 border border-rose-200/80"
                      />
                      <div>
                        <span className="font-semibold text-charcoal-900 block line-clamp-1">{p.name}</span>
                        <span className="font-mono text-[10px] text-charcoal-500">SKU: {p.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-charcoal-900">{p.brand_name}</td>
                  <td className="py-3 px-4 text-charcoal-600">{p.category_name}</td>
                  <td className="py-3 px-4 font-serif font-bold text-charcoal-900">{formatGHS(p.price)}</td>
                  <td className="py-3 px-4 text-charcoal-500">{formatGHS(p.cost_price)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-bold ${
                        p.stock_quantity <= 0
                          ? 'text-rose-600'
                          : p.stock_quantity <= p.low_stock_threshold
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {p.stock_quantity} units
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        p.is_published === 1
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      {p.is_published === 1 ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/product/${p.slug}`}
                        target="_blank"
                        className="p-1.5 text-charcoal-500 hover:text-charcoal-900 rounded-lg hover:bg-rose-50 transition-colors"
                        title="View on store"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/products/new?id=${p.id}`}
                        className="p-1.5 text-brand-600 hover:text-brand-700 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
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
