'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PurchaseOrder, Supplier, Product } from '@/types';
import { formatGHS, formatDate, generatePONumber } from '@/lib/utils';
import { Truck, Plus, ArrowLeft, CheckCircle2, Clock, X } from 'lucide-react';

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New PO state
  const [supplierId, setSupplierId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(50);
  const [unitCost, setUnitCost] = useState(100);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [poRes, supRes, prodRes] = await Promise.all([
        fetch('/api/admin/inventory/purchase-orders').then((r) => r.json()),
        fetch('/api/admin/inventory/suppliers').then((r) => r.json()),
        fetch('/api/admin/products').then((r) => r.json()),
      ]);

      if (poRes?.orders) setOrders(poRes.orders);
      if (supRes?.suppliers) {
        setSuppliers(supRes.suppliers);
        if (supRes.suppliers[0]) setSupplierId(supRes.suppliers[0].id);
      }
      if (prodRes?.products) {
        setProducts(prodRes.products);
        if (prodRes.products[0]) {
          setProductId(prodRes.products[0].id);
          setUnitCost(prodRes.products[0].cost_price || 100);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !productId) return;
    setSaving(true);

    try {
      const product = products.find((p) => p.id === productId);
      const items = [
        {
          product_id: productId,
          product_name: product?.name || 'Product',
          quantity,
          unit_cost: unitCost,
        },
      ];

      const res = await fetch('/api/admin/inventory/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier_id: supplierId,
          items,
          total_cost: quantity * unitCost,
          notes,
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        loadData();
      }
    } catch {
      alert('Failed to create purchase order');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkReceived = async (poId: string) => {
    if (!confirm('Marking this Purchase Order as Received will automatically restock product inventory. Proceed?')) return;

    try {
      const res = await fetch(`/api/admin/inventory/purchase-orders/receive?id=${poId}`, { method: 'POST' });
      if (res.ok) {
        loadData();
      }
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/inventory"
            className="p-2 bg-charcoal-800 hover:bg-charcoal-700 text-white rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif font-bold text-2xl text-white">Purchase Orders &amp; Restocks</h1>
            <p className="text-xs text-charcoal-400">
              Create supplier purchase orders and automatically increment store inventory upon receipt.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create Purchase Order</span>
        </button>
      </div>

      <div className="bg-charcoal-950 rounded-3xl border border-charcoal-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-charcoal-900/60 text-[11px] uppercase tracking-wider text-charcoal-400 border-b border-charcoal-800">
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Items / Qty</th>
                <th className="py-3 px-4">Total Cost</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800 text-charcoal-300">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-charcoal-500">
                    No purchase orders created yet.
                  </td>
                </tr>
              ) : (
                orders.map((po: any) => {
                  let itemsList: any[] = [];
                  try {
                    itemsList = typeof po.items === 'string' ? JSON.parse(po.items) : po.items;
                  } catch {}

                  return (
                    <tr key={po.id} className="hover:bg-charcoal-900/40">
                      <td className="py-3 px-4 font-mono font-bold text-white">{po.po_number}</td>
                      <td className="py-3 px-4 font-medium text-white">{po.supplier_name || 'Supplier'}</td>
                      <td className="py-3 px-4">
                        {itemsList.map((i, idx) => (
                          <span key={idx} className="block text-charcoal-400">
                            {i.product_name} (Qty: {i.quantity})
                          </span>
                        ))}
                      </td>
                      <td className="py-3 px-4 font-serif font-bold text-white">{formatGHS(po.total_cost)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            po.status === 'received'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {po.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-charcoal-400 font-mono text-[11px]">{formatDate(po.created_at)}</td>
                      <td className="py-3 px-4 text-right">
                        {po.status !== 'received' && (
                          <button
                            onClick={() => handleMarkReceived(po.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold"
                          >
                            Mark Received &amp; Restock
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-white">Create Purchase Order</h3>
              <button onClick={() => setModalOpen(false)} className="text-charcoal-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-3 text-xs">
              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">Select Supplier</label>
                <select
                  required
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">Product to Order</label>
                <select
                  required
                  value={productId}
                  onChange={(e) => {
                    setProductId(e.target.value);
                    const sel = products.find((p) => p.id === e.target.value);
                    if (sel) setUnitCost(sel.cost_price || 100);
                  }}
                  className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (Current Stock: {p.stock_quantity})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold uppercase text-charcoal-400 block mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-charcoal-400 block mb-1">Unit Cost (GH₵)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={unitCost}
                    onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-charcoal-950 rounded-xl border border-charcoal-800 text-right font-serif font-bold text-sm text-white">
                Total PO Cost: {formatGHS(quantity * unitCost)}
              </div>

              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">PO Notes</label>
                <input
                  type="text"
                  placeholder="Expected delivery date, batch notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-charcoal-700 text-charcoal-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold"
                >
                  {saving ? 'Creating...' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
