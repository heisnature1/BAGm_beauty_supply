'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, X } from 'lucide-react';

export function AnnouncementBar() {
  const [data, setData] = useState<{ enabled: boolean; text: string; link?: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/settings/announcement')
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res && res.enabled) {
          setData(res);
        }
      })
      .catch(() => {});
  }, []);

  if (!data || !data.enabled || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-950 text-white text-xs sm:text-sm py-2 px-4 transition-all duration-300 relative z-50 shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 flex items-center justify-center gap-2 text-center font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-gold-400 shrink-0 hidden sm:inline-block" />
          <span>{data.text}</span>
          {data.link && (
            <Link
              href={data.link}
              className="inline-flex items-center gap-1 font-semibold text-gold-300 hover:text-white underline underline-offset-2 ml-1 transition-colors"
            >
              <span>Learn More</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/70 hover:text-white p-1 rounded-full transition-colors ml-2"
          aria-label="Close Announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
