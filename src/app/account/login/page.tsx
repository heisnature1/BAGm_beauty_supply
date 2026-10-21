'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { useAuth } from '@/components/providers/AuthProvider';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requiresVerification, setRequiresVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email.trim(), password);
    if (res.success) {
      if (res.user?.role === 'admin' && redirect === '/account') {
        router.push('/admin');
      } else {
        router.push(redirect);
      }
    } else {
      setError(res.error || 'Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-brand-100 shadow-luxury space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center mx-auto font-serif font-bold text-xl border border-brand-200">
          B
        </div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900">
          Welcome Back
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500">
          Sign in to manage your beauty orders, addresses, and wishlist.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
            Email Address
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
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
              Password
            </label>
            <Link
              href="/account/reset-password"
              className="text-[11px] text-brand-700 hover:underline font-medium"
            >
              Forgot Password?
            </Link>
          </div>
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
        >
          {loading ? (
            <span>Signing In...</span>
          ) : (
            <>
              <span>Sign In to Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-2 border-t border-gray-100 text-center space-y-3">
        <p className="text-xs text-charcoal-500">
          Don&apos;t have an account yet?{' '}
          <Link
            href={`/account/register?redirect=${encodeURIComponent(redirect)}`}
            className="font-bold text-brand-700 hover:underline"
          >
            Create Customer Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-blush-light flex flex-col">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 py-12 sm:py-20 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <Suspense fallback={<div className="p-8 text-center text-xs text-charcoal-400">Loading sign in...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
