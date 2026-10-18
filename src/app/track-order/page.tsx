'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { formatGHS, formatDate, getOrderStatusLabel, getPaymentMethodLabel, getPaymentStatusLabel } from '@/lib/utils';
import Link from 'next/link';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Building,
  AlertCircle,
  Printer,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  const initialEmail = searchParams.get('email') || '';

  const [orderRef, setOrderRef] = useState(initialRef);
  const [emailOrPhone, setEmailOrPhone] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  const fetchTracking = async (ref: string, contact: string) => {
    if (!ref.trim() || !contact.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/track?ref=${encodeURIComponent(ref.trim())}&contact=${encodeURIComponent(contact.trim())}`);
      const data = await res.json();
      if (res.ok && data.success && data.order) {
        setOrder(data.order);
      } else {
        setError(data.error || 'No matching order found. Please check your order number and email/phone.');
      }
    } catch {
      setError('Failed to retrieve order tracking. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef && initialEmail) {
      fetchTracking(initialRef, initialEmail);
    }
  }, [initialRef, initialEmail]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(orderRef, emailOrPhone);
  };

  // Timeline Step Status Mapping
  const getTimelineSteps = (currentStatus: string, fulfilmentType: string) => {
    const isPickup = fulfilmentType === 'pickup';

    const steps = [
      { key: 'order_placed', label: 'Order Placed', desc: 'Order received into our system.' },
      { key: 'payment_confirmed', label: 'Payment Confirmed', desc: 'Payment verified and authorized.' },
      { key: 'processing', label: 'Processing & Packaging', desc: 'Items being carefully assembled.' },
      {
        key: isPickup ? 'ready_for_pickup' : 'dispatched',
        label: isPickup ? 'Ready for Pickup' : 'Dispatched with Courier',
        desc: isPickup ? 'Ready at East Legon Flagship' : 'Handed over for local delivery.',
      },
      {
        key: isPickup ? 'collected' : 'delivered',
        label: isPickup ? 'Collected' : 'Delivered',
        desc: isPickup ? 'Collected by customer.' : 'Delivered to recipient address.',
      },
    ];

    const statusRanks: Record<string, number> = {
      order_placed: 0,
      awaiting_payment: 0,
      payment_confirmed: 1,
      processing: 2,
      ready_for_dispatch: 2,
      dispatched: 3,
      out_for_delivery: 3,
      ready_for_pickup: 3,
      delivered: 4,
      collected: 4,
      cancelled: -1,
      return_requested: 4,
      returned: 4,
      refunded: 4,
    };

    const currentRank = statusRanks[currentStatus] !== undefined ? statusRanks[currentStatus] : 0;

    return { steps, currentRank, isCancelled: currentStatus === 'cancelled' };
  };

  return (
    <div className="min-h-screen bg-blush-light flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold">
              <Package className="w-3.5 h-3.5 text-brand-600" />
              <span>Real-Time Fulfilment Tracking</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
              Track Your Order
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500">
              Enter your BAGm Order Reference and your email or phone number to check status.
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-100 shadow-card">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              <div className="sm:col-span-5">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                  Order Reference / Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BAGM-2026-1082"
                  value={orderRef}
                  onChange={(e) => setOrderRef(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 uppercase font-mono"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
                  Email or Ghana Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. akosua@example.com or 024XXXXXXX"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {loading ? (
                    <span>Checking...</span>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Track</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Tracking Result Card */}
          {order && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-100 shadow-luxury space-y-8">
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
                  <div>
                    <span className="text-xs text-charcoal-400 font-medium">Order Reference</span>
                    <h2 className="font-serif font-bold text-2xl text-charcoal-900 mt-0.5">
                      #{order.order_number}
                    </h2>
                    <p className="text-xs text-charcoal-500 mt-1">
                      Placed on {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getOrderStatusLabel(order.order_status).color}`}>
                      {getOrderStatusLabel(order.order_status).label}
                    </span>
                    <a
                      href={`/api/invoice/${order.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-charcoal-700 text-xs font-semibold transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </a>
                  </div>
                </div>

                {/* Timeline Progress */}
                {(() => {
                  const { steps, currentRank, isCancelled } = getTimelineSteps(
                    order.order_status,
                    order.fulfilment_type
                  );

                  if (isCancelled) {
                    return (
                      <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs">
                        <strong>Order Cancelled:</strong> This order has been cancelled and will not be fulfilled.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      <h3 className="font-serif font-bold text-base text-charcoal-900">
                        Fulfilment Progress
                      </h3>

                      <div className="relative grid grid-cols-1 sm:grid-cols-5 gap-4">
                        {steps.map((st, index) => {
                          const isComplete = currentRank >= index;
                          const isCurrent = currentRank === index;

                          return (
                            <div key={st.key} className="flex sm:flex-col items-start gap-3 sm:gap-2">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                                  isComplete
                                    ? 'bg-brand-600 text-white'
                                    : 'bg-gray-100 text-charcoal-400 border border-gray-200'
                                }`}
                              >
                                {isComplete ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                              </div>

                              <div>
                                <h4 className={`text-xs font-bold ${isCurrent ? 'text-brand-700' : 'text-charcoal-900'}`}>
                                  {st.label}
                                </h4>
                                <p className="text-[11px] text-charcoal-400 mt-0.5">{st.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Dispatch Details / Courier Note */}
                {(order.courier_name || order.tracking_reference) && (
                  <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-100 text-xs text-charcoal-700 space-y-1">
                    <p className="font-bold text-brand-900">Courier &amp; Delivery Tracking Info:</p>
                    {order.courier_name && <p>Courier Service: <strong>{order.courier_name}</strong></p>}
                    {order.tracking_reference && <p>Tracking Ref / Waybill: <strong className="font-mono">{order.tracking_reference}</strong></p>}
                  </div>
                )}

                {/* Items & Financial Breakdown */}
                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <h3 className="font-serif font-bold text-base text-charcoal-900">
                    Order Items ({order.items?.length || 0})
                  </h3>

                  <div className="divide-y divide-gray-100">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image_url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=80'}
                            alt={item.product_name}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                          />
                          <div>
                            <p className="font-semibold text-charcoal-900">{item.product_name}</p>
                            <p className="text-[11px] text-charcoal-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-bold text-charcoal-900">{formatGHS(item.total_price)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
                    <span className="font-bold text-charcoal-900">Total Amount</span>
                    <span className="font-serif font-bold text-lg text-brand-700">{formatGHS(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-blush-light flex items-center justify-center text-xs text-charcoal-500">Loading order tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
