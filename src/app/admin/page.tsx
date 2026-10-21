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
  CheckCircle2,
  Clock,
  Sparkles,
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

  // Registered customers count
  const customerCountRow = db.prepare("SELECT COUNT(id) as count FROM users WHERE role = 'customer'").get() as { count: number };
  const totalCustomers = customerCountRow?.count || 0;

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
  const netProfit = confirmedRevenue - totalExpenses;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
              Operations Telemetry
            </span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900">
            Store Operations Overview
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Real-time business telemetry and orders processing for BAGm Beauty Supply.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-soft transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            href="/admin/inventory"
            className="px-4 py-2 bg-white hover:bg-rose-50 text-charcoal-800 border border-rose-200/90 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Boxes className="w-4 h-4 text-brand-600" />
            <span>Adjust Stock</span>
          </Link>
          <Link
            href="/admin/reports"
            className="px-4 py-2 bg-white hover:bg-rose-50 text-charcoal-800 border border-rose-200/90 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Reports</span>
          </Link>
        </div>
      </div>

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Confirmed Revenue & Net Margin */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200/80 shadow-card hover:shadow-soft transition-all space-y-2">
          <div className="flex items-center justify-between text-charcoal-500 text-xs font-bold uppercase tracking-wider">
            <span>Confirmed Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/80">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900">
            {formatGHS(confirmedRevenue)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-charcoal-500 pt-1 border-t border-rose-100/60">
            <span>Net after expenses:</span>
            <span className={`font-semibold ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {formatGHS(netProfit)}
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200/80 shadow-card hover:shadow-soft transition-all space-y-2">
          <div className="flex items-center justify-between text-charcoal-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-200/80">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900">
            {salesRow?.total_orders || 0}
          </div>
          <div className="flex items-center justify-between text-[11px] text-charcoal-500 pt-1 border-t border-rose-100/60">
            <span className="text-emerald-700 font-semibold">{salesRow?.paid_orders_count || 0} Paid</span>
            <span>•</span>
            <span className="text-amber-700 font-semibold">{salesRow?.pending_orders_count || 0} Awaiting</span>
          </div>
        </div>

        {/* Active Products & Low Stock */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200/80 shadow-card hover:shadow-soft transition-all space-y-2">
          <div className="flex items-center justify-between text-charcoal-500 text-xs font-bold uppercase tracking-wider">
            <span>Product Catalog</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/80">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900">
            {invRow?.total_products || 0} <span className="text-xs font-normal text-charcoal-500">Active</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-rose-100/60">
            <span className="text-amber-700 font-semibold">{invRow?.low_stock_count || 0} Low Stock</span>
            <span className="text-charcoal-300">•</span>
            <span className="text-rose-700 font-semibold">{invRow?.out_of_stock_count || 0} Out</span>
          </div>
        </div>

        {/* Registered Customers & Audience */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200/80 shadow-card hover:shadow-soft transition-all space-y-2">
          <div className="flex items-center justify-between text-charcoal-500 text-xs font-bold uppercase tracking-wider">
            <span>Customer Base</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200/80">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900">
            {totalCustomers} <span className="text-xs font-normal text-charcoal-500">Accounts</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-charcoal-500 pt-1 border-t border-rose-100/60">
            <span>Subscribers:</span>
            <Link href="/admin/subscribers" className="text-brand-600 hover:text-brand-700 font-semibold hover:underline">
              {subscribersCount?.count || 0} VIP Emails
            </Link>
          </div>
        </div>
      </div>

      {/* Operational Queue & Fast Action Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/returns"
          className="p-4 bg-white hover:bg-rose-50/50 rounded-2xl border border-rose-200/80 shadow-card transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/70">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-charcoal-900">Return Requests</p>
              <p className="text-[11px] text-charcoal-500">
                {pendingReturns?.count || 0} pending review
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-brand-600 transition-colors" />
        </Link>

        <Link
          href="/admin/enquiries"
          className="p-4 bg-white hover:bg-rose-50/50 rounded-2xl border border-rose-200/80 shadow-card transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-200/70">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-charcoal-900">Customer Messages</p>
              <p className="text-[11px] text-charcoal-500">
                {newEnquiries?.count || 0} unread enquiries
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-brand-600 transition-colors" />
        </Link>

        <Link
          href="/admin/expenses"
          className="p-4 bg-white hover:bg-rose-50/50 rounded-2xl border border-rose-200/80 shadow-card transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/70">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-charcoal-900">Store Expenses</p>
              <p className="text-[11px] text-charcoal-500">
                {formatGHS(totalExpenses)} recorded
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-brand-600 transition-colors" />
        </Link>
      </div>

      {/* Main Grid: Recent Orders + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-rose-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100">
            <h3 className="font-serif font-bold text-lg text-charcoal-900">Recent Store Orders</h3>
            <Link href="/admin/orders" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              View All Orders &rarr;
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-charcoal-500 py-6 text-center">No orders placed yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] uppercase tracking-wider text-charcoal-600 bg-rose-50/50 rounded-xl">
                  <tr>
                    <th className="py-2.5 px-3">Order Ref</th>
                    <th className="py-2.5 px-2">Customer</th>
                    <th className="py-2.5 px-2">Fulfilment</th>
                    <th className="py-2.5 px-2">Payment</th>
                    <th className="py-2.5 px-2 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100/70 text-charcoal-700">
                  {recentOrders.map((ord) => {
                    const statusInfo = getOrderStatusLabel(ord.order_status);
                    const paymentInfo = getPaymentStatusLabel(ord.payment_status);

                    return (
                      <tr key={ord.id} className="hover:bg-rose-50/40 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-charcoal-900">
                          #{ord.order_number}
                        </td>
                        <td className="py-3 px-2">
                          <span className="block font-medium text-charcoal-900">{ord.customer_name}</span>
                          <span className="text-[10px] text-charcoal-500">{ord.customer_phone}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${paymentInfo.color}`}>
                            {paymentInfo.label}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-serif font-bold text-charcoal-900">
                          {formatGHS(ord.total_amount)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={`/admin/orders/${ord.id}`}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-brand-600 hover:text-white text-brand-700 border border-rose-200 rounded-lg text-[11px] font-semibold transition-all inline-block"
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
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-rose-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-serif font-bold text-base text-charcoal-900">Low Stock Watchlist</h3>
            </div>
            <Link href="/admin/inventory" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Manage &rarr;
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-charcoal-500 py-6 text-center">All products are healthy and in stock.</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-rose-50/40 border border-rose-200/70 flex items-center justify-between text-xs hover:border-brand-300 transition-colors">
                  <div>
                    <h4 className="font-semibold text-charcoal-900 line-clamp-1">{p.name}</h4>
                    <span className="font-mono text-[10px] text-charcoal-500">SKU: {p.sku}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`font-bold block ${p.stock_quantity <= 0 ? 'text-rose-600' : 'text-amber-700'}`}>
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
