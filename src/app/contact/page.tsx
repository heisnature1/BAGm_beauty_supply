'use client';

import React, { useState } from 'react';
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
                      <span>Plot 42 Lagos Avenue, East Legon, Accra, Ghana</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-charcoal-900 font-semibold">Phone &amp; Telephone</strong>
                      <span>+233 24 123 4567 / +233 55 987 6543</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-charcoal-900 font-semibold">Customer Email</strong>
                      <span>support@bagmbeauty.com</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-charcoal-900 font-semibold">Operating Hours</strong>
                      <span>Monday – Saturday: 9:00 AM – 7:00 PM GMT</span>
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
                    <h4 className="font-serif font-bold text-xl text-emerald-900">Enquiry Received!</h4>
                    <p className="text-xs sm:text-sm text-emerald-800 max-w-sm mx-auto leading-relaxed">
                      Thank you for contacting BAGm Beauty Supply. Our team has received your message and will be in touch shortly.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-2 text-xs font-semibold text-brand-700 hover:underline"
                    >
                      Send Another Enquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-charcoal-700 block mb-1">
                          Your Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ama Frimpong"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-charcoal-700 block mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-charcoal-700 block mb-1">Ghana Phone Number</label>
                        <input
                          type="tel"
                          placeholder="024 123 4567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-charcoal-700 block mb-1">Enquiry Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value as any)}
                          className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-brand-500"
                        >
                          <option value="general">General Enquiry</option>
                          <option value="order_inquiry">Order Status / Receipt</option>
                          <option value="product_advice">Skincare &amp; Product Advice</option>
                          <option value="delivery">Delivery &amp; Pickup Coordination</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-charcoal-700 block mb-1">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Question regarding CeraVe Hydrating Cleanser"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-charcoal-700 block mb-1">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Please write your detailed enquiry here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
                    >
                      {submitting ? (
                        <span>Submitting Message...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Message</span>
                        </>
                      )}
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
