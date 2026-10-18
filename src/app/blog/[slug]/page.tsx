import React from 'react';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import Link from 'next/link';
import { BookOpen, Clock, User, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

export const revalidate = 0;

export default function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const db = getDb();
  const article = db.prepare('SELECT * FROM editorial_articles WHERE slug = ? AND is_published = 1').get(params.slug) as any;

  if (!article) {
    notFound();
  }

  // Related articles
  const otherArticles = db.prepare('SELECT * FROM editorial_articles WHERE slug != ? AND is_published = 1 LIMIT 2').all(params.slug) as any[];

  return (
    <div className="min-h-screen bg-blush-light flex flex-col">
      <AnnouncementBar />
      <Header />
      <CartDrawer />

      <main className="flex-1 py-10 sm:py-16">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-charcoal-400">
            <Link href="/" className="hover:text-brand-700">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-brand-700">Editorial</Link>
            <span>/</span>
            <span className="text-brand-700 font-semibold truncate max-w-xs">{article.title}</span>
          </nav>

          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-100 shadow-card space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                {article.category}
              </span>
              <span className="text-xs text-charcoal-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{article.read_time}</span>
              </span>
              <span className="text-xs text-charcoal-400 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>{article.author}</span>
              </span>
            </div>

            <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 leading-tight">
              {article.title}
            </h1>

            <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed italic border-l-4 border-brand-500 pl-4 py-1">
              {article.excerpt}
            </p>

            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-inner bg-blush">
              <img
                src={article.cover_image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Body */}
            <div className="prose prose-brand max-w-none text-charcoal-700 text-sm sm:text-base leading-relaxed space-y-4 pt-4 border-t border-gray-100 whitespace-pre-line">
              {article.content}
            </div>

            {/* Routine Finder CTA embedded in article */}
            <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blush to-brand-50 border border-brand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-charcoal-900">Want tailored guidance for your skin?</h3>
                <p className="text-xs text-charcoal-600 mt-1">
                  Take our interactive 2-minute skincare quiz to discover products matching your skin type.
                </p>
              </div>
              <Link
                href="/routine-finder"
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-xs shrink-0 text-center"
              >
                Take Routine Quiz &rarr;
              </Link>
            </div>
          </div>

          {/* Related Articles */}
          {otherArticles.length > 0 && (
            <div className="space-y-4 pt-6">
              <h3 className="font-serif font-bold text-2xl text-charcoal-900">Continue Reading</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {otherArticles.map((oa) => (
                  <Link
                    key={oa.id}
                    href={`/blog/${oa.slug}`}
                    className="p-5 bg-white rounded-2xl border border-brand-100 shadow-card hover:border-brand-200 transition-all flex gap-4 items-center group"
                  >
                    <img
                      src={oa.cover_image}
                      alt={oa.title}
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">{oa.category}</span>
                      <h4 className="font-serif font-bold text-sm text-charcoal-900 group-hover:text-brand-700 transition-colors line-clamp-2">
                        {oa.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}
