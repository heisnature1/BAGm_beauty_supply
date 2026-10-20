import React from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-3">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      <p className="text-xs text-charcoal-400 font-semibold tracking-wide">
        Loading administrative telemetry...
      </p>
    </div>
  );
}
