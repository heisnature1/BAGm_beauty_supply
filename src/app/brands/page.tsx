import React from 'react';
import { getBrands } from '@/lib/products';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import Link from 'next/link';
import { Sparkles, ArrowRight, Globe, Award } from 'lucide-react';

export const revalidate = 0;

export default function BrandsDirectoryPage() {
  const brands = getBrands();

  const bagmBrands = brands.filter((b) => b.origin === 'BAGm');
  const ghanaianBrands = brands.filter((b) => b.origin === 'Ghanaian');
  const intlBrands = brands.filter((b) => b.origin === 'International');

  return (
    <div className="min-h-screen bg-blush-light flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>Verified Brand Directory</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal-900">
              Our Beauty Houses &amp; Artisans
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-2">
              We proudly partner directly with authentic international dermatological leaders, certified Ghanaian skincare crafters, and our signature botanical line.
            </p>
          </div>

          {/* BAGm Signature Section */}
          {bagmBrands.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-brand-200 pb-2">
                <Award className="w-5 h-5 text-brand-700" />
                <h2 className="font-serif font-bold text-xl text-charcoal-900">BAGm Signature Formulations</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bagmBrands.map((b) => (
                  <BrandCard key={b.id} brand={b} badge="Signature House ✨" badgeColor="bg-brand-700 text-white" />
                ))}
              </div>
            </div>
          )}

          {/* Ghanaian Brands Section */}
          {ghanaianBrands.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-brand-200 pb-2">
                <span className="text-lg">🇬🇭</span>
                <h2 className="font-serif font-bold text-xl text-charcoal-900">Ghanaian Beauty &amp; Shea Artisans</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ghanaianBrands.map((b) => (
                  <BrandCard key={b.id} brand={b} badge="Ghanaian Brand 🇬🇭" badgeColor="bg-emerald-700 text-white" />
                ))}
              </div>
            </div>
          )}

          {/* International Brands Section */}
          {intlBrands.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-brand-200 pb-2">
                <Globe className="w-5 h-5 text-blue-700" />
                <h2 className="font-serif font-bold text-xl text-charcoal-900">International Dermatological Brands</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {intlBrands.map((b) => (
                  <BrandCard key={b.id} brand={b} badge="International 🌍" badgeColor="bg-blue-700 text-white" />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function BrandCard({ brand, badge, badgeColor }: { brand: any; badge: string; badgeColor: string }) {
  return (
    <Link
      href={`/brands/${brand.slug}`}
      className="bg-white rounded-2xl p-6 border border-brand-100 shadow-card hover:shadow-luxury transition-all flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center font-serif font-bold text-brand-800 text-lg group-hover:bg-brand-600 group-hover:text-white transition-colors">
            {brand.name.substring(0, 2).toUpperCase()}
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${badgeColor}`}>
            {badge}
          </span>
        </div>

        <h3 className="font-serif font-bold text-lg text-charcoal-900 group-hover:text-brand-700 transition-colors">
          {brand.name}
        </h3>

        <p className="text-xs text-charcoal-500 mt-2 line-clamp-3 leading-relaxed">
          {brand.description || 'Quality beauty and skincare formulations available at BAGm Beauty Supply.'}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-brand-700">
        <span>{brand.product_count} Available Products</span>
        <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          <span>Shop Brand</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}
