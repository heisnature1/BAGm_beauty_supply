'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, Heart, ShoppingBag, X, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useCart } from './CartProvider';

interface Toast {
  id: string;
  title: string;
  message?: string;
  image?: string;
  type?: 'cart' | 'wishlist' | 'success' | 'info';
  actionLabel?: string;
  actionHref?: string;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { openDrawer } = useCart();

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toast, id };
    setToasts((prev) => [...prev.slice(-2), newToast]); // Keep at most 3

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toasts Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-luxury-hover border border-brand-200/80 animate-slide-up flex items-center gap-3.5 transition-all duration-300"
          >
            {toast.image ? (
              <img
                src={toast.image}
                alt={toast.title}
                className="w-12 h-12 rounded-xl object-cover border border-brand-100 shrink-0"
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  toast.type === 'wishlist'
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : toast.type === 'cart'
                    ? 'bg-brand-50 text-brand-700 border border-brand-200'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}
              >
                {toast.type === 'wishlist' ? (
                  <Heart className="w-5 h-5 fill-current" />
                ) : toast.type === 'cart' ? (
                  <ShoppingBag className="w-5 h-5" />
                ) : (
                  <Sparkles className="w-5 h-5 text-gold-500" />
                )}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-charcoal-900 truncate flex items-center gap-1.5">
                <span>{toast.title}</span>
              </h4>
              {toast.message && (
                <p className="text-[11px] text-charcoal-500 truncate mt-0.5">{toast.message}</p>
              )}

              {toast.type === 'cart' && (
                <button
                  onClick={() => {
                    removeToast(toast.id);
                    openDrawer();
                  }}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 hover:text-brand-900 underline underline-offset-2"
                >
                  View Shopping Bag &rarr;
                </button>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Dismiss Notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: () => {},
    };
  }
  return context;
}
