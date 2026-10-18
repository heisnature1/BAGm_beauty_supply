'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Lock, Mail, ShieldAlert, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@bagmbeauty.com');
  const [password, setPassword] = useState('AdminPassword2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password);
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
    <div className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-charcoal-900 border border-charcoal-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-700 text-white flex items-center justify-center mx-auto shadow-lg">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="font-serif font-bold text-2xl text-white">
            BAGm Store Administration
          </h1>
          <p className="text-xs text-charcoal-400">
            Secure management portal for BAGm Beauty Supply operations in Ghana.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-300 block mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-3 pl-10 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-300 block mb-1">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs p-3 pl-10 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2"
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

        <div className="pt-4 border-t border-charcoal-800 text-center">
          <Link href="/" className="text-xs text-charcoal-400 hover:text-white transition-colors">
            &larr; Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
