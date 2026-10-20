'use client';

import React from 'react';
import Link from 'next/link';

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
  showText = true, // Name beside the logo by default
  className = '',
  href = '/',
}: LogoProps) {
  // Enhanced, larger height map for clear visibility
  const heightClasses = {
    sm: 'h-10 sm:h-11',
    md: 'h-12 sm:h-14',
    lg: 'h-14 sm:h-16',
    xl: 'h-16 sm:h-20',
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-3 group ${className}`}>
      {/* Enlarged Crisp Logo Graphic Container */}
      <div
        className={`relative flex items-center justify-center rounded-2xl overflow-hidden transition-all duration-300 ${
          variant === 'admin'
            ? 'p-1.5 bg-white border border-rose-200/90 shadow-xs group-hover:border-brand-500'
            : variant === 'footer'
            ? 'p-1.5 bg-charcoal-950 border border-charcoal-800 shadow-md group-hover:border-brand-500'
            : 'p-1.5 bg-white border border-rose-200 shadow-sm group-hover:border-brand-500/60 group-hover:shadow-md'
        }`}
      >
        <img
          src="/logo.png"
          alt="BAGm Beauty Supply"
          className={`${heightClasses} w-auto object-contain transition-transform duration-300 group-hover:scale-103`}
          loading="eager"
        />
      </div>

      {/* Brand Name Beside Logo */}
      {showText && (
        <div className="flex flex-col justify-center text-left">
          {variant === 'admin' ? (
            <>
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-charcoal-900 group-hover:text-brand-700 transition-colors leading-none">
                BAGm <span className="font-sans font-light text-brand-600">Admin</span>
              </span>
              <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-gold-600 mt-1 block">
                Store Operations
              </span>
            </>
          ) : (
            <>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-charcoal-900 group-hover:text-brand-700 transition-colors leading-tight">
                BAGm <span className="font-sans font-light text-brand-600">Beauty</span>
              </span>
              <span className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-bold text-gold-600 block -mt-0.5">
                Supply Ghana
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-2xl"
        aria-label="BAGm Beauty Supply Home"
      >
        {content}
      </Link>
    );
  }

  return content;
}

export default Logo;
