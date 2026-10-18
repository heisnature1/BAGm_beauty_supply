import React from 'react';
import { getDb } from '@/lib/db';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { EditorialArticle } from '@/types';
import Link from 'next/link';
import { BookOpen, Clock, ArrowRight, Sparkles } from 'lucide-react';

export const revalidate = 0;

export default function BlogDirectoryPage() {
  const db = getDb();
  const articles = db.prepare('SELECT * FROM editorial_articles WHERE is_published = 1 ORDER BY created_at DESC').all() as EditorialArticle[];

  return (
    <div className="min-h-screen bg-blush-light flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-brand-600" />
              <span>Beauty Education &amp; Rituals</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal-900">
              The BAGm Editorial
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500">
              Expert guides on ingredient science, West African climate skincare, and building your personal glow routine.
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((art) => (
              <Link
                key={art.id}
                href={`/blog/${art.slug}`}
                className="bg-white rounded-3xl border border-brand-100 overflow-hidden shadow-card hover:shadow-luxury transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="aspect-[16/10] overflow-hidden bg-blush relative">
                    <img
                      src={art.cover_image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-brand-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                      {art.category}
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-[11px] text-charcoal-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{art.read_time}</span>
                      <span>•</span>
                      <span>{art.author}</span>
                    </div>

                    <h2 className="font-serif font-bold text-lg text-charcoal-900 group-hover:text-brand-700 transition-colors line-clamp-2 leading-snug">
                      {art.title}
                    </h2>

                    <p className="text-xs text-charcoal-600 line-clamp-3 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center gap-1 text-xs font-bold text-brand-700 group-hover:text-brand-800">
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
