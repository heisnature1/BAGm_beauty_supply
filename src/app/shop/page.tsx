import React, { Suspense } from 'react';
import { getCategories, getBrands, getProducts } from '@/lib/products';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilters } from '@/components/product/ProductFilters';
import { SortSelect } from '@/components/product/SortSelect';
import Link from 'next/link';
import { Sparkles, SlidersHorizontal } from 'lucide-react';

export const revalidate = 0;

interface ShopPageProps {
  searchParams: {
    category?: string;
    brand?: string;
    origin?: string;
    skin_type?: string;
    concern?: string;
    min_price?: string;
    max_price?: string;
    in_stock?: string;
    sort?: any;
    search?: string;
    page?: string;
  };
}

export default function ShopPage({ searchParams }: ShopPageProps) {
  const categories = getCategories();
  const brands = getBrands();

  const minPrice = searchParams.min_price ? parseFloat(searchParams.min_price) : undefined;
  const maxPrice = searchParams.max_price ? parseFloat(searchParams.max_price) : undefined;
  const inStockOnly = searchParams.in_stock === 'true';
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 24;
  const offset = (page - 1) * limit;

  const { products, total } = getProducts({
    categorySlug: searchParams.category,
    brandSlug: searchParams.brand,
    brandOrigin: searchParams.origin,
    skinType: searchParams.skin_type,
    concern: searchParams.concern,
    minPrice,
    maxPrice,
    inStockOnly,
    sort: searchParams.sort || 'newest',
    search: searchParams.search,
    limit,
    offset,
  });

  const totalPages = Math.ceil(total / limit);

  // Active category or brand title
  let headerTitle = 'All Beauty & Skincare Formulations';
  if (searchParams.category) {
    const cat = categories.find((c) => c.slug === searchParams.category);
    if (cat) headerTitle = cat.name;
  } else if (searchParams.brand) {
    const br = brands.find((b) => b.slug === searchParams.brand);
    if (br) headerTitle = `${br.name} Collection`;
  } else if (searchParams.search) {
    headerTitle = `Search results for "${searchParams.search}"`;
  }

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
            <Link href="/shop" className="text-brand-700 font-semibold">Shop</Link>
            {searchParams.category && (
              <>
                <span>/</span>
                <span className="text-charcoal-800">{headerTitle}</span>
              </>
            )}
          </nav>

          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-100 shadow-card mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 tracking-widest uppercase mb-1">
                <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                <span>BAGm Beauty Catalog</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-bold text-charcoal-900">
                {headerTitle}
              </h1>
              <p className="text-xs sm:text-sm text-charcoal-500 mt-2">
                Showing {products.length} of {total} authentic beauty essentials available in Ghana.
              </p>
            </div>

            {/* Quick Sort Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-charcoal-500 hidden sm:inline">Sort by:</span>
              <SortSelect currentSort={searchParams.sort || 'newest'} />
            </div>
          </div>

          {/* Main Content: Sidebar Filters + Products */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <Suspense fallback={<div className="p-4">Loading filters...</div>}>
                <ProductFilters
                  categories={categories}
                  brands={brands}
                  totalResults={total}
                />
              </Suspense>
            </div>

            {/* Product Grid */}
            <div className="lg:col-span-3 space-y-8">
              {products.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-brand-100 shadow-card space-y-4">
                  <div className="w-16 h-16 rounded-full bg-brand-50 mx-auto flex items-center justify-center text-brand-500">
                    <SlidersHorizontal className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-charcoal-900">No matching products found</h3>
                  <p className="text-xs sm:text-sm text-charcoal-500 max-w-md mx-auto">
                    Try adjusting or clearing your filters to explore our full collection of Ghanaian and international beauty products.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 shadow-sm"
                  >
                    Clear All Filters
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const isCurrent = p === page;
                    return (
                      <Link
                        key={p}
                        href={`/shop?page=${p}${searchParams.category ? `&category=${searchParams.category}` : ''}${
                          searchParams.brand ? `&brand=${searchParams.brand}` : ''
                        }${searchParams.sort ? `&sort=${searchParams.sort}` : ''}`}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-brand-600 text-white shadow-xs'
                            : 'bg-white border border-brand-100 text-charcoal-700 hover:bg-brand-50'
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
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
