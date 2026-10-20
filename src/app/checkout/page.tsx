'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { useCart } from '@/components/providers/CartProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatGHS } from '@/lib/utils';
import { DeliveryZone, PickupLocation, PaymentMethod } from '@/types';
import {
  Truck,
  Building,
  CreditCard,
  Smartphone,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  MapPin,
  Lock,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalItems, clearCart } = useCart();
  const { user } = useAuth();

  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Form Fields
  const [fulfilmentType, setFulfilmentType] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Delivery
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmarkOrGPS, setLandmarkOrGPS] = useState('');
  const [city, setCity] = useState('Accra');
  const [region, setRegion] = useState('Greater Accra');
  const [scheduledSlot, setScheduledSlot] = useState('anytime');

  // Pickup
  const [selectedPickupId, setSelectedPickupId] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('moolre_momo');
  const [momoNetwork, setMomoNetwork] = useState<'MTN' | 'TELECEL' | 'AT'>('MTN');
  const [customerNotes, setCustomerNotes] = useState('');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Autofill if signed in
  useEffect(() => {
    if (user) {
      setCustomerName(`${user.first_name} ${user.last_name}`.trim());
      setCustomerEmail(user.email);
      if (user.phone) setCustomerPhone(user.phone);

      // Load saved addresses
      fetch('/api/auth/me')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && data.addresses && data.addresses.length > 0) {
            const def = data.addresses.find((a: any) => a.is_default) || data.addresses[0];
            setStreetAddress(def.street_address);
            if (def.landmark_or_gps) setLandmarkOrGPS(def.landmark_or_gps);
            if (def.city) setCity(def.city);
            if (def.region) setRegion(def.region);
            if (def.delivery_zone_id) setSelectedZoneId(def.delivery_zone_id);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Load zones & pickup locations
  useEffect(() => {
    fetch('/api/checkout/config')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          if (data.zones && data.zones.length > 0) {
            setDeliveryZones(data.zones);
            setSelectedZoneId((prev) => prev || data.zones[0].id);
          }
          if (data.pickups && data.pickups.length > 0) {
            setPickupLocations(data.pickups);
            setSelectedPickupId(data.pickups[0].id);
          }
        }
      })
      .catch((e) => console.error('Failed to load checkout config', e))
      .finally(() => setLoadingConfig(false));
  }, []);

  // Compute Delivery Fee
  const selectedZone = deliveryZones.find((z) => z.id === selectedZoneId);
  const deliveryFee = fulfilmentType === 'delivery' && selectedZone ? selectedZone.fee : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMessage('Your shopping bag is empty.');
      return;
    }

    if (!customerName || !customerEmail || !customerPhone) {
      setErrorMessage('Please complete all required customer contact fields.');
      return;
    }

    if (fulfilmentType === 'delivery' && (!streetAddress || !selectedZoneId)) {
      setErrorMessage('Please enter your delivery address and choose a delivery zone.');
      return;
    }

    if (fulfilmentType === 'pickup' && !selectedPickupId) {
      setErrorMessage('Please select a store pickup location.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        items,
        fulfilmentType,
        customerName,
        customerEmail,
        customerPhone,
        deliveryZoneId: fulfilmentType === 'delivery' ? selectedZoneId : null,
        deliveryAddress:
          fulfilmentType === 'delivery'
            ? {
                street: streetAddress,
                landmark: landmarkOrGPS,
                city,
                region,
                digital_address: landmarkOrGPS,
                scheduled_slot: scheduledSlot,
              }
            : null,
        pickupLocationId: fulfilmentType === 'pickup' ? selectedPickupId : null,
        paymentMethod,
        momoNetwork,
        customerNotes,
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to place order. Please review your details.');
        setSubmitting(false);
        return;
      }

      // Clear Cart on successful placement
      clearCart();

      // If gateway returned an external authorization URL (Paystack / MoMo redirect)
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        // Direct confirmation (Bank transfer / COD / Sandbox)
        router.push(`/order-confirmation/${data.orderId}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during checkout.');
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !submitting) {
    return (
      <div className="min-h-screen bg-blush-light flex flex-col">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 py-16 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-10 text-center max-w-md mx-auto border border-brand-100 shadow-card space-y-4">
            <h2 className="font-serif font-bold text-2xl text-charcoal-900">Your shopping bag is empty</h2>
            <p className="text-xs sm:text-sm text-charcoal-500">
              Please add items to your cart before proceeding to checkout.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
            >
              <span>Return to Store</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blush-light flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-brand-200/80 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-charcoal-400 mb-1">
                <Link href="/cart" className="hover:text-brand-700">Shopping Bag</Link>
                <span>/</span>
                <span className="text-brand-700 font-semibold">Secure Checkout</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
                Complete Your Order
              </h1>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-600 bg-white px-4 py-2 rounded-full border border-brand-100 shadow-xs">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>256-Bit SSL Encrypted &amp; Secure</span>
            </div>
          </div>

          <form onSubmit={handleSubmitOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Details & Payment */}
              <div className="lg:col-span-7 space-y-6">
                {errorMessage && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <p>{errorMessage}</p>
                  </div>
                )}

                {/* 1. Fulfilment Mode Toggle */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-100 shadow-card space-y-4">
                  <h3 className="font-serif font-bold text-lg text-charcoal-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center justify-center">1</span>
                    <span>Choose Fulfilment Method</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFulfilmentType('delivery')}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        fulfilmentType === 'delivery'
                          ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-200'
                          : 'border-gray-200 hover:border-brand-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-charcoal-900 flex items-center gap-2">
                          <Truck className="w-4 h-4 text-brand-600" />
                          <span>Home / Office Delivery</span>
                        </span>
                        {fulfilmentType === 'delivery' && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                      </div>
                      <p className="text-xs text-charcoal-500">
                        Express delivery across Greater Accra &amp; nationwide courier across Ghana.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFulfilmentType('pickup')}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        fulfilmentType === 'pickup'
                          ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-200'
                          : 'border-gray-200 hover:border-brand-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-charcoal-900 flex items-center gap-2">
                          <Building className="w-4 h-4 text-brand-600" />
                          <span>Store Pickup (Free)</span>
                        </span>
                        {fulfilmentType === 'pickup' && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                      </div>
                      <p className="text-xs text-charcoal-500">
                        Collect directly at our flagship East Legon beauty hub.
                      </p>
                    </button>
                  </div>
                </div>

                {/* 2. Customer Contact Details */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-100 shadow-card space-y-4">
                  <h3 className="font-serif font-bold text-lg text-charcoal-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center justify-center">2</span>
                    <span>Customer Contact Information</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold uppercase text-charcoal-700 block mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Akosua Mensah"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-charcoal-700 block mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. akosua@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                      />
                      <span className="text-[10px] text-charcoal-400 mt-1 block">Order receipt will be sent here</span>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-charcoal-700 block mb-1">
                        Ghana Telephone / MoMo Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 024 123 4567"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                      />
                      <span className="text-[10px] text-charcoal-400 mt-1 block">For delivery coordination</span>
                    </div>
                  </div>
                </div>

                {/* 3. Address / Collection Location */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-100 shadow-card space-y-4">
                  <h3 className="font-serif font-bold text-lg text-charcoal-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center justify-center">3</span>
                    <span>{fulfilmentType === 'delivery' ? 'Delivery Address & Zone' : 'Select Pickup Location'}</span>
                  </h3>

                  {fulfilmentType === 'delivery' ? (
                    <div className="space-y-4">
                      {/* Zone Selector */}
                      <div>
                        <label className="text-xs font-bold uppercase text-charcoal-700 block mb-1">
                          Delivery Zone (Ghana) <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={selectedZoneId}
                          onChange={(e) => setSelectedZoneId(e.target.value)}
                          className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white font-medium"
                        >
                          {deliveryZones.map((z) => (
                            <option key={z.id} value={z.id}>
                              {z.name} — {formatGHS(z.fee)} ({z.estimated_delivery_time})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="text-xs font-bold uppercase text-charcoal-700 block mb-1">
                            Street Address &amp; House Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. House 14, Boundary Road"
                            value={streetAddress}
                            onChange={(e) => setStreetAddress(e.target.value)}
                            className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase text-charcoal-700 block mb-1">
                            Landmark / GhanaPost GPS Digital Address
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Near A&C Mall, GA-183-9022"
                            value={landmarkOrGPS}
                            onChange={(e) => setLandmarkOrGPS(e.target.value)}
                            className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase text-charcoal-700 block mb-1">
                            City / Town
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Accra"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-xs font-bold uppercase text-charcoal-700 block mb-1">
                            Preferred Delivery Time Slot
                          </label>
                          <select
                            value={scheduledSlot}
                            onChange={(e) => setScheduledSlot(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                          >
                            <option value="anytime">Anytime during business hours (9am - 6pm)</option>
                            <option value="morning">Morning (9am - 12pm)</option>
                            <option value="afternoon">Afternoon (12pm - 5pm)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Pickup Location Selector */
                    <div className="space-y-3">
                      {pickupLocations.map((p) => {
                        const isSelected = selectedPickupId === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => setSelectedPickupId(p.id)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-200'
                                : 'border-gray-200 hover:border-brand-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-sm text-charcoal-900">{p.name}</h4>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                            </div>
                            <p className="text-xs text-charcoal-600 mt-1 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                              <span>{p.address}</span>
                            </p>
                            <p className="text-[11px] text-charcoal-500 mt-1 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                              <span>{p.operating_hours}</span>
                            </p>
                            {p.instructions && (
                              <p className="text-[11px] text-charcoal-400 mt-2 pt-2 border-t border-brand-100">
                                <strong>Collection Note:</strong> {p.instructions}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Order Notes */}
                  <div className="pt-2">
                    <label className="text-xs font-bold uppercase text-charcoal-700 block mb-1">
                      Order Notes / Delivery Instructions (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Please call when reaching the gate, or leave with reception..."
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* 4. Payment Method Selection */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-100 shadow-card space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-brand-100">
                    <h3 className="font-serif font-bold text-lg text-charcoal-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center justify-center">4</span>
                      <span>Select Payment Method (Ghana)</span>
                    </h3>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Moolre Payments Sandbox Active</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Moolre Mobile Money */}
                    <div
                      onClick={() => setPaymentMethod('moolre_momo')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === 'moolre_momo'
                          ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-200'
                          : 'border-gray-200 hover:border-brand-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === 'moolre_momo'}
                          onChange={() => setPaymentMethod('moolre_momo')}
                          className="mt-1 text-brand-600 focus:ring-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-charcoal-900 flex items-center gap-2">
                              <Smartphone className="w-4 h-4 text-brand-600" />
                              <span>Moolre Mobile Money</span>
                            </span>
                            <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                              Instant MoMo 🟡🔴🔵
                            </span>
                          </div>
                          <p className="text-xs text-charcoal-600 mt-1">
                            Pay directly via MTN Mobile Money, Telecel Cash, or AT Money. Powered by Moolre sandbox gateway.
                          </p>

                          {/* Network Selector */}
                          {paymentMethod === 'moolre_momo' && (
                            <div className="mt-3 pt-3 border-t border-brand-200/60 flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-bold text-charcoal-700">Choose Network:</span>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setMomoNetwork('MTN'); }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                  momoNetwork === 'MTN'
                                    ? 'bg-amber-400 text-charcoal-900 shadow-2xs'
                                    : 'bg-white border border-gray-200 text-charcoal-600 hover:bg-gray-50'
                                }`}
                              >
                                MTN MoMo 🟡
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setMomoNetwork('TELECEL'); }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                  momoNetwork === 'TELECEL'
                                    ? 'bg-red-500 text-white shadow-2xs'
                                    : 'bg-white border border-gray-200 text-charcoal-600 hover:bg-gray-50'
                                }`}
                              >
                                Telecel Cash 🔴
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setMomoNetwork('AT'); }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                  momoNetwork === 'AT'
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'bg-white border border-gray-200 text-charcoal-600 hover:bg-gray-50'
                                }`}
                              >
                                AT Money 🔵
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Moolre Cards */}
                    <div
                      onClick={() => setPaymentMethod('moolre_card')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === 'moolre_card'
                          ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-200'
                          : 'border-gray-200 hover:border-brand-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === 'moolre_card'}
                          onChange={() => setPaymentMethod('moolre_card')}
                          className="mt-1 text-brand-600 focus:ring-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-charcoal-900 flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-brand-600" />
                              <span>Moolre Cards (Visa &amp; Mastercard)</span>
                            </span>
                            <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              Cards 💳
                            </span>
                          </div>
                          <p className="text-xs text-charcoal-600 mt-1">
                            Secure local and international credit or debit card payment with 3D Secure verification.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Moolre Bank Transfer / QR */}
                    <div
                      onClick={() => setPaymentMethod('moolre_bank')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === 'moolre_bank'
                          ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-200'
                          : 'border-gray-200 hover:border-brand-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === 'moolre_bank'}
                          onChange={() => setPaymentMethod('moolre_bank')}
                          className="mt-1 text-brand-600 focus:ring-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-charcoal-900 flex items-center gap-2">
                              <Building className="w-4 h-4 text-brand-600" />
                              <span>Moolre Instant Bank Transfer &amp; QR</span>
                            </span>
                            <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                              Ghana QR ⚡
                            </span>
                          </div>
                          <p className="text-xs text-charcoal-600 mt-1">
                            Instant Ghana Interbank Payment (GhIPSS Instant Pay / GIP) and GhQR scan-to-pay.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Direct Bank Transfer */}
                    <div
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === 'bank_transfer'
                          ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-200'
                          : 'border-gray-200 hover:border-brand-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === 'bank_transfer'}
                          onChange={() => setPaymentMethod('bank_transfer')}
                          className="mt-1 text-brand-600 focus:ring-0"
                        />
                        <div className="flex-1">
                          <span className="font-semibold text-sm text-charcoal-900 flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-brand-600" />
                            <span>Direct Bank Transfer (Manual GCB Ghana)</span>
                          </span>
                          <p className="text-xs text-charcoal-600 mt-1">
                            Bank transfer details will be shown on the order confirmation page. Admin confirms receipt.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Cash on Delivery */}
                    <div
                      onClick={() => setPaymentMethod('cash_on_delivery')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === 'cash_on_delivery'
                          ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-200'
                          : 'border-gray-200 hover:border-brand-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === 'cash_on_delivery'}
                          onChange={() => setPaymentMethod('cash_on_delivery')}
                          className="mt-1 text-brand-600 focus:ring-0"
                        />
                        <div className="flex-1">
                          <span className="font-semibold text-sm text-charcoal-900 flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-emerald-600" />
                            <span>Cash on Delivery (COD)</span>
                          </span>
                          <p className="text-xs text-charcoal-600 mt-1">
                            Pay cash directly to the courier upon delivery across Greater Accra.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Review & Submit */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-100 shadow-card space-y-6 sticky top-28">
                  <h3 className="font-serif font-bold text-xl text-charcoal-900 pb-3 border-b border-gray-100">
                    Order Summary ({totalItems})
                  </h3>

                  {/* Items List */}
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-gray-100">
                    {items.map((item) => (
                      <div key={item.sku} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100'}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-charcoal-900 truncate">{item.name}</p>
                            <p className="text-[11px] text-charcoal-400">
                              Qty: {item.quantity} {item.variantName ? `(${item.variantName})` : ''}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-charcoal-900 shrink-0">
                          {formatGHS(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Cost Breakdown */}
                  <div className="space-y-2.5 pt-4 border-t border-gray-100 text-xs sm:text-sm">
                    <div className="flex items-center justify-between text-charcoal-600">
                      <span>Items Subtotal</span>
                      <span className="font-semibold text-charcoal-900">{formatGHS(subtotal)}</span>
                    </div>

                    <div className="flex items-center justify-between text-charcoal-600">
                      <span>
                        {fulfilmentType === 'delivery' ? 'Delivery Fee' : 'Store Pickup Fee'}
                      </span>
                      <span className="font-semibold text-charcoal-900">
                        {fulfilmentType === 'delivery' ? formatGHS(deliveryFee) : 'Free'}
                      </span>
                    </div>

                    <div className="pt-3 border-t-2 border-brand-100 flex items-center justify-between text-base">
                      <span className="font-bold text-charcoal-900">Final Total Payable</span>
                      <span className="font-serif font-bold text-2xl text-brand-700">
                        {formatGHS(grandTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <span>Securing Order &amp; Processing...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Place Order — {formatGHS(grandTotal)}</span>
                      </>
                    )}
                  </button>

                  <div className="text-[11px] text-charcoal-400 text-center space-y-1">
                    <p>By placing this order, you agree to BAGm Beauty Supply’s Store &amp; Delivery Policies.</p>
                    <p className="text-charcoal-500 font-medium">No hidden fees. Authenticity guaranteed.</p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
