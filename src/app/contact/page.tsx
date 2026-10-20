'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<'order_inquiry' | 'product_advice' | 'delivery' | 'general'>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [storeInfo, setStoreInfo] = useState({
    address: 'Plot 42 Lagos Avenue, East Legon, Accra, Ghana',
    phone: '+233 24 123 4567 / +233 55 987 6543',
    email: 'support@bagmbeauty.com',
    hours: 'Monday – Saturday: 9:00 AM – 7:00 PM GMT',
  });

  useEffect(() => {
    fetch('/api/settings/announcement')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setStoreInfo((prev) => ({
            address: data.store_address || prev.address,
            phone: data.store_phone || prev.phone,
            email: data.store_email || prev.email,
            hours: data.store_hours || prev.hours,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, category, subject, message }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setMessage('');
      } else {
        setError(data.error || 'Failed to submit enquiry.');
      }
    } catch {
      setError('An error occurred submitting your enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-blush-light flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h1 className="font-serif font-bold text-3xl sm:text-5xl text-charcoal-900">
              Customer Support &amp; Enquiries
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500">
              Have a question about your order, delivery timeline, or skincare recommendations? Our customer care team in Accra is ready to assist you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Information Cards */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-100 shadow-card space-y-6">
                <h3 className="font-serif font-bold text-xl text-charcoal-900 pb-3 border-b border-gray-100">
                  Store Contact Details
                </h3>

                <div className="space-y-4 text-xs sm:text-sm text-charcoal-700">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-charcoal-900 font-semibold">Flagship Hub Address</strong>
                      <span>{storeInfo.address}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-charcoal-900 font-semibold">Phone &amp; Telephone</strong>
                      <span>{storeInfo.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-charcoal-900 font-semibold">Customer Email</strong>
                      <span>{storeInfo.email}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-charcoal-900 font-semibold">Operating Hours</strong>
                      <span>{storeInfo.hours}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-100 shadow-card">
                <h3 className="font-serif font-bold text-xl text-charcoal-900 mb-2">
                  Send Us a Direct Message
                </h3>
                <p className="text-xs text-charcoal-500 mb-6">
                  Fill in the details below and we will respond via email within 24 business hours.
                </p>

                {error && (
                  <div className="p-3.5 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {submitted ? (
                  <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-fade-in">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="font-serif font-bold text-lg text-emerald-900">
                      Enquiry Received
                    </h4>
                    <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                      Thank you for contacting BAGm Beauty Supply. Our customer care desk in East Legon will review your message and reply promptly.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Ama Osei"
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ama@example.com"
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Ghana Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="024 123 4567"
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Enquiry Category *
                        </label>
                        <select
                          value={category}
                          onChange={(e: any) => setCategory(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 bg-white"
                        >
                          <option value="general">General Inquiry</option>
                          <option value="order_inquiry">Order Status / Payment</option>
                          <option value="delivery">Delivery &amp; Pickup Tracking</option>
                          <option value="product_advice">Skincare Routine &amp; Product Advice</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                        Subject *
                      </label>
                      <input
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief summary of your question"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                        Message *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please provide details so we can help you as quickly as possible..."
                        className="w-full text-xs p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-soft"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? 'Sending Enquiry...' : 'Submit Message'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
