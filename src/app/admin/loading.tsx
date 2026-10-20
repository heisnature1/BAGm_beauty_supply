import React from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-white border border-rose-200 shadow-card flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
      </div>
      <p className="text-xs text-charcoal-500 font-semibold tracking-wide">
        Loading administrative telemetry...
      </p>
    </div>
  );
}
