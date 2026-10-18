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
        body: JSON.stringify({ orderId: order?.id }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPaymentModalOpen(false);
        loadOrder();
      } else {
        alert(data.error || 'Failed to confirm manual payment');
      }
    } catch {
      alert('Error confirming manual payment');
    } finally {
      setConfirmingPayment(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="py-12 text-center text-xs text-charcoal-500 font-semibold">
        Loading order #{params.id}...
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
            className="p-2 bg-charcoal-800 hover:bg-charcoal-700 text-white rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-2xl text-white">
                Order #{order.order_number}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${paymentInfo.color}`}>
                {paymentInfo.label}
              </span>
            </div>
            <p className="text-xs text-charcoal-400 mt-1">
              Placed on {formatDate(order.created_at)} • {order.fulfilment_type.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={`/api/invoice/${order.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-brand-400" />
            <span>Print Invoice / Slip</span>
          </a>

          {order.payment_status !== 'paid' && (
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Payment Receipt</span>
            </button>
          )}
        </div>
      </div>

      {statusFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* Main Grid: Details + Status Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Items & Customer Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Order Items Table */}
          <div className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-4">
            <h3 className="font-serif font-bold text-base text-white pb-2 border-b border-charcoal-800">
              Purchased Items ({order.items?.length || 0})
            </h3>

            <div className="divide-y divide-charcoal-800">
              {order.items?.map((item) => (
                <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=80'}
                      alt={item.product_name}
                      className="w-12 h-12 rounded-xl object-cover bg-charcoal-900 border border-charcoal-800 shrink-0"
                    />
                    <div>
                      <span className="font-semibold text-white block">{item.product_name}</span>
                      <span className="text-[10px] text-charcoal-400 font-mono">SKU: {item.sku}</span>
                      <p className="text-[11px] text-charcoal-500">
                        Qty: {item.quantity} × {formatGHS(item.unit_price)} (Cost: {formatGHS(item.cost_price)})
                      </p>
                    </div>
                  </div>

                  <span className="font-serif font-bold text-white text-sm">
                    {formatGHS(item.total_price)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-charcoal-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-charcoal-400">
                <span>Items Subtotal</span>
                <span className="font-semibold text-white">{formatGHS(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-charcoal-400">
                <span>Delivery Charge</span>
                <span className="font-semibold text-white">{formatGHS(order.delivery_fee)}</span>
              </div>
              <div className="pt-2 border-t border-charcoal-800 flex items-center justify-between text-sm">
                <span className="font-bold text-white">Grand Total Amount</span>
                <span className="font-serif font-bold text-lg text-brand-400">{formatGHS(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Address Information */}
          <div className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-4">
            <h3 className="font-serif font-bold text-base text-white pb-2 border-b border-charcoal-800">
              Customer &amp; Fulfilment Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-charcoal-300">
              <div>
                <span className="text-charcoal-500 font-bold uppercase text-[10px] block mb-1">Customer Details</span>
                <p className="font-semibold text-white text-sm">{order.customer_name}</p>
                <p className="text-charcoal-400">{order.customer_email}</p>
                <p className="text-charcoal-400">{order.customer_phone}</p>
                <p className="text-[11px] text-charcoal-500 mt-1">{order.is_guest ? 'Guest Checkout' : 'Registered Customer'}</p>
              </div>

              <div>
                <span className="text-charcoal-500 font-bold uppercase text-[10px] block mb-1">
                  {order.fulfilment_type === 'delivery' ? 'Delivery Destination' : 'Pickup Hub'}
                </span>
                {order.fulfilment_type === 'delivery' && deliveryAddressObj ? (
                  <div className="space-y-1">
                    <p className="font-medium text-white">{deliveryAddressObj.street}</p>
                    {deliveryAddressObj.landmark && <p className="text-charcoal-400">Landmark/GPS: {deliveryAddressObj.landmark}</p>}
                    <p className="text-charcoal-400">{deliveryAddressObj.city}, {deliveryAddressObj.region}</p>
                    {deliveryAddressObj.scheduled_slot && <p className="text-gold-400 text-[11px]">Slot: {deliveryAddressObj.scheduled_slot}</p>}
                  </div>
                ) : (
                  <p className="text-white">Store Pickup at East Legon Flagship.</p>
                )}
              </div>
            </div>

            {order.customer_notes && (
              <div className="p-3 bg-charcoal-900 rounded-xl border border-charcoal-800 text-xs">
                <span className="text-charcoal-400 font-bold block mb-0.5">Customer Delivery Notes:</span>
                <p className="text-charcoal-200">{order.customer_notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Status Controls & Dispatch Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-5">
            <h3 className="font-serif font-bold text-base text-white pb-2 border-b border-charcoal-800">
              Fulfilment &amp; Courier Controls
            </h3>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">
                  Update Order Status
                </label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white font-medium focus:outline-none focus:border-brand-500"
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
                <label className="font-bold uppercase text-charcoal-400 block mb-1">
                  Assigned Courier / Rider Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. BAGm Express (Kwame / +233240000000)"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">
                  Tracking Reference / Waybill #
                </label>
                <input
                  type="text"
                  placeholder="e.g. BAGM-EXP-4491"
                  value={trackingRef}
                  onChange={(e) => setTrackingRef(e.target.value)}
                  className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-charcoal-400 block mb-1">
                  Internal Administrative Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Add private operational notes visible only to admin..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{updating ? 'Saving Status...' : 'Save Fulfilment Updates'}</span>
              </button>
            </form>
          </div>

          {/* Payment Method Summary */}
          <div className="bg-charcoal-950 p-6 rounded-3xl border border-charcoal-800 space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Payment Metadata</h4>
            <div className="space-y-1.5 text-charcoal-400">
              <p>Method: <strong className="text-white">{getPaymentMethodLabel(order.payment_method)}</strong></p>
              <p>Status: <strong className="text-white capitalize">{order.payment_status}</strong></p>
              {order.payment_reference && (
                <p>Gateway Reference: <strong className="text-white font-mono">{order.payment_reference}</strong></p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Payment Confirmation Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-800">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="font-serif font-bold text-xl text-white text-center">
              Confirm Payment Receipt
            </h3>

            <p className="text-xs text-charcoal-400 text-center leading-relaxed">
              Are you sure you have verified the credit of <strong className="text-emerald-400 font-bold">{formatGHS(order.total_amount)}</strong> for order <strong className="text-white">#{order.order_number}</strong>?
            </p>

            <p className="text-[11px] text-charcoal-500 bg-charcoal-950 p-3 rounded-xl border border-charcoal-800">
              This action will mark the order as <strong>Paid</strong>, update order status to <strong>Payment Confirmed</strong>, send an automatic email receipt to the customer, and record an immutable administrative audit log.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-charcoal-700 text-charcoal-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmingPayment}
                onClick={handleConfirmManualPayment}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm"
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
