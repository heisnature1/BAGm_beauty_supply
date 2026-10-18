import React from 'react';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getCategories, getBrands, getProducts } from '@/lib/products';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilters } from '@/components/product/ProductFilters';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export const revalidate = 0;

interface CategoryPageProps {
  params: { slug: string };
  searchParams: {
    brand?: string;
    origin?: string;
    skin_type?: string;
    concern?: string;
    min_price?: string;
    max_price?: string;
    in_stock?: string;
    sort?: any;
    page?: string;
  };
}

export default function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = getCategoryBySlug(params.slug);
  if (!category) {
    notFound();
  }

  const allCategories = getCategories();
  const allBrands = getBrands();

  const minPrice = searchParams.min_price ? parseFloat(searchParams.min_price) : undefined;
  const maxPrice = searchParams.max_price ? parseFloat(searchParams.max_price) : undefined;
  const inStockOnly = searchParams.in_stock === 'true';

  const { products, total } = getProducts({
    categorySlug: category.slug,
    brandSlug: searchParams.brand,
    brandOrigin: searchParams.origin,
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
            <Link href="/shop" className="hover:text-brand-700">Categories</Link>
            <span>/</span>
            <span className="text-brand-700 font-semibold">{category.name}</span>
          </nav>

          {/* Hero Category Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-white border border-brand-100 shadow-card mb-8">
            <div className="grid grid-cols-1 md:grid-cols-12 items-center">
              <div className="p-6 sm:p-10 md:col-span-8 space-y-3">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 tracking-widest uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                  <span>Category Showcase</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
                  {category.name}
                </h1>
                <p className="text-xs sm:text-sm text-charcoal-600 max-w-xl leading-relaxed">
                  {category.description || 'Explore our curated formulations for radiant skin.'}
                </p>
                <p className="text-xs font-semibold text-brand-700 pt-1">
                  Showing {products.length} {products.length === 1 ? 'product' : 'products'} available in Ghana
                </p>
              </div>

              {category.image_url && (
                <div className="md:col-span-4 h-48 md:h-full relative overflow-hidden bg-blush">
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
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
                  <p className="font-serif text-lg text-charcoal-900">No products found in this category matching your filters.</p>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
                  >
                    Reset Category Filters
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
