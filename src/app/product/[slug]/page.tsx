import React from 'react';
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/lib/products';
import { getDb } from '@/lib/db';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductActionForm } from './ProductActionForm';
import { ProductReviewsSection } from './ProductReviewsSection';
import Link from 'next/link';
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  PackageCheck,
  Building,
} from 'lucide-react';

export const revalidate = 0;

interface ProductPageProps {
  params: { slug: string };
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product.id, product.category_id, 4);

  // Fetch verified customer reviews for this product
  const db = getDb();
  const reviews = db.prepare(`
    SELECT r.*, u.first_name, u.last_name
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ? AND r.status = 'approved'
    ORDER BY r.created_at DESC
  `).all(product.id) as any[];

  return (
    <div className="min-h-screen bg-blush-light flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-charcoal-400">
            <Link href="/" className="hover:text-brand-700">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-brand-700">Shop</Link>
            <span>/</span>
            <Link href={`/categories/${product.category_slug}`} className="hover:text-brand-700">
              {product.category_name}
            </Link>
            <span>/</span>
            <span className="text-brand-700 font-semibold truncate max-w-xs">{product.name}</span>
          </nav>

          {/* Top Section: Gallery + Purchase Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Gallery Column */}
            <div className="lg:col-span-6">
              <ProductGallery images={product.images} productName={product.name} />
            </div>

            {/* Product Details & Actions */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/brands/${product.brand_slug}`}
                    className="text-xs font-bold uppercase tracking-wider text-brand-700 hover:underline"
                  >
                    {product.brand_name}
                  </Link>

                  {product.brand_origin === 'BAGm' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-700 text-white uppercase tracking-wider">
                      BAGm Signature ✨
                    </span>
                  )}
                  {product.brand_origin === 'Ghanaian' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white uppercase tracking-wider">
                      Ghanaian Brand 🇬🇭
                    </span>
                  )}
                  {product.brand_origin === 'International' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-700 text-white uppercase tracking-wider">
                      International 🌍
                    </span>
                  )}
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 leading-tight">
                  {product.name}
                </h1>

                <p className="text-xs text-charcoal-400 font-mono">
                  SKU: <span className="text-charcoal-700">{product.sku}</span>
                </p>
              </div>

              {/* Client Action Form: Variant selector, Quantity, Add to Cart, Wishlist */}
              <ProductActionForm product={product} />

              {/* Trust & Fulfilment Promises */}
              <div className="p-4 rounded-2xl bg-white border border-brand-100 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-charcoal-700">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Greater Accra Delivery (24-48 hrs)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Building className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Store Pickup at East Legon Hub</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Guaranteed Authentic</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-gold-600 shrink-0" />
                  <span>7-Day Return Policy for eligible items</span>
                </div>
              </div>

              {/* Skin Compatibility Badges */}
              {(product.suitable_skin_types.length > 0 || product.relevant_concerns.length > 0) && (
                <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-100 space-y-3">
                  {product.suitable_skin_types.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                        Suitable For Skin Types:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {product.suitable_skin_types.map((st) => (
                          <span
                            key={st}
                            className="bg-white border border-brand-200 text-brand-900 text-xs px-2.5 py-0.5 rounded-md font-medium capitalize"
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.relevant_concerns.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                        Targets Concerns:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {product.relevant_concerns.map((rc) => (
                          <span
                            key={rc}
                            className="bg-white border border-brand-200 text-brand-900 text-xs px-2.5 py-0.5 rounded-md font-medium capitalize"
                          >
                            {rc.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Tabs: Description, Key Benefits, Ingredients, How to Use */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-100 shadow-card space-y-8">
            <div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-charcoal-900 mb-3">
                Product Formulation &amp; Overview
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-4xl whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {product.benefits && product.benefits.length > 0 && (
              <div className="pt-6 border-t border-gray-100">
                <h3 className="font-serif font-bold text-lg text-charcoal-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold-500" />
                  <span>Key Benefits &amp; Results</span>
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-charcoal-700">
                  {product.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.directions_for_use && (
              <div className="pt-6 border-t border-gray-100">
                <h3 className="font-serif font-bold text-lg text-charcoal-900 mb-2">
                  Directions &amp; How to Use
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-3xl">
                  {product.directions_for_use}
                </p>
              </div>
            )}

            {product.ingredients && (
              <div className="pt-6 border-t border-gray-100">
                <h3 className="font-serif font-bold text-lg text-charcoal-900 mb-2">
                  Full Ingredients List
                </h3>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-charcoal-600 leading-relaxed font-mono">
                  {product.ingredients}
                </div>
              </div>
            )}
          </div>

          {/* Genuine Verified Reviews Section */}
          <ProductReviewsSection product={product} initialReviews={reviews} />

          {/* Related / Complementary Products */}
          {relatedProducts.length > 0 && (
            <div className="space-y-6 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-brand-700 tracking-widest uppercase">Routine Pairings</span>
                  <h2 className="font-serif font-bold text-2xl text-charcoal-900 mt-1">You May Also Love</h2>
                </div>
                <Link href={`/categories/${product.category_slug}`} className="text-xs font-semibold text-brand-700 hover:underline">
                  View More &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
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
