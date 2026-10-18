'use client';

import React from 'react';
import Link from 'next/link';
import { EditorialArticle } from '@/types';
import { ArrowRight, BookOpen, Clock, Sparkles } from 'lucide-react';

export function EditorialPreview({ articles }: { articles: EditorialArticle[] }) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold uppercase tracking-wider mb-2">
              <BookOpen className="w-3.5 h-3.5 text-brand-600" />
              <span>Beauty Education</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 tracking-tight">
              The BAGm Editorial
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-2">
              Dermatology guides, ingredient breakdowns, and tropical skincare rituals.
            </p>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-brand-200 bg-white hover:bg-brand-50 text-brand-900 text-xs sm:text-sm font-bold transition-all shadow-xs group"
          >
            <span>Read All Articles</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {articles.slice(0, 3).map((article) => (
            <Link
              key={article.id}
              href={`/blog/${article.slug}`}
              className="group bg-white rounded-3xl border border-brand-100/90 overflow-hidden shadow-card hover:shadow-luxury-hover transition-all duration-300 flex flex-col hover:-translate-y-1"
            >
              <div className="aspect-[16/10] overflow-hidden bg-blush-light relative">
                <img
                  src={article.cover_image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                <span className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md text-brand-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                  {article.category}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-charcoal-400 mb-2 font-medium">
                    <Clock className="w-3 h-3 text-brand-600" />
                    <span>{article.read_time}</span>
                    <span>•</span>
                    <span>{article.author}</span>
                  </div>

                  <h3 className="font-serif font-bold text-base sm:text-lg text-charcoal-900 group-hover:text-brand-700 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-charcoal-500 line-clamp-2 mt-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center text-xs font-bold text-brand-700 group-hover:text-brand-800 gap-1.5">
                  <span>Read Full Skincare Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
