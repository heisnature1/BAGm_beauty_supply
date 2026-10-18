'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatGHS, formatDate, getOrderStatusLabel, getPaymentStatusLabel } from '@/lib/utils';
import { Address, Order, ReturnRequest } from '@/types';
import Link from 'next/link';
import {
  User,
  Package,
  MapPin,
  Heart,
  RotateCcw,
  LogOut,
  Plus,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building,
  Truck,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

function AccountDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'orders';

  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'returns' | 'profile'>(initialTab as any);

  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Add Address Modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addrTitle, setAddrTitle] = useState('Home');
  const [addrFirst, setAddrFirst] = useState('');
  const [addrLast, setAddrLast] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrCity, setAddrCity] = useState('Accra');
  const [addrRegion, setAddrRegion] = useState('Greater Accra');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/account/login');
    }
  }, [user, loading, router]);

  const loadAccountData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setAddresses(data.addresses || []);
        setReturns(data.returns || []);
      }
    } catch (e) {
      console.error('Failed to load user account data', e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAccountData();
    }
  }, [user]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: addrTitle,
          first_name: addrFirst || user?.first_name,
          last_name: addrLast || user?.last_name,
          phone: addrPhone || user?.phone,
          street_address: addrStreet,
          landmark_or_gps: addrLandmark,
          city: addrCity,
          region: addrRegion,
          is_default: addrIsDefault ? 1 : 0,
        }),
      });
      if (res.ok) {
        setShowAddressModal(false);
        setAddrStreet('');
        setAddrLandmark('');
        loadAccountData();
      }
    } catch (err) {
      console.error('Failed to save address', err);
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await fetch(`/api/account/addresses?id=${id}`, { method: 'DELETE' });
      loadAccountData();
    } catch {}
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-blush-light flex items-center justify-center">
        <p className="text-xs text-charcoal-500 font-semibold">Loading your account...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blush-light flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* User Welcome Header */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-800 font-serif font-bold text-2xl flex items-center justify-center border border-brand-200">
                {user.first_name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif font-bold text-2xl text-charcoal-900">
                    Hello, {user.first_name} {user.last_name}
                  </h1>
                  {user.role === 'admin' && (
                    <span className="bg-brand-700 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-charcoal-500 mt-0.5">{user.email} • {user.phone || 'Ghana'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-800 rounded-xl text-xs font-bold border border-brand-200"
                >
                  Admin Control Panel &rarr;
                </Link>
              )}
              <button
                onClick={() => logout()}
                className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-brand-200">
            {[
              { id: 'orders', label: 'Order History', icon: Package, count: orders.length },
              { id: 'addresses', label: 'Saved Addresses', icon: MapPin, count: addresses.length },
              { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw, count: returns.length },
              { id: 'profile', label: 'Account Profile', icon: User },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white text-charcoal-600 hover:bg-brand-50 hover:text-brand-700 border border-brand-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-charcoal-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-brand-100 shadow-card space-y-4">
                  <Package className="w-12 h-12 text-brand-300 mx-auto" />
                  <h3 className="font-serif font-bold text-xl text-charcoal-900">No Orders Placed Yet</h3>
                  <p className="text-xs sm:text-sm text-charcoal-500 max-w-sm mx-auto">
                    When you purchase skincare and beauty formulations, your orders and receipts will appear here.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
                  >
                    <span>Browse Formulations</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => {
                    const statusInfo = getOrderStatusLabel(ord.order_status);
                    const paymentInfo = getPaymentStatusLabel(ord.payment_status);

                    return (
                      <div
                        key={ord.id}
                        className="bg-white rounded-3xl p-6 border border-brand-100 shadow-card hover:border-brand-200 transition-all space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-base text-charcoal-900">
                                #{ord.order_number}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${paymentInfo.color}`}>
                                {paymentInfo.label}
                              </span>
                            </div>
                            <p className="text-xs text-charcoal-400 mt-1">
                              Placed on {formatDate(ord.created_at)} • {ord.fulfilment_type === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={`/api/invoice/${ord.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-charcoal-600 hover:text-brand-700 bg-gray-50 hover:bg-brand-50 rounded-xl text-xs font-semibold flex items-center gap-1 border border-gray-200 transition-colors"
                              title="Download PDF Receipt"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Receipt</span>
                            </a>
                            <Link
                              href={`/account/orders/${ord.id}`}
                              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs"
                            >
                              <span>View Details</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-charcoal-500 font-medium">
                            {ord.items?.length || 1} {ord.items?.length === 1 ? 'item' : 'items'}
                          </span>
                          <span className="font-serif font-bold text-base text-charcoal-900">
                            Total: {formatGHS(ord.total_amount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Addresses */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-xl text-charcoal-900">Saved Addresses</h3>
                  <p className="text-xs text-charcoal-500 mt-0.5">Manage your delivery destinations in Ghana.</p>
                </div>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Address</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-brand-100 shadow-card space-y-3">
                  <MapPin className="w-10 h-10 text-brand-300 mx-auto" />
                  <p className="text-xs sm:text-sm text-charcoal-600">No saved addresses yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="bg-white rounded-3xl p-6 border border-brand-100 shadow-card flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-1.5 text-xs text-charcoal-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-charcoal-900">{addr.title}</span>
                          {addr.is_default === 1 && (
                            <span className="bg-brand-100 text-brand-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              Default Address
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-charcoal-800">{addr.first_name} {addr.last_name}</p>
                        <p>{addr.street_address}</p>
                        {addr.landmark_or_gps && <p className="text-charcoal-500">Landmark/GPS: {addr.landmark_or_gps}</p>}
                        <p>{addr.city}, {addr.region}</p>
                        <p className="text-charcoal-500">Phone: {addr.phone}</p>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Returns & Refunds */}
          {activeTab === 'returns' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif font-bold text-xl text-charcoal-900">Your Return &amp; Refund Requests</h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Track the inspection, status, and refund resolution of your eligible return requests.
                </p>
              </div>

              {returns.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-brand-100 shadow-card space-y-3">
                  <RotateCcw className="w-10 h-10 text-brand-300 mx-auto" />
                  <p className="text-xs sm:text-sm text-charcoal-600">No active return or refund requests.</p>
                  <p className="text-xs text-charcoal-400">
                    To request a return for an eligible delivered item, open the specific order details in your Order History.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {returns.map((ret) => (
                    <div key={ret.id} className="bg-white rounded-3xl p-6 border border-brand-100 shadow-card space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-sm text-charcoal-900">#{ret.return_number}</span>
                          <span className="text-xs text-charcoal-400 ml-2">({formatDate(ret.created_at)})</span>
                        </div>
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full capitalize">
                          {ret.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-700"><strong>Reason:</strong> {ret.reason.replace('_', ' ')}</p>
                      <p className="text-xs text-charcoal-600"><strong>Explanation:</strong> {ret.explanation}</p>
                      {ret.refund_amount > 0 && (
                        <p className="text-xs font-bold text-brand-700">
                          Refund Amount: {formatGHS(ret.refund_amount)} ({ret.refund_method || 'Original Payment'})
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Profile */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-100 shadow-card space-y-6 max-w-xl">
              <h3 className="font-serif font-bold text-xl text-charcoal-900">Account Profile</h3>

              <div className="space-y-3 text-xs text-charcoal-700">
                <div>
                  <span className="text-charcoal-400 block font-bold uppercase text-[10px]">Name</span>
                  <span className="font-semibold text-sm">{user.first_name} {user.last_name}</span>
                </div>
                <div>
                  <span className="text-charcoal-400 block font-bold uppercase text-[10px]">Email Address</span>
                  <span className="font-semibold text-sm">{user.email}</span>
                </div>
                <div>
                  <span className="text-charcoal-400 block font-bold uppercase text-[10px]">Phone Number</span>
                  <span className="font-semibold text-sm">{user.phone || 'None provided'}</span>
                </div>
                <div>
                  <span className="text-charcoal-400 block font-bold uppercase text-[10px]">Account Created</span>
                  <span>{formatDate(user.created_at)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Link
                  href="/account/reset-password"
                  className="text-xs font-semibold text-brand-700 hover:underline"
                >
                  Change Account Password &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-brand-100">
            <h3 className="font-serif font-bold text-xl text-charcoal-900 mb-4">Add Delivery Address</h3>
            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-charcoal-700 block mb-1">Label / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Home, Office, Kumasi Residence"
                  value={addrTitle}
                  onChange={(e) => setAddrTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="font-bold text-charcoal-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. House 14, Boundary Road"
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="font-bold text-charcoal-700 block mb-1">Landmark / Digital Address</label>
                <input
                  type="text"
                  placeholder="e.g. Near A&C Mall, GA-183-9022"
                  value={addrLandmark}
                  onChange={(e) => setAddrLandmark(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-charcoal-700 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-charcoal-700 block mb-1">Region</label>
                  <input
                    type="text"
                    required
                    value={addrRegion}
                    onChange={(e) => setAddrRegion(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addrIsDefault}
                  onChange={(e) => setAddrIsDefault(e.target.checked)}
                  className="rounded text-brand-600"
                />
                <span className="text-xs text-charcoal-700 font-medium">Set as default address</span>
              </label>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-charcoal-600 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSaving}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold"
                >
                  {addressSaving ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function AccountDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-blush-light flex items-center justify-center text-xs text-charcoal-500">Loading account...</div>}>
      <AccountDashboardContent />
    </Suspense>
  );
}
