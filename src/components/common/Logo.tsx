'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  variant?: 'light' | 'dark' | 'header' | 'footer' | 'admin';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  href?: string;
}

export function Logo({
  variant = 'header',
  size = 'md',
  showText = false,
  className = '',
  href = '/',
}: LogoProps) {
  // Height map based on size
  const heightClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-20',
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 group ${className}`}>
      <div
        className={`relative flex items-center justify-center rounded-xl overflow-hidden transition-all duration-300 ${
          variant === 'header'
            ? 'p-1 bg-charcoal-950 border border-charcoal-800 shadow-sm group-hover:border-brand-500/50 group-hover:shadow-md'
            : variant === 'admin'
            ? 'p-1 bg-charcoal-950 border border-charcoal-800 shadow-sm group-hover:border-brand-500'
            : variant === 'footer'
            ? 'p-1.5 bg-charcoal-950 border border-charcoal-800 shadow-md'
            : 'p-1 bg-charcoal-950 border border-charcoal-800 shadow-sm'
        }`}
      >
        <img
          src="/logo.png"
          alt="BAGm Beauty Supply"
          className={`${heightClasses} w-auto object-contain transition-transform duration-300 group-hover:scale-102`}
          loading="eager"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-charcoal-900 group-hover:text-brand-700 transition-colors">
            BAGm <span className="font-sans font-light text-brand-600 text-lg sm:text-xl">Beauty</span>
          </span>
          <span className="text-[10px] tracking-[0.25em] uppercase font-semibold text-gold-500 -mt-1 hidden sm:block">
            Supply Ghana
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl" aria-label="BAGm Beauty Supply Home">
        {content}
      </Link>
    );
  }

  return content;
}

export default Logo;
