'use client';

import React, { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

interface GsapRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  distance?: number;
  stagger?: number;
}

export function GsapReveal({
  children,
  className = '',
  delay = 0.1,
  duration = 0.8,
  direction = 'up',
  distance = 24,
  stagger,
}: GsapRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      let x = 0;
      let y = 0;

      if (direction === 'up') y = distance;
      if (direction === 'down') y = -distance;
      if (direction === 'left') x = distance;
      if (direction === 'right') x = -distance;

      const target = stagger ? containerRef.current.children : containerRef.current;

      gsap.fromTo(
        target,
        {
          opacity: 0,
          x,
          y,
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration,
          delay,
          stagger: stagger || 0,
          ease: 'power3.out',
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
