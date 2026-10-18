'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
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
  Sparkles,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If on admin login page, don't show the dashboard shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-charcoal-950 text-white flex items-center justify-center">
        <p className="text-xs text-charcoal-400 font-semibold">Verifying administrative credentials...</p>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Inventory & Movements', href: '/admin/inventory', icon: Boxes },
    { label: 'Orders & Fulfilment', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Returns & Refunds', href: '/admin/returns', icon: RotateCcw },
    { label: 'Verified Reviews', href: '/admin/reviews', icon: Star },
    { label: 'Customer Directory', href: '/admin/customers', icon: Users },
    { label: 'Brands & Categories', href: '/admin/brands-categories', icon: Tags },
    { label: 'Content & Editorial', href: '/admin/content', icon: FileText },
    { label: 'Subscribers', href: '/admin/subscribers', icon: Mail },
    { label: 'Customer Enquiries', href: '/admin/enquiries', icon: MessageSquare },
    { label: 'Expenses & Profit', href: '/admin/expenses', icon: DollarSign },
    { label: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
    { label: 'Audit Trail Logs', href: '/admin/audit-logs', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-charcoal-900 text-charcoal-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-charcoal-950 border-r border-charcoal-800 shrink-0">
        <div className="p-5 border-b border-charcoal-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center font-serif font-bold text-white text-base">
              B
            </div>
            <div>
              <span className="font-serif font-bold text-white text-base block leading-none">
                BAGm Admin
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gold-400 font-semibold">
                Store Operations
              </span>
            </div>
          </Link>
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
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'bg-brand-700 text-white font-semibold shadow-xs'
                    : 'text-charcoal-400 hover:text-white hover:bg-charcoal-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-charcoal-800 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-charcoal-400 hover:text-white hover:bg-charcoal-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              <span>View Storefront</span>
            </span>
          </Link>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-charcoal-950/90 backdrop-blur-md border-b border-charcoal-800 h-16 flex items-center justify-between px-4 sm:px-6 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 text-charcoal-400 hover:text-white md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xs text-charcoal-400 hidden sm:block">
              Primary Currency: <strong className="text-white">Ghanaian Cedi (GH₵)</strong> • Server Time: <strong className="text-white">GMT (Accra)</strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-charcoal-400 hidden sm:inline">
              Logged in as <strong className="text-white">{user.first_name} {user.last_name}</strong>
            </span>
            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Storefront</span>
            </Link>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-charcoal-900">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-charcoal-950 h-full shadow-2xl flex flex-col z-10">
            <div className="p-4 border-b border-charcoal-800 flex items-center justify-between">
              <span className="font-serif font-bold text-white text-base">BAGm Admin</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-charcoal-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-charcoal-400 hover:text-white hover:bg-charcoal-900"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
