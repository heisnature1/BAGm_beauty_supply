'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Order, OrderItem } from '@/types';
import { formatGHS, formatDate, getOrderStatusLabel, getPaymentStatusLabel, getPaymentMethodLabel } from '@/lib/utils';
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building,
  CreditCard,
  Banknote,
  Send,
  Save,
  RotateCcw,
  XCircle,
  ShieldCheck,
  Package,
} from 'lucide-react';

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Status updates
  const [orderStatus, setOrderStatus] = useState<string>('');
  const [courierName, setCourierName] = useState('');
  const [trackingRef, setTrackingRef] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState('');

  // Manual payment modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`);
      const data = await res.json();
      if (data?.order) {
        setOrder(data.order);
        setOrderStatus(data.order.order_status);
        setCourierName(data.order.courier_name || '');
        setTrackingRef(data.order.tracking_reference || '');
        setAdminNotes(data.order.admin_notes || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setStatusFeedback('');

    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_status: orderStatus,
          courier_name: courierName,
          tracking_reference: trackingRef,
          admin_notes: adminNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusFeedback('Order fulfilment status updated successfully.');
        loadOrder();
      } else {
        alert(data.error || 'Failed to update order');
      }
    } catch {
      alert('Error updating order');
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmManualPayment = async () => {
    setConfirmingPayment(true);
    try {
      const res = await fetch('/api/payments/manual-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order?.id,
          reference: `MANUAL-ADM-${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPaymentModalOpen(false);
        setStatusFeedback('Payment confirmed and recorded successfully.');
        loadOrder();
      } else {
        alert(data.error || 'Payment confirmation failed');
      }
    } catch {
      alert('Error confirming payment');
    } finally {
      setConfirmingPayment(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="py-24 text-center text-xs text-charcoal-500 font-semibold max-w-5xl mx-auto">
        Loading order details...
      </div>
    );
  }

  const statusInfo = getOrderStatusLabel(order.order_status);
  const paymentInfo = getPaymentStatusLabel(order.payment_status);

  let deliveryAddressObj: any = null;
  if (order.delivery_address) {
    try {
      deliveryAddressObj = typeof order.delivery_address === 'string' ? JSON.parse(order.delivery_address) : order.delivery_address;
    } catch {}
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2.5 bg-white hover:bg-rose-50 text-charcoal-700 border border-rose-200/90 rounded-xl transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif font-bold text-2xl text-charcoal-900">
                Order #{order.order_number}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${paymentInfo.color}`}>
                {paymentInfo.label}
              </span>
            </div>
            <p className="text-xs text-charcoal-500 mt-1">
              Placed on {formatDate(order.created_at)} • <span className="uppercase font-semibold text-charcoal-700">{order.fulfilment_type}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={`/api/invoice/${order.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white hover:bg-rose-50 text-charcoal-800 border border-rose-200/90 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-brand-600" />
            <span>Print Invoice</span>
          </a>

          {order.payment_status !== 'paid' && (
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-soft transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Payment</span>
            </button>
          )}
        </div>
      </div>

      {statusFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* Main Grid: Details + Status Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Items & Customer Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Order Items Table */}
          <div className="bg-white p-6 rounded-2xl border border-rose-200/80 shadow-card space-y-4">
            <h3 className="font-serif font-bold text-base text-charcoal-900 pb-2 border-b border-rose-100">
              Purchased Items ({order.items?.length || 0})
            </h3>

            <div className="divide-y divide-rose-100/70">
              {order.items?.map((item) => (
                <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=80'}
                      alt={item.product_name}
                      className="w-12 h-12 rounded-xl object-cover bg-rose-50 border border-rose-200/80 shrink-0"
                    />
                    <div>
                      <span className="font-semibold text-charcoal-900 block">{item.product_name}</span>
                      <span className="text-[10px] text-charcoal-500 font-mono">SKU: {item.sku}</span>
                      <p className="text-[11px] text-charcoal-500">
                        Qty: {item.quantity} × {formatGHS(item.unit_price)}
                      </p>
                    </div>
                  </div>

                  <span className="font-serif font-bold text-charcoal-900 text-sm">
                    {formatGHS(item.total_price)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-rose-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-charcoal-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-charcoal-900">{formatGHS(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-charcoal-600">
                <span>Delivery Charge</span>
                <span className="font-semibold text-charcoal-900">{formatGHS(order.delivery_fee)}</span>
              </div>
              <div className="pt-2 border-t border-rose-100 flex items-center justify-between text-sm">
                <span className="font-bold text-charcoal-900">Grand Total Amount</span>
                <span className="font-serif font-bold text-lg text-brand-700">{formatGHS(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Address Information */}
          <div className="bg-white p-6 rounded-2xl border border-rose-200/80 shadow-card space-y-4">
            <h3 className="font-serif font-bold text-base text-charcoal-900 pb-2 border-b border-rose-100">
              Customer &amp; Fulfilment Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-charcoal-700">
              <div>
                <span className="text-charcoal-500 font-bold uppercase text-[10px] block mb-1">Customer Details</span>
                <p className="font-semibold text-charcoal-900 text-sm">{order.customer_name}</p>
                <p className="text-charcoal-600">{order.customer_email}</p>
                <p className="text-charcoal-600">{order.customer_phone}</p>
                <p className="text-[11px] text-charcoal-500 mt-1">{order.is_guest ? 'Guest Checkout' : 'Registered Customer'}</p>
              </div>

              <div>
                <span className="text-charcoal-500 font-bold uppercase text-[10px] block mb-1">
                  {order.fulfilment_type === 'delivery' ? 'Delivery Destination' : 'Pickup Hub'}
                </span>
                {order.fulfilment_type === 'delivery' && deliveryAddressObj ? (
                  <div className="space-y-1">
                    <p className="font-medium text-charcoal-900">{deliveryAddressObj.street}</p>
                    {deliveryAddressObj.landmark && <p className="text-charcoal-600">Landmark/GPS: {deliveryAddressObj.landmark}</p>}
                    <p className="text-charcoal-600">{deliveryAddressObj.city}, {deliveryAddressObj.region}</p>
                    {deliveryAddressObj.scheduled_slot && <p className="text-gold-700 text-[11px] font-medium">Slot: {deliveryAddressObj.scheduled_slot}</p>}
                  </div>
                ) : (
                  <p className="text-charcoal-900">Store Pickup at East Legon Flagship.</p>
                )}
              </div>
            </div>

            {order.customer_notes && (
              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200 text-xs">
                <span className="text-charcoal-700 font-bold block mb-0.5">Customer Delivery Notes:</span>
                <p className="text-charcoal-600">{order.customer_notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Status Controls & Dispatch Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-rose-200/80 shadow-card space-y-5">
            <h3 className="font-serif font-bold text-base text-charcoal-900 pb-2 border-b border-rose-100">
              Fulfilment &amp; Courier Controls
            </h3>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1.5">
                  Update Order Status
                </label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 font-medium focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                >
                  <option value="order_placed">Order Placed</option>
                  <option value="awaiting_payment">Awaiting Payment</option>
                  <option value="payment_confirmed">Payment Confirmed</option>
                  <option value="processing">Processing &amp; Packaging</option>
                  <option value="ready_for_dispatch">Ready for Dispatch</option>
                  <option value="dispatched">Dispatched with Courier</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered to Recipient</option>
                  <option value="ready_for_pickup">Ready for Pickup</option>
                  <option value="collected">Collected by Customer</option>
                  <option value="cancelled">Cancelled (Restore Stock)</option>
                </select>
              </div>

              <div>
                <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1.5">
                  Assigned Courier / Rider Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. BAGm Express (Kwame / +233240000000)"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1.5">
                  Tracking Reference / Waybill #
                </label>
                <input
                  type="text"
                  placeholder="e.g. BAGM-EXP-4491"
                  value={trackingRef}
                  onChange={(e) => setTrackingRef(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 font-mono placeholder-charcoal-400 focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-[11px] text-charcoal-700 block mb-1.5">
                  Internal Administrative Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Add private operational notes visible only to staff..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold transition-all flex items-center justify-center gap-2 shadow-soft cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{updating ? 'Saving Status...' : 'Save Fulfilment Updates'}</span>
              </button>
            </form>
          </div>

          {/* Payment Method Summary */}
          <div className="bg-white p-6 rounded-2xl border border-rose-200/80 shadow-card space-y-3 text-xs">
            <h4 className="font-bold text-charcoal-900 uppercase text-[11px] tracking-wider">Payment Metadata</h4>
            <div className="space-y-1.5 text-charcoal-600">
              <p>Method: <strong className="text-charcoal-900">{getPaymentMethodLabel(order.payment_method)}</strong></p>
              <p>Status: <strong className="text-charcoal-900 capitalize">{order.payment_status}</strong></p>
              {order.payment_reference && (
                <p>Gateway Reference: <strong className="text-charcoal-900 font-mono">{order.payment_reference}</strong></p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Payment Confirmation Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-rose-200 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="font-serif font-bold text-xl text-charcoal-900 text-center">
              Confirm Payment Receipt
            </h3>

            <p className="text-xs text-charcoal-600 text-center leading-relaxed">
              Are you sure you have verified the credit of <strong className="text-emerald-700 font-bold">{formatGHS(order.total_amount)}</strong> for order <strong className="text-charcoal-900">#{order.order_number}</strong>?
            </p>

            <p className="text-[11px] text-charcoal-500 bg-rose-50/50 p-3 rounded-xl border border-rose-200">
              This action will mark the order as <strong>Paid</strong>, update order status to <strong>Payment Confirmed</strong>, and record an administrative audit log.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-rose-200 text-charcoal-700 font-semibold text-xs hover:bg-rose-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmingPayment}
                onClick={handleConfirmManualPayment}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-soft transition-all"
              >
                {confirmingPayment ? 'Verifying...' : 'Yes, Confirm Paid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
