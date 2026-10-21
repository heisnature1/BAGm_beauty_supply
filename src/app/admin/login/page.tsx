'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email.trim(), password);
    if (res.success && res.user?.role === 'admin') {
      router.push('/admin');
    } else if (res.success && res.user?.role !== 'admin') {
      setError('Access denied: Customer accounts cannot access the administrative portal.');
      setLoading(false);
    } else {
      setError(res.error || 'Invalid administrator credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f5] flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white border border-rose-200/80 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-2 bg-rose-50/60 border border-rose-200/80 rounded-2xl shadow-xs">
              <img
                src="/logo.png"
                alt="BAGm Beauty Supply"
                className="h-14 sm:h-16 w-auto object-contain"
              />
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-[11px] font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administrative Portal</span>
            </div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal-900">
              BAGm Operations
            </h1>
            <p className="text-xs text-charcoal-500 mt-1">
              Secure management console for BAGm Beauty Supply, Ghana.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-charcoal-700 block mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-3 pl-10 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                placeholder="admin@bagmbeauty.com"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-charcoal-700 block mb-1.5">
              Administrator Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs p-3 pl-10 pr-10 rounded-xl bg-rose-50/30 border border-rose-200 text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:bg-white focus:border-brand-600 transition-colors"
                placeholder="Enter admin password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-charcoal-400 hover:text-charcoal-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-semibold shadow-soft transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating Portal...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-rose-100 text-center">
          <Link
            href="/"
            className="text-xs text-charcoal-500 hover:text-brand-700 font-medium transition-colors"
          >
            &larr; Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
