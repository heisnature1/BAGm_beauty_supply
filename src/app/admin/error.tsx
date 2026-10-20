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
    <div className="min-h-screen bg-charcoal-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-charcoal-900 border border-charcoal-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif font-bold text-xl text-white">
            Administrative Session Notice
          </h2>
          <p className="text-xs text-charcoal-300 leading-relaxed">
            {error?.message || 'A temporary issue occurred while loading administrative data.'}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Admin Data</span>
          </button>

          <Link
            href="/admin/login"
            className="w-full py-3 px-4 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-charcoal-700"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Admin Portal</span>
          </Link>

          <Link
            href="/"
            className="text-xs text-charcoal-400 hover:text-white transition-colors pt-1"
          >
            &larr; Return to Live Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
