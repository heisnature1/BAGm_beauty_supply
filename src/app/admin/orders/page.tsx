'use client';

import React, { useState, useEffect } from 'react';
import { Order } from '@/types';
import { formatGHS, formatDate, getOrderStatusLabel, getPaymentStatusLabel, getPaymentMethodLabel } from '@/lib/utils';
import Link from 'next/link';
import { ShoppingCart, Search, Filter, Printer, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data?.orders) setOrders(data.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.order_status !== statusFilter) return false;
    if (paymentFilter !== 'all' && o.payment_status !== paymentFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNumber = o.order_number.toLowerCase().includes(q);
      const matchCustomer = o.customer_name.toLowerCase().includes(q);
      const matchEmail = o.customer_email.toLowerCase().includes(q);
      const matchPhone = o.customer_phone.toLowerCase().includes(q);
      return matchNumber || matchCustomer || matchEmail || matchPhone;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
              Fulfilment Center
            </span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900">
            Orders &amp; Fulfilment
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Track customer beauty orders, verify payments, and dispatch couriers across Ghana.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-rose-200/80 shadow-card grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by order #, customer name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs p-2.5 pl-10 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
          />
        </div>

        <div className="sm:col-span-4 flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
          >
            <option value="all">All Order Statuses</option>
            <option value="order_placed">Order Placed</option>
            <option value="awaiting_payment">Awaiting Payment</option>
            <option value="payment_confirmed">Payment Confirmed</option>
            <option value="processing">Processing</option>
            <option value="dispatched">Dispatched</option>
            <option value="delivered">Delivered</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="collected">Collected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid (Confirmed)</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-rose-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-rose-50/50 text-[11px] uppercase tracking-wider text-charcoal-600 border-b border-rose-100">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Fulfilment</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100/70 text-charcoal-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-charcoal-500">
                    No orders matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const statusInfo = getOrderStatusLabel(ord.order_status);
                  const paymentInfo = getPaymentStatusLabel(ord.payment_status);

                  return (
                    <tr key={ord.id} className="hover:bg-rose-50/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-charcoal-900">
                        #{ord.order_number}
                      </td>
                      <td className="py-3 px-4 text-charcoal-500 font-mono text-[11px]">
                        {formatDate(ord.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-charcoal-900 block">{ord.customer_name}</span>
                        <span className="text-[10px] text-charcoal-500">{ord.customer_phone}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize text-charcoal-700 font-medium">
                          {ord.fulfilment_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="block font-medium text-charcoal-900">{getPaymentMethodLabel(ord.payment_method)}</span>
                        <span className={`inline-block mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold border ${paymentInfo.color}`}>
                          {paymentInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-serif font-bold text-charcoal-900 text-sm">
                        {formatGHS(ord.total_amount)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/api/invoice/${ord.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-charcoal-500 hover:text-charcoal-900 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Print Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </a>
                          <Link
                            href={`/admin/orders/${ord.id}`}
                            className="px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold text-[11px] shadow-xs transition-colors"
                          >
                            Manage
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
