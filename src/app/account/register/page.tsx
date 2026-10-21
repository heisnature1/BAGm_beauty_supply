'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const { register } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newsletter, setNewsletter] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    const res = await register({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      newsletter,
    });

    setLoading(false);

    if (res.success) {
      setSuccessMessage('Account created successfully! Redirecting...');
      setTimeout(() => {
        router.push(redirect);
      }, 800);
    } else {
      setError(res.error || 'Registration failed. Email may already be in use.');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-brand-100 shadow-luxury space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center mx-auto font-serif font-bold text-xl border border-brand-200">
          B
        </div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900">
          Create Customer Account
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500">
          Join BAGm Beauty Supply for personalized routine tracking, address book, and instant order history.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleRegisterSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="Akosua"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full text-xs p-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Mensah"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs p-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
            Ghana Phone Number
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
            <input
              type="tel"
              placeholder="024 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs p-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs p-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 font-medium"
            />
          </div>
        </div>

        <label className="flex items-start gap-2 cursor-pointer select-none pt-1">
          <input
            type="checkbox"
            checked={newsletter}
            onChange={(e) => setNewsletter(e.target.checked)}
            className="mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-0 text-xs cursor-pointer"
          />
          <span className="text-xs text-charcoal-600 leading-tight">
            I would like to receive curated beauty guides and exclusive updates.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
        >
          {loading ? (
            <span>Creating Account...</span>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-gray-100 text-center">
        <p className="text-xs text-charcoal-500">
          Already have an account?{' '}
          <Link
            href={`/account/login?redirect=${encodeURIComponent(redirect)}`}
            className="font-bold text-brand-700 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-blush-light flex flex-col">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 py-12 sm:py-20 flex items-center justify-center">
        <div className="max-w-lg w-full mx-auto px-4">
          <Suspense fallback={<div className="p-8 text-center text-xs text-charcoal-400">Loading form...</div>}>
            <RegisterForm />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
