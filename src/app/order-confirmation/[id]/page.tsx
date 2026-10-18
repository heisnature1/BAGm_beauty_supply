import React from 'react';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { formatGHS, formatDate, getOrderStatusLabel, getPaymentMethodLabel, getPaymentStatusLabel } from '@/lib/utils';
import Link from 'next/link';
import {
  CheckCircle2,
  Package,
  Printer,
  ArrowRight,
  Truck,
  Building,
  ShieldCheck,
  CreditCard,
  Banknote,
  Smartphone,
  Copy,
} from 'lucide-react';
import { OrderConfetti } from './OrderConfetti';

export const revalidate = 0;

interface OrderConfirmationPageProps {
  params: { id: string };
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const db = getDb();
  const order = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(params.id, params.id) as any;

  if (!order) {
    notFound();
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id) as any[];
  const settings = db.prepare('SELECT * FROM store_settings WHERE id = ?').get('default') as any;

  let deliveryAddressObj: any = null;
  if (order.delivery_address) {
    try {
      deliveryAddressObj = JSON.parse(order.delivery_address);
    } catch {}
  }

  let pickupLocation: any = null;
  if (order.pickup_location_id) {
    pickupLocation = db.prepare('SELECT * FROM pickup_locations WHERE id = ?').get(order.pickup_location_id) as any;
  }

  const statusInfo = getOrderStatusLabel(order.order_status);
  const paymentStatusInfo = getPaymentStatusLabel(order.payment_status);

  return (
    <div className="min-h-screen bg-blush-light flex flex-col">
      <OrderConfetti />
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Success Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-100 shadow-luxury text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-xs font-bold uppercase tracking-wider">
              <span>Order Received Successfully</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
              Thank You, {order.customer_name}!
            </h1>

            <p className="text-xs sm:text-sm text-charcoal-600 max-w-lg mx-auto leading-relaxed">
              We have received your order <strong className="text-charcoal-900">#{order.order_number}</strong>. A confirmation receipt has been sent to <strong className="text-brand-700">{order.customer_email}</strong>.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href={`/api/invoice/${order.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-charcoal-700 text-xs font-semibold shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4 text-brand-600" />
                <span>Download / Print Receipt (PDF)</span>
              </a>

              <Link
                href={`/track-order?ref=${order.order_number}&email=${encodeURIComponent(order.customer_email)}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <Package className="w-4 h-4" />
                <span>Track Live Fulfilment Status</span>
              </Link>
            </div>
          </div>

          {/* Bank Transfer Instructions Callout (if Bank Transfer) */}
          {order.payment_method === 'bank_transfer' && order.payment_status !== 'paid' && (
            <div className="bg-amber-50 rounded-3xl p-6 sm:p-8 border border-amber-200 space-y-4">
              <div className="flex items-center gap-2.5 text-amber-900 font-serif font-bold text-lg">
                <Banknote className="w-5 h-5 text-amber-700" />
                <span>Direct Bank Transfer Payment Instructions</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                Please transfer the exact amount of <strong className="text-amber-950 font-bold">{formatGHS(order.total_amount)}</strong> using your Order Number <strong className="text-amber-950">#{order.order_number}</strong> as the payment description / reference.
              </p>

              <div className="bg-white p-5 rounded-2xl border border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-charcoal-800 font-mono">
                <div>
                  <span className="text-charcoal-400 block font-sans text-[10px] uppercase font-bold">Bank Name</span>
                  <span className="font-bold">{settings.bank_name || 'Ghana Commercial Bank (GCB)'}</span>
                </div>
                <div>
                  <span className="text-charcoal-400 block font-sans text-[10px] uppercase font-bold">Account Name</span>
                  <span className="font-bold">{settings.bank_account_name || 'BAGM BEAUTY SUPPLY LTD'}</span>
                </div>
                <div>
                  <span className="text-charcoal-400 block font-sans text-[10px] uppercase font-bold">Account Number</span>
                  <span className="font-bold text-brand-700 text-sm">{settings.bank_account_number || '1021134567890'}</span>
                </div>
                <div>
                  <span className="text-charcoal-400 block font-sans text-[10px] uppercase font-bold">Branch</span>
                  <span className="font-bold">{settings.bank_branch || 'East Legon Branch, Accra'}</span>
                </div>
              </div>
              <p className="text-[11px] text-amber-700">
                Once transferred, our store administrator will verify the credit and immediately dispatch your order.
              </p>
            </div>
          )}

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fulfilment Info */}
            <div className="bg-white rounded-3xl p-6 border border-brand-100 shadow-card space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                {order.fulfilment_type === 'delivery' ? (
                  <Truck className="w-5 h-5 text-brand-600" />
                ) : (
                  <Building className="w-5 h-5 text-brand-600" />
                )}
                <h3 className="font-serif font-bold text-base text-charcoal-900">
                  {order.fulfilment_type === 'delivery' ? 'Delivery Information' : 'Store Pickup Information'}
                </h3>
              </div>

              {order.fulfilment_type === 'delivery' && deliveryAddressObj ? (
                <div className="space-y-2 text-xs text-charcoal-600 leading-relaxed">
                  <p><strong>Recipient:</strong> {order.customer_name} ({order.customer_phone})</p>
                  <p><strong>Street Address:</strong> {deliveryAddressObj.street}</p>
                  {deliveryAddressObj.landmark && (
                    <p><strong>Landmark / Digital Address:</strong> {deliveryAddressObj.landmark}</p>
                  )}
                  <p><strong>City / Region:</strong> {deliveryAddressObj.city}, {deliveryAddressObj.region}</p>
                  {deliveryAddressObj.scheduled_slot && (
                    <p><strong>Preferred Time Slot:</strong> {deliveryAddressObj.scheduled_slot}</p>
                  )}
                </div>
              ) : pickupLocation ? (
                <div className="space-y-2 text-xs text-charcoal-600 leading-relaxed">
                  <p><strong>Pickup Hub:</strong> {pickupLocation.name}</p>
                  <p><strong>Address:</strong> {pickupLocation.address}</p>
                  <p><strong>Operating Hours:</strong> {pickupLocation.operating_hours}</p>
                  <p><strong>Phone:</strong> {pickupLocation.phone}</p>
                </div>
              ) : (
                <p className="text-xs text-charcoal-500">Store Pickup at East Legon Flagship.</p>
              )}
            </div>

            {/* Payment & Order Status */}
            <div className="bg-white rounded-3xl p-6 border border-brand-100 shadow-card space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <CreditCard className="w-5 h-5 text-brand-600" />
                <h3 className="font-serif font-bold text-base text-charcoal-900">Payment &amp; Status</h3>
              </div>

              <div className="space-y-2.5 text-xs text-charcoal-700">
                <div className="flex items-center justify-between">
                  <span>Order Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payment Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${paymentStatusInfo.color}`}>
                    {paymentStatusInfo.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payment Method:</span>
                  <span className="font-semibold">{getPaymentMethodLabel(order.payment_method)}</span>
                </div>
                {order.payment_reference && (
                  <div className="flex items-center justify-between">
                    <span>Reference:</span>
                    <span className="font-mono text-[11px] text-charcoal-500">{order.payment_reference}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Date Placed:</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-100 shadow-card space-y-4">
            <h3 className="font-serif font-bold text-lg text-charcoal-900 pb-3 border-b border-gray-100">
              Purchased Formulations ({items.length})
            </h3>

            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100'}
                      alt={item.product_name}
                      className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0"
                    />
                    <div>
                      <h4 className="font-medium text-xs sm:text-sm text-charcoal-900">{item.product_name}</h4>
                      {item.variant_name && <p className="text-[11px] text-charcoal-400">Option: {item.variant_name}</p>}
                      <p className="text-[11px] text-charcoal-400">Qty: {item.quantity} × {formatGHS(item.unit_price)}</p>
                    </div>
                  </div>

                  <span className="font-serif font-bold text-sm sm:text-base text-charcoal-900">
                    {formatGHS(item.total_price)}
                  </span>
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
                <span className="font-bold text-charcoal-900">Total Amount Paid / Payable</span>
                <span className="font-serif font-bold text-2xl text-brand-700">{formatGHS(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Continue Shopping CTA */}
          <div className="text-center pt-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md transition-all"
            >
              <span>Continue Shopping at BAGm Beauty</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
