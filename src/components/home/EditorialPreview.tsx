'use client';

import React from 'react';
import Link from 'next/link';
import { EditorialArticle } from '@/types';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';

export function EditorialPreview({ articles }: { articles: EditorialArticle[] }) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 tracking-widest uppercase mb-1">
              <BookOpen className="w-3.5 h-3.5 text-brand-600" />
              <span>Beauty Education</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
              The BAGm Editorial
            </h2>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-700 hover:text-brand-900 transition-colors group"
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
              className="group bg-white rounded-2xl border border-brand-100 overflow-hidden shadow-card hover:shadow-luxury transition-all flex flex-col"
            >
              <div className="aspect-[16/10] overflow-hidden bg-blush-light relative">
                <img
                  src={article.cover_image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-brand-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                  {article.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-charcoal-400 mb-2">
                    <Clock className="w-3 h-3" />
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

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs font-semibold text-brand-700 group-hover:text-brand-800">
                  <span>Read Full Guide &rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
