import React from 'react';
import { getDb } from '@/lib/db';
import { formatGHS, formatDate, getOrderStatusLabel, getPaymentStatusLabel } from '@/lib/utils';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  Users,
  TrendingUp,
  ArrowRight,
  Plus,
  Boxes,
  FileSpreadsheet,
} from 'lucide-react';

export const revalidate = 0;

export default function AdminOverviewPage() {
  const db = getDb();

  // Financials & Orders Metrics from real DB
  const salesRow = db.prepare(`
    SELECT
      SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as confirmed_revenue,
      SUM(CASE WHEN payment_status = 'pending' THEN total_amount ELSE 0 END) as pending_revenue,
      COUNT(id) as total_orders,
      SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_orders_count,
      SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending_orders_count,
      SUM(CASE WHEN order_status = 'delivered' OR order_status = 'collected' THEN 1 ELSE 0 END) as completed_orders_count,
      SUM(CASE WHEN order_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders_count
    FROM orders
  `).get() as any;

  // Inventory Metrics
  const invRow = db.prepare(`
    SELECT
      COUNT(id) as total_products,
      SUM(CASE WHEN stock_status = 'low_stock' OR (stock_quantity > 0 AND stock_quantity <= low_stock_threshold) THEN 1 ELSE 0 END) as low_stock_count,
      SUM(CASE WHEN stock_status = 'out_of_stock' OR stock_quantity <= 0 THEN 1 ELSE 0 END) as out_of_stock_count
    FROM products
    WHERE is_published = 1
  `).get() as any;

  // Returns pending
  const pendingReturns = db.prepare("SELECT COUNT(id) as count FROM returns WHERE status = 'requested'").get() as { count: number };

  // Enquiries new
  const newEnquiries = db.prepare("SELECT COUNT(id) as count FROM contact_enquiries WHERE status = 'new'").get() as { count: number };

  // Subscribers count
  const subscribersCount = db.prepare("SELECT COUNT(id) as count FROM newsletter_subscribers WHERE status = 'subscribed'").get() as { count: number };

  // Expenses total
  const expensesRow = db.prepare('SELECT SUM(amount) as total_expenses FROM expenses').get() as { total_expenses: number };
  const totalExpenses = Number(expensesRow?.total_expenses || 0);

  // Recent 6 Orders
  const recentOrders = db.prepare(`
    SELECT * FROM orders
    ORDER BY created_at DESC
    LIMIT 6
  `).all() as any[];

  // Low stock products alert list
  const lowStockProducts = db.prepare(`
    SELECT id, name, sku, stock_quantity, low_stock_threshold, price
    FROM products
    WHERE (stock_quantity <= low_stock_threshold OR stock_status = 'low_stock' OR stock_status = 'out_of_stock')
      AND is_published = 1
    ORDER BY stock_quantity ASC
    LIMIT 4
  `).all() as any[];

  const confirmedRevenue = Number(salesRow?.confirmed_revenue || 0);
  const pendingRevenue = Number(salesRow?.pending_revenue || 0);

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-white">
            Store Operations Overview
          </h1>
          <p className="text-xs text-charcoal-400 mt-1">
            Real-time business telemetry and orders processing for BAGm Beauty Supply.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            href="/admin/inventory"
            className="px-4 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Boxes className="w-4 h-4" />
            <span>Adjust Stock</span>
          </Link>
          <Link
            href="/admin/reports"
            className="px-4 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Reports</span>
          </Link>
        </div>
      </div>

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Confirmed Revenue */}
        <div className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-2">
          <div className="flex items-center justify-between text-charcoal-400 text-xs font-semibold uppercase tracking-wider">
            <span>Confirmed Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif font-bold text-2xl text-white">
            {formatGHS(confirmedRevenue)}
          </div>
          <p className="text-[11px] text-charcoal-400">
            Pending unverified payments: <span className="text-amber-400 font-semibold">{formatGHS(pendingRevenue)}</span>
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-2">
          <div className="flex items-center justify-between text-charcoal-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-brand-950 text-brand-400 flex items-center justify-center border border-brand-800">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif font-bold text-2xl text-white">
            {salesRow?.total_orders || 0}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-charcoal-400">
            <span className="text-emerald-400 font-semibold">{salesRow?.paid_orders_count || 0} Paid</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">{salesRow?.pending_orders_count || 0} Awaiting</span>
          </div>
        </div>

        {/* Active Products & Low Stock */}
        <div className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-2">
          <div className="flex items-center justify-between text-charcoal-400 text-xs font-semibold uppercase tracking-wider">
            <span>Product Catalog</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif font-bold text-2xl text-white">
            {invRow?.total_products || 0} <span className="text-xs font-normal text-charcoal-400">Active</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-amber-400 font-semibold">{invRow?.low_stock_count || 0} Low Stock</span>
            <span>•</span>
            <span className="text-red-400 font-semibold">{invRow?.out_of_stock_count || 0} Out</span>
          </div>
        </div>

        {/* Pending Actions / Requests */}
        <div className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-2">
          <div className="flex items-center justify-between text-charcoal-400 text-xs font-semibold uppercase tracking-wider">
            <span>Pending Action Queue</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950 text-purple-400 flex items-center justify-center border border-purple-800">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-bold text-2xl text-white">
              {(pendingReturns?.count || 0) + (newEnquiries?.count || 0)}
            </span>
            <span className="text-xs text-charcoal-400">Items requiring attention</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-charcoal-400">
            <Link href="/admin/returns" className="text-brand-400 hover:underline">
              {pendingReturns?.count || 0} Returns
            </Link>
            <span>•</span>
            <Link href="/admin/enquiries" className="text-brand-400 hover:underline">
              {newEnquiries?.count || 0} Enquiries
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Orders + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
            <h3 className="font-serif font-bold text-lg text-white">Recent Store Orders</h3>
            <Link href="/admin/orders" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
              View All Orders &rarr;
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-charcoal-500 py-6 text-center">No orders placed yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] uppercase tracking-wider text-charcoal-400 border-b border-charcoal-800">
                  <tr>
                    <th className="py-2.5">Order Ref</th>
                    <th className="py-2.5">Customer</th>
                    <th className="py-2.5">Fulfilment</th>
                    <th className="py-2.5">Payment</th>
                    <th className="py-2.5 text-right">Amount</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-800/60 text-charcoal-300">
                  {recentOrders.map((ord) => {
                    const statusInfo = getOrderStatusLabel(ord.order_status);
                    const paymentInfo = getPaymentStatusLabel(ord.payment_status);

                    return (
                      <tr key={ord.id} className="hover:bg-charcoal-900/50 transition-colors">
                        <td className="py-3 font-mono font-bold text-white">
                          #{ord.order_number}
                        </td>
                        <td className="py-3">
                          <span className="block font-medium text-white">{ord.customer_name}</span>
                          <span className="text-[10px] text-charcoal-500">{ord.customer_phone}</span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${paymentInfo.color}`}>
                            {paymentInfo.label}
                          </span>
                        </td>
                        <td className="py-3 text-right font-serif font-bold text-white">
                          {formatGHS(ord.total_amount)}
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/admin/orders/${ord.id}`}
                            className="px-2.5 py-1 bg-charcoal-800 hover:bg-brand-600 text-white rounded-lg text-[11px] font-semibold transition-colors"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Watchlist */}
        <div className="lg:col-span-4 bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="font-serif font-bold text-base text-white">Low Stock Watchlist</h3>
            </div>
            <Link href="/admin/inventory" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
              Manage &rarr;
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-charcoal-500 py-6 text-center">All products are healthy and in stock.</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="p-3 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-semibold text-white line-clamp-1">{p.name}</h4>
                    <span className="font-mono text-[10px] text-charcoal-500">SKU: {p.sku}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`font-bold block ${p.stock_quantity <= 0 ? 'text-red-400' : 'text-amber-400'}`}>
                      {p.stock_quantity} left
                    </span>
                    <span className="text-[10px] text-charcoal-500">Min: {p.low_stock_threshold}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
