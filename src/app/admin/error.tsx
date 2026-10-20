'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, LayoutDashboard, LogIn } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin Portal Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#faf7f5] text-charcoal-900 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white border border-rose-200/80 rounded-3xl p-8 text-center space-y-6 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif font-bold text-xl text-charcoal-900">
            Administrative Session Notice
          </h2>
          <p className="text-xs text-charcoal-600 leading-relaxed">
            {error?.message || 'A temporary issue occurred while loading administrative data.'}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-soft cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Admin Data</span>
          </button>

          <Link
            href="/admin/login"
            className="w-full py-3.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-charcoal-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-rose-200"
          >
            <LogIn className="w-4 h-4 text-brand-600" />
            <span>Sign In to Admin Portal</span>
          </Link>

          <Link
            href="/"
            className="text-xs text-charcoal-500 hover:text-brand-700 transition-colors pt-1"
          >
            &larr; Return to Live Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
