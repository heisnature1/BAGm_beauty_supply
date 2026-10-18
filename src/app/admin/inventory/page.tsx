'use client';

import React, { useState, useEffect } from 'react';
import { Product, StockMovement } from '@/types';
import { formatGHS, formatDate } from '@/lib/utils';
import Link from 'next/link';
import {
  Boxes,
  AlertTriangle,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle2,
  FileSpreadsheet,
  X,
  History,
  Truck,
  Building,
} from 'lucide-react';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  // Adjustment Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<string>('restock');
  const [qtyChange, setQtyChange] = useState<number>(10);
  const [reason, setReason] = useState<string>('Supplier Shipment Restock');
  const [adjusting, setAdjusting] = useState(false);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const [prodRes, moveRes] = await Promise.all([
        fetch('/api/admin/products').then((r) => r.json()),
        fetch('/api/admin/inventory/movements').then((r) => r.json()),
      ]);

      if (prodRes?.products) setProducts(prodRes.products);
      if (moveRes?.movements) setMovements(moveRes.movements);
    } catch (e) {
      console.error('Failed to load inventory', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleOpenAdjust = (prod: Product) => {
    setSelectedProduct(prod);
    setQtyChange(10);
    setAdjustmentType('restock');
    setReason('Supplier Shipment Restock');
    setModalOpen(true);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setAdjusting(true);

    try {
      const res = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantityChange: qtyChange,
          type: adjustmentType,
          reason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setModalOpen(false);
        loadInventory();
      } else {
        alert(data.error || 'Failed to adjust stock');
      }
    } catch {
      alert('Error updating stock');
    } finally {
      setAdjusting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (filter === 'low') {
      return p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold;
    }
    if (filter === 'out') {
      return p.stock_quantity <= 0 || p.stock_status === 'out_of_stock';
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-white">Inventory &amp; Stock Movements</h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Real-time stock control, movement audit logs, and supplier purchase records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/inventory/suppliers"
            className="px-4 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Building className="w-4 h-4 text-brand-400" />
            <span>Suppliers</span>
          </Link>
          <Link
            href="/admin/inventory/purchase-orders"
            className="px-4 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Purchase Orders</span>
          </Link>
        </div>
      </div>

      {/* Product Stock Table */}
      <div className="bg-charcoal-950 rounded-3xl border border-charcoal-800 overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-800">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-brand-400" />
            <h2 className="font-serif font-bold text-lg text-white">Current Stock Levels</h2>
          </div>

          <div className="flex items-center gap-2 bg-charcoal-900 p-1 rounded-xl border border-charcoal-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filter === 'all' ? 'bg-brand-600 text-white' : 'text-charcoal-400 hover:text-white'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setFilter('low')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filter === 'low' ? 'bg-amber-600 text-white' : 'text-charcoal-400 hover:text-white'
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setFilter('out')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filter === 'out' ? 'bg-red-600 text-white' : 'text-charcoal-400 hover:text-white'
              }`}
            >
              Out of Stock
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-charcoal-900/60 text-[11px] uppercase tracking-wider text-charcoal-400 border-b border-charcoal-800">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Available Qty</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800 text-charcoal-300">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-charcoal-900/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">{p.name}</td>
                  <td className="py-3 px-4 font-mono text-charcoal-400">{p.sku}</td>
                  <td className="py-3 px-4 text-charcoal-300">{p.brand_name}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-bold text-sm ${
                        p.stock_quantity <= 0
                          ? 'text-red-400'
                          : p.stock_quantity <= p.low_stock_threshold
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-charcoal-500">{p.low_stock_threshold}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.stock_quantity <= 0
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : p.stock_quantity <= p.low_stock_threshold
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {p.stock_quantity <= 0 ? 'Out of Stock' : p.stock_quantity <= p.low_stock_threshold ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenAdjust(p)}
                      className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-semibold text-[11px] transition-colors shadow-xs"
                    >
                      Adjust / Restock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement History Audit Log */}
      <div className="bg-charcoal-950 rounded-3xl border border-charcoal-800 p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-charcoal-800">
          <History className="w-5 h-5 text-gold-400" />
          <h2 className="font-serif font-bold text-lg text-white">Stock Movement Audit Trail</h2>
        </div>

        {movements.length === 0 ? (
          <p className="text-xs text-charcoal-500 py-6 text-center">No stock movements recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-charcoal-900/60 text-[11px] uppercase tracking-wider text-charcoal-400 border-b border-charcoal-800">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Movement</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Reason / Details</th>
                  <th className="py-2.5 px-3">Before &rarr; After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800 text-charcoal-300">
                {movements.slice(0, 20).map((m) => (
                  <tr key={m.id} className="hover:bg-charcoal-900/40">
                    <td className="py-2.5 px-3 text-charcoal-400 font-mono text-[11px]">
                      {formatDate(m.created_at)}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">{m.product_name || m.product_id}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-bold ${
                          m.quantity_change > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-charcoal-900 border border-charcoal-700 text-charcoal-300">
                        {m.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-charcoal-400">{m.reason || '—'}</td>
                    <td className="py-2.5 px-3 font-mono text-charcoal-400">
                      {m.stock_before} &rarr; <strong className="text-white">{m.stock_after}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-charcoal-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif font-bold text-xl text-white mb-1">
              Adjust Inventory Stock
            </h3>
            <p className="text-xs text-charcoal-400 mb-4">
              Product: <strong className="text-white">{selectedProduct.name}</strong> (Current Stock: {selectedProduct.stock_quantity})
            </p>

            <form onSubmit={handleSaveAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="font-bold uppercase text-charcoal-300 block mb-1">Adjustment Type</label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value)}
                  className="w-full p-3 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="restock">Restock (+ Addition)</option>
                  <option value="damaged">Damaged / Expired (- Reduction)</option>
                  <option value="audit_correction">Audit Inventory Correction</option>
                  <option value="return_restock">Customer Return Restock (+ Addition)</option>
                </select>
              </div>

              <div>
                <label className="font-bold uppercase text-charcoal-300 block mb-1">
                  Quantity Change (+ / -)
                </label>
                <input
                  type="number"
                  required
                  placeholder="+20 or -5"
                  value={qtyChange}
                  onChange={(e) => setQtyChange(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-3 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white font-bold text-sm focus:outline-none focus:border-brand-500"
                />
                <span className="text-[10px] text-charcoal-500 mt-1 block">
                  New stock will be: <strong>{selectedProduct.stock_quantity + qtyChange}</strong>
                </span>
              </div>

              <div>
                <label className="font-bold uppercase text-charcoal-300 block mb-1">
                  Reason &amp; Reference (Audit Note)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Received shipment from Atlantic Logistics PO-102"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-charcoal-700 text-charcoal-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold"
                >
                  {adjusting ? 'Saving Adjustment...' : 'Record Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
