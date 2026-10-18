import React from 'react';
import { notFound } from 'next/navigation';
import { getBrandBySlug, getCategories, getBrands, getProducts } from '@/lib/products';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilters } from '@/components/product/ProductFilters';
import Link from 'next/link';
import { Award, Globe } from 'lucide-react';

export const revalidate = 0;

interface BrandPageProps {
  params: { slug: string };
  searchParams: {
    category?: string;
    skin_type?: string;
    concern?: string;
    min_price?: string;
    max_price?: string;
    in_stock?: string;
    sort?: any;
  };
}

export default function BrandDetailPage({ params, searchParams }: BrandPageProps) {
  const brand = getBrandBySlug(params.slug);
  if (!brand) {
    notFound();
  }

  const allCategories = getCategories();
  const allBrands = getBrands();

  const minPrice = searchParams.min_price ? parseFloat(searchParams.min_price) : undefined;
  const maxPrice = searchParams.max_price ? parseFloat(searchParams.max_price) : undefined;
  const inStockOnly = searchParams.in_stock === 'true';

  const { products, total } = getProducts({
    brandSlug: brand.slug,
    categorySlug: searchParams.category,
    skinType: searchParams.skin_type,
    concern: searchParams.concern,
    minPrice,
    maxPrice,
    inStockOnly,
    sort: searchParams.sort || 'newest',
    limit: 24,
  });

  return (
    <div className="min-h-screen bg-blush-light flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-charcoal-400 mb-6">
            <Link href="/" className="hover:text-brand-700">Home</Link>
            <span>/</span>
            <Link href="/brands" className="hover:text-brand-700">Brands</Link>
            <span>/</span>
            <span className="text-brand-700 font-semibold">{brand.name}</span>
          </nav>

          {/* Hero Brand Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-100 shadow-card mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-800">
                    {brand.origin === 'BAGm' ? 'Signature In-House Line ✨' : brand.origin === 'Ghanaian' ? 'Ghanaian Brand 🇬🇭' : 'International 🌍'}
                  </span>
                  {brand.website_url && (
                    <a
                      href={brand.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-charcoal-400 hover:text-brand-700 flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Official Site</span>
                    </a>
                  )}
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
                  {brand.name}
                </h1>

                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                  {brand.description || 'Authentic formulations direct to Ghana.'}
                </p>

                <p className="text-xs font-semibold text-brand-700 pt-1">
                  Showing {products.length} {products.length === 1 ? 'product' : 'products'} from this brand
                </p>
              </div>

              <div className="w-24 h-24 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center font-serif font-bold text-3xl text-brand-800 shadow-inner shrink-0">
                {brand.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Grid Layout with Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            <div className="lg:col-span-1">
              <ProductFilters
                categories={allCategories}
                brands={allBrands}
                totalResults={total}
              />
            </div>

            <div className="lg:col-span-3">
              {products.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-brand-100 shadow-card">
                  <p className="font-serif text-lg text-charcoal-900">No products found for this brand matching your filters.</p>
                  <Link
                    href={`/brands/${brand.slug}`}
                    className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
                  >
                    Reset Brand Filters
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
