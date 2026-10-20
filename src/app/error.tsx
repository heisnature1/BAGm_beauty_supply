'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-blush-50 flex flex-col items-center justify-center p-6 text-charcoal-900">
      <div className="max-w-md w-full bg-white border border-rose-200/80 rounded-3xl p-8 text-center space-y-6 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto">
          <RefreshCw className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif font-bold text-2xl text-charcoal-900">
            Page Experience Refresh
          </h2>
          <p className="text-xs text-charcoal-600 leading-relaxed">
            We are refreshing your luxury shopping session. Please tap retry to reload the page smoothly.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="w-full py-3.5 px-4 rounded-xl bg-charcoal-950 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Page</span>
          </button>

          <Link
            href="/"
            className="w-full py-3 px-4 rounded-xl bg-blush-100/60 hover:bg-blush-200/60 text-charcoal-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-rose-200"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
