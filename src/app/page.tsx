import React from 'react';
import { getStoreSettings, getCategories, getBrands, getProducts } from '@/lib/products';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { HeroBanner } from '@/components/home/HeroBanner';
import { TrustMarquee } from '@/components/home/TrustMarquee';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedSection } from '@/components/home/FeaturedSection';
import { BrandMarquee } from '@/components/home/BrandMarquee';

export const revalidate = 0; // Dynamic server rendering

export default function HomePage() {
  const settings = getStoreSettings();
  const categories = getCategories();
  const brands = getBrands();

  const { products: featured } = getProducts({ isFeatured: true, limit: 12 });
  const { products: bestsellers } = getProducts({ isBestseller: true, limit: 12 });
  const { products: newArrivals } = getProducts({ isNewArrival: true, limit: 12 });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1">
        <HeroBanner settings={settings} />
        <TrustMarquee />
        <CategoryGrid categories={categories} />
        <FeaturedSection featured={featured} bestsellers={bestsellers} newArrivals={newArrivals} />
        <BrandMarquee brands={brands} />
      </main>

      <Footer />
    </div>
  );
}
