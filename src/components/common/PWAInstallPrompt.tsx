'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Sparkles, Smartphone, Share2 } from 'lucide-react';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          // Service worker registered
        })
        .catch((err) => {
          // SW registration failed
        });
    }

    // Check if app is already running in standalone mode (installed)
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isRunningStandalone);
    if (isRunningStandalone) return;

    // Check if dismissed previously within 3 days
    const dismissedTime = localStorage.getItem('bagm_pwa_dismissed');
    if (dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 3 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for Android/Chrome install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on iOS and not standalone, show prompt after 4 seconds
    let timer: NodeJS.Timeout;
    if (isIosDevice && !isRunningStandalone) {
      timer = setTimeout(() => {
        setShowPrompt(true);
      }, 4000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('bagm_pwa_dismissed', Date.now().toString());
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 animate-slide-up">
      <div className="bg-charcoal-950 text-white rounded-2xl p-4 shadow-2xl border border-charcoal-800/80 backdrop-blur-xl relative overflow-hidden">
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-600/20 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-charcoal-400 hover:text-white p-1 rounded-full transition-colors"
          aria-label="Dismiss app install banner"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          <div className="w-11 h-11 rounded-xl bg-charcoal-900 border border-charcoal-700/80 flex items-center justify-center shrink-0 p-1 shadow-md">
            <img
              src="/logo.png"
              alt="BAGm Beauty"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-sm text-white">
                BAGm Beauty App
              </span>
              <span className="px-1.5 py-0.5 rounded bg-brand-600 text-white text-[9px] font-bold">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-charcoal-300 leading-tight">
              Install our mobile app for faster shopping &amp; order updates in Ghana.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-3.5 pt-3 border-t border-charcoal-800/80 flex items-center justify-between gap-2">
          {isIOS ? (
            <div className="flex items-center gap-2 text-[11px] text-charcoal-300">
              <Share2 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span>
                Tap <strong>Share</strong> then <strong>Add to Home Screen</strong>
              </span>
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              className="w-full py-2 px-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install BAGm Mobile App</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
