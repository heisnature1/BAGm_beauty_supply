'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Logo } from '@/components/common/Logo';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  RotateCcw,
  Star,
  Users,
  Tags,
  FileText,
  Mail,
  MessageSquare,
  DollarSign,
  BarChart3,
  Settings,
  ShieldAlert,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If on admin login page, don't show the dashboard shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  useEffect(() => {
    if (mounted && !loading && (!user || user.role !== 'admin')) {
      router.push('/admin/login');
    }
  }, [mounted, user, loading, router]);

  // While checking or not authenticated, render a resilient loading fallback
  if (!mounted || loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#faf7f5] text-charcoal-900 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-white border border-rose-200 shadow-card flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
        </div>
        <p className="text-xs text-charcoal-600 font-semibold text-center">
          Verifying administrative credentials...
        </p>
        <Link
          href="/admin/login"
          className="text-xs text-brand-600 hover:text-brand-700 underline font-medium"
        >
          Click here if you are not redirected automatically
        </Link>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Inventory & Stock', href: '/admin/inventory', icon: Boxes },
    { label: 'Orders & Shipping', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Returns & Refunds', href: '/admin/returns', icon: RotateCcw },
    { label: 'Verified Reviews', href: '/admin/reviews', icon: Star },
    { label: 'Customer CRM', href: '/admin/customers', icon: Users },
    { label: 'Brands & Categories', href: '/admin/brands-categories', icon: Tags },
    { label: 'Content & Editorial', href: '/admin/content', icon: FileText },
    { label: 'Subscribers', href: '/admin/subscribers', icon: Mail },
    { label: 'Customer Enquiries', href: '/admin/enquiries', icon: MessageSquare },
    { label: 'Expenses & Profit', href: '/admin/expenses', icon: DollarSign },
    { label: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
    { label: 'Audit Trail Logs', href: '/admin/audit-logs', icon: ShieldAlert },
  ];

  const adminName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Administrator';

  return (
    <div className="min-h-screen bg-[#faf7f5] text-charcoal-800 flex flex-col md:flex-row font-sans selection:bg-brand-100 selection:text-brand-900">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-rose-200/80 shrink-0 shadow-xs">
        <div className="p-4 border-b border-rose-100/80 flex items-center justify-between bg-white">
          <Logo href="/admin" variant="admin" size="sm" />
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white font-semibold shadow-soft'
                    : 'text-charcoal-600 hover:text-brand-700 hover:bg-rose-50/70'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-charcoal-400 group-hover:text-brand-600'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-rose-100/80 space-y-1 bg-white">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-charcoal-600 hover:text-brand-700 hover:bg-rose-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-brand-600" />
              <span>Live Storefront</span>
            </span>
          </Link>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors text-left font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/95 backdrop-blur-md border-b border-rose-200/80 h-16 flex items-center justify-between px-4 sm:px-6 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 text-charcoal-600 hover:text-brand-600 rounded-lg hover:bg-rose-50 md:hidden transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xs text-charcoal-500 hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Currency: <strong className="text-charcoal-900 font-semibold">Ghanaian Cedi (GH₵)</strong></span>
              <span className="text-charcoal-300">•</span>
              <span>Time: <strong className="text-charcoal-900 font-semibold">GMT (Accra)</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200/70 text-xs">
              <span className="w-2 h-2 rounded-full bg-gold-500"></span>
              <span className="text-charcoal-600">Logged in as:</span>
              <strong className="text-charcoal-900 font-semibold">{adminName}</strong>
            </div>
            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-1.5 rounded-xl bg-charcoal-950 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Storefront</span>
            </Link>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#faf7f5]">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-charcoal-950/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 border-r border-rose-200">
            <div className="p-4 border-b border-rose-100 flex items-center justify-between">
              <Logo href="/admin" variant="admin" size="sm" />
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 text-charcoal-400 hover:text-charcoal-700 rounded-lg hover:bg-rose-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white font-semibold shadow-soft'
                        : 'text-charcoal-600 hover:text-brand-700 hover:bg-rose-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t border-rose-100 space-y-2 bg-rose-50/40">
              <div className="text-[11px] text-charcoal-600 px-3 py-1">
                Admin: <span className="text-charcoal-900 font-semibold">{adminName}</span>
              </div>
              <button
                onClick={() => {
                  setMobileSidebarOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-100/60 font-semibold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
