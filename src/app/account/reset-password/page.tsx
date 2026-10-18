'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  const [email, setEmail] = useState(emailParam || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setStatusMessage(data.message || 'Password reset link has been dispatched to your email.');
      } else {
        setErrorMessage(data.error || 'Failed to request reset. Please verify your email.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm', token, email, password: newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setStatusMessage('Your password has been reset successfully! You can now sign in.');
      } else {
        setErrorMessage(data.error || 'Invalid or expired password reset token.');
      }
    } catch {
      setErrorMessage('Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 border border-brand-100 shadow-luxury space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900">
          {token ? 'Set New Password' : 'Reset Account Password'}
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500">
          {token
            ? 'Enter your new secure password below to regain access to your account.'
            : 'Enter your registered email address and we will send you a password reset link.'}
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {success ? (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">{statusMessage}</p>
          <Link
            href="/account/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
          >
            <span>Go to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : token ? (
        <form onSubmit={handleConfirmReset} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-xs p-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
            />
          </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2"
        >
          {loading ? 'Updating Password...' : 'Update Password'}
        </button>
      </form>
    ) : (
      <form onSubmit={handleRequestReset} className="space-y-4">
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
              className="w-full text-xs p-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2"
        >
          {loading ? 'Sending Reset Link...' : 'Send Password Reset Link'}
        </button>
      </form>
    )}

      <div className="pt-4 border-t border-gray-100 text-center">
        <Link href="/account/login" className="text-xs font-semibold text-brand-700 hover:underline">
          &larr; Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-blush-light flex flex-col">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 py-12 sm:py-20 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <Suspense fallback={<div className="p-8 text-center text-xs text-charcoal-400">Loading reset form...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
