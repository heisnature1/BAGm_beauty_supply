'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { formatGHS, formatDate, getOrderStatusLabel, getPaymentMethodLabel, getPaymentStatusLabel } from '@/lib/utils';
import Link from 'next/link';
import {
  Package,
  Printer,
  RotateCcw,
  Star,
  CheckCircle2,
  Truck,
  Building,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  X,
} from 'lucide-react';

export default function AccountOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Return modal state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnItem, setReturnItem] = useState<any>(null);
  const [returnReason, setReturnReason] = useState('damaged');
  const [returnExplanation, setReturnExplanation] = useState('');
  const [returnQty, setReturnQty] = useState(1);
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/account/orders/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.order) {
          setOrder(data.order);
        } else {
          setError('Order not found or unauthorized.');
        }
      })
      .catch(() => setError('Failed to load order.'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleOpenReturnModal = (item: any) => {
    setReturnItem(item);
    setReturnQty(item.quantity);
    setShowReturnModal(true);
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !returnItem) return;
    setReturnSubmitting(true);

    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          orderItemId: returnItem.id,
          quantity: returnQty,
          reason: returnReason,
          explanation: returnExplanation,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReturnSuccess(true);
        setTimeout(() => {
          setShowReturnModal(false);
          setReturnSuccess(false);
          setReturnExplanation('');
        }, 2000);
      } else {
        alert(data.error || 'Failed to submit return request');
      }
    } catch {
      alert('Error submitting return request');
    } finally {
      setReturnSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blush-light flex items-center justify-center">
        <p className="text-xs text-charcoal-500 font-semibold">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-blush-light flex flex-col">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 py-16 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 text-center max-w-md border border-brand-100 shadow-card space-y-4">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h2 className="font-serif font-bold text-xl text-charcoal-900">{error || 'Order Not Found'}</h2>
            <Link
              href="/account"
              className="inline-block px-6 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold"
            >
              Back to My Account
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isDelivered = order.order_status === 'delivered' || order.order_status === 'collected';
  const statusInfo = getOrderStatusLabel(order.order_status);
  const paymentInfo = getPaymentStatusLabel(order.payment_status);

  return (
    <div className="min-h-screen bg-blush-light flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-charcoal-400">
            <Link href="/" className="hover:text-brand-700">Home</Link>
            <span>/</span>
            <Link href="/account" className="hover:text-brand-700">Account</Link>
            <span>/</span>
            <span className="text-brand-700 font-semibold">Order #{order.order_number}</span>
          </nav>

          {/* Top Bar */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-2xl text-charcoal-900">
                  Order #{order.order_number}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-xs text-charcoal-400 mt-1">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`/api/invoice/${order.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-50 hover:bg-brand-50 border border-gray-200 text-charcoal-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4 text-brand-600" />
                <span>Download PDF Receipt</span>
              </a>
            </div>
          </div>

          {/* Items & Actions */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-100 shadow-card space-y-6">
            <h3 className="font-serif font-bold text-lg text-charcoal-900 pb-3 border-b border-gray-100">
              Purchased Items
            </h3>

            <div className="divide-y divide-gray-100">
              {order.items?.map((item: any) => (
                <div key={item.id} className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100'}
                      alt={item.product_name}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-100 shrink-0"
                    />
                    <div>
                      <h4 className="font-semibold text-sm text-charcoal-900">{item.product_name}</h4>
                      {item.variant_name && <p className="text-xs text-charcoal-500">Option: {item.variant_name}</p>}
                      <p className="text-xs text-charcoal-400">Qty: {item.quantity} × {formatGHS(item.unit_price)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-gray-50">
                    <span className="font-serif font-bold text-base text-charcoal-900">
                      {formatGHS(item.total_price)}
                    </span>

                    {/* Return Action if Delivered */}
                    {isDelivered && (
                      <button
                        onClick={() => handleOpenReturnModal(item)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-brand-50 text-charcoal-700 hover:text-brand-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Request Return</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-charcoal-600">
                <span>Subtotal</span>
                <span className="font-semibold text-charcoal-900">{formatGHS(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-charcoal-600">
                <span>Delivery Charge</span>
                <span className="font-semibold text-charcoal-900">{formatGHS(order.delivery_fee)}</span>
              </div>
              <div className="pt-3 border-t-2 border-brand-100 flex items-center justify-between text-base">
                <span className="font-bold text-charcoal-900">Total Amount</span>
                <span className="font-serif font-bold text-2xl text-brand-700">{formatGHS(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Return Request Modal */}
      {showReturnModal && returnItem && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-brand-100 relative">
            <button
              onClick={() => setShowReturnModal(false)}
              className="absolute top-5 right-5 text-charcoal-400 hover:text-charcoal-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif font-bold text-xl text-charcoal-900 mb-1">
              Request Return or Refund
            </h3>
            <p className="text-xs text-charcoal-500 mb-4">
              Item: <strong>{returnItem.product_name}</strong>
            </p>

            {returnSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-serif font-bold text-emerald-900">Return Request Submitted</h4>
                <p className="text-xs text-emerald-700">
                  Our team will review your request and contact you regarding collection or return inspection.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReturn} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-charcoal-700 block mb-1">Return Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max={returnItem.quantity}
                    value={returnQty}
                    onChange={(e) => setReturnQty(parseInt(e.target.value, 10) || 1)}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-charcoal-700 block mb-1">Reason for Return</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="damaged">Damaged in transit</option>
                    <option value="defective">Defective packaging / leak</option>
                    <option value="wrong_item_received">Incorrect product received</option>
                    <option value="allergic_reaction">Adverse reaction / sensitivity</option>
                    <option value="policy_allowed_other">Other policy reason</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-charcoal-700 block mb-1">Explanation &amp; Details</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Please explain the issue in detail..."
                    value={returnExplanation}
                    onChange={(e) => setReturnExplanation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReturnModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={returnSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold"
                  >
                    {returnSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
