'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Search,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  LogOut,
  ShieldAlert,
  Package,
  Layers,
  Compass,
} from 'lucide-react';
import { useCart } from '../providers/CartProvider';
import { useWishlist } from '../providers/WishlistProvider';
import { useAuth } from '../providers/AuthProvider';
import { formatGHS } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, openDrawer } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, logout } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menus on path change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setAccountMenuOpen(false);
  }, [pathname]);

  // Click outside listener for account dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop All', href: '/shop' },
    { label: 'Skincare', href: '/categories/skincare' },
    { label: 'Facial Care', href: '/categories/facial-care' },
    { label: 'Makeup', href: '/categories/makeup' },
    { label: 'Body Care', href: '/categories/body-care' },
    { label: 'Body Splashes', href: '/categories/body-splashes-and-sprays' },
    { label: 'Brands', href: '/brands' },
    { label: 'Routine Finder', href: '/routine-finder', highlight: true },
    { label: 'Editorial', href: '/blog' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-100 transition-shadow duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-charcoal-700 hover:text-brand-700 rounded-md transition-colors"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-1 lg:flex-initial flex items-center justify-center lg:justify-start">
              <Link href="/" className="group flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-sm ring-2 ring-brand-100 group-hover:ring-brand-300 transition-all">
                  <span className="font-serif font-bold text-lg tracking-wider">B</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-charcoal-900 group-hover:text-brand-700 transition-colors">
                    BAGm <span className="font-sans font-light text-brand-600 text-lg sm:text-xl">Beauty</span>
                  </span>
                  <span className="text-[10px] tracking-[0.25em] uppercase font-semibold text-gold-500 -mt-1 hidden sm:block">
                    Supply Ghana
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center space-x-6 text-[13px] font-medium tracking-wide text-charcoal-700">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`transition-colors py-2 relative flex items-center gap-1 ${
                      isActive ? 'text-brand-700 font-semibold' : 'hover:text-brand-600'
                    } ${link.highlight ? 'text-brand-600 font-semibold' : ''}`}
                  >
                    {link.highlight && <Sparkles className="w-3.5 h-3.5 text-gold-500" />}
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-charcoal-700 hover:text-brand-700 hover:bg-brand-50 rounded-full transition-colors"
                aria-label="Search Store"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link
                href="/account/wishlist"
                className="p-2 text-charcoal-700 hover:text-brand-700 hover:bg-brand-50 rounded-full transition-colors relative"
                aria-label="View Wishlist"
              >
                <Heart className="w-5 h-5" />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-fade-in shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Customer Account Dropdown */}
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="p-2 text-charcoal-700 hover:text-brand-700 hover:bg-brand-50 rounded-full transition-colors flex items-center gap-1"
                  aria-label="Account Menu"
                >
                  <UserIcon className="w-5 h-5" />
                  {mounted && user && (
                    <span className="hidden md:inline-block text-xs font-semibold text-charcoal-800 max-w-[100px] truncate">
                      {user.first_name}
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-charcoal-400 hidden sm:block" />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-luxury border border-brand-100 py-2 z-50 animate-slide-down">
                    {mounted && user ? (
                      <div>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs text-charcoal-500">Signed in as</p>
                          <p className="text-sm font-semibold text-charcoal-900 truncate">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-charcoal-500 truncate">{user.email}</p>
                          {user.role === 'admin' && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-brand-100 text-brand-800 text-[10px] font-bold rounded">
                              Store Admin
                            </span>
                          )}
                        </div>
                        <div className="py-1">
                          {user.role === 'admin' && (
                            <Link
                              href="/admin"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
                            >
                              <ShieldAlert className="w-4 h-4" />
                              <span>Admin Dashboard</span>
                            </Link>
                          )}
                          <Link
                            href="/account"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                          >
                            <UserIcon className="w-4 h-4" />
                            <span>My Account</span>
                          </Link>
                          <Link
                            href="/account?tab=orders"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                          >
                            <Package className="w-4 h-4" />
                            <span>Order History</span>
                          </Link>
                          <Link
                            href="/account/wishlist"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-charcoal-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                          >
                            <Heart className="w-4 h-4" />
                            <span>My Wishlist ({wishlistCount})</span>
                          </Link>
                        </div>
                        <div className="border-t border-gray-100 pt-1">
                          <button
                            onClick={() => logout()}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 space-y-2">
                        <Link
                          href="/account/login"
                          className="w-full flex items-center justify-center py-2 px-4 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors shadow-xs"
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/account/register"
                          className="w-full flex items-center justify-center py-2 px-4 rounded-lg border border-brand-200 text-charcoal-800 text-xs font-semibold hover:bg-brand-50 transition-colors"
                        >
                          Create Account
                        </Link>
                        <div className="pt-2 border-t border-gray-100">
                          <Link
                            href="/track-order"
                            className="flex items-center gap-2 text-xs text-charcoal-600 hover:text-brand-700 py-1"
                          >
                            <Package className="w-3.5 h-3.5" />
                            <span>Track Guest Order</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Shopping Cart Button */}
              <button
                onClick={openDrawer}
                className="flex items-center gap-2 bg-brand-50 hover:bg-brand-100 text-brand-900 px-3.5 py-2 rounded-full transition-all group"
                aria-label="View Shopping Cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-brand-700 group-hover:scale-105 transition-transform" />
                  {mounted && totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-brand-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold hidden sm:inline-block">Cart</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Live Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/60 backdrop-blur-sm flex items-start justify-center pt-16 px-4 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-luxury border border-brand-100 overflow-hidden animate-slide-down">
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-brand-600 shrink-0" />
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  autoFocus
                  placeholder="Search skincare, cleansers, shea butter, serums, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm sm:text-base text-charcoal-900 placeholder-charcoal-400 focus:outline-none bg-transparent"
                />
              </form>
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 text-charcoal-400 hover:text-charcoal-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Suggestions & Results */}
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {searchLoading && (
                <div className="py-8 text-center text-xs text-charcoal-400">Searching catalog...</div>
              )}

              {!searchLoading && searchResults.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">Matching Products</p>
                  {searchResults.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-brand-50 transition-colors group"
                      onClick={() => setSearchOpen(false)}
                    >
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100'}
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-brand-700">{p.brand_name}</p>
                        <p className="text-sm font-medium text-charcoal-900 truncate group-hover:text-brand-600 transition-colors">
                          {p.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-charcoal-900">{formatGHS(p.price)}</p>
                      </div>
                    </Link>
                  ))}
                  <div className="pt-2 text-center">
                    <button
                      onClick={handleSearchSubmit}
                      className="text-xs font-semibold text-brand-700 hover:underline"
                    >
                      View all results for &quot;{searchQuery}&quot; &rarr;
                    </button>
                  </div>
                </div>
              )}

              {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-sm text-charcoal-600">No products found for &quot;{searchQuery}&quot;.</p>
                  <p className="text-xs text-charcoal-400 mt-1">Try searching for keywords like &quot;CeraVe&quot;, &quot;Niacinamide&quot;, &quot;Shea&quot; or &quot;Sunscreen&quot;.</p>
                </div>
              )}

              {!searchQuery.trim() && (
                <div>
                  <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-2">Popular Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {['Skincare', 'Facial Care', 'Body Lotions', 'Body Splashes', 'Serums', 'Sunscreen'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSearchQuery(tag);
                        }}
                        className="text-xs bg-gray-100 hover:bg-brand-100 hover:text-brand-800 text-charcoal-700 px-3 py-1.5 rounded-full transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-charcoal-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-fade-in">
            <div className="p-4 border-b border-brand-100 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-white font-serif font-bold text-sm">
                  B
                </div>
                <span className="font-serif font-bold text-lg text-charcoal-900">BAGm Beauty</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-charcoal-500 hover:text-charcoal-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-medium text-charcoal-800 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      {link.highlight && <Sparkles className="w-4 h-4 text-gold-500" />}
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-2">
                <Link
                  href="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-3 text-sm text-charcoal-700 hover:bg-brand-50 rounded-lg"
                >
                  <Package className="w-4 h-4 text-brand-600" />
                  <span>Track Your Order</span>
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-3 text-sm text-charcoal-700 hover:bg-brand-50 rounded-lg"
                >
                  <Compass className="w-4 h-4 text-brand-600" />
                  <span>About BAGm Beauty</span>
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-3 text-sm text-charcoal-700 hover:bg-brand-50 rounded-lg"
                >
                  <Layers className="w-4 h-4 text-brand-600" />
                  <span>Contact Customer Support</span>
                </Link>
              </div>
            </div>

            <div className="p-4 border-t border-brand-100 bg-brand-50/50">
              {user ? (
                <div className="space-y-2">
                  <p className="text-xs text-charcoal-600">
                    Logged in as <strong>{user.first_name} {user.last_name}</strong>
                  </p>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-semibold"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/account/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-center bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/account/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-center bg-white border border-brand-200 text-charcoal-800 rounded-lg text-xs font-semibold hover:bg-brand-50"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
