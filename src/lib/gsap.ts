import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Register GSAP plugins safely in browser environment
if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP);
}

export { gsap, useGSAP };

/**
 * Custom hook to trigger a staggered fade-in + slide-up reveal on container children.
 */
export function useGsapStaggerReveal(
  selector: string = '> *',
  deps: any[] = [],
  options: {
    duration?: number;
    stagger?: number;
    y?: number;
    delay?: number;
    ease?: string;
  } = {}
) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const elements = containerRef.current.querySelectorAll(selector);
      if (elements.length === 0) return;

      gsap.fromTo(
        elements,
        {
          opacity: 0,
          y: options.y ?? 24,
        },
        {
          opacity: 1,
          y: 0,
          duration: options.duration ?? 0.8,
          stagger: options.stagger ?? 0.08,
          delay: options.delay ?? 0.1,
          ease: options.ease ?? 'power3.out',
        }
      );
    },
    { scope: containerRef, dependencies: deps }
  );

  return containerRef;
}

/**
 * Custom hook for smooth hero content reveals with sequential timings
 */
export function useGsapHeroReveal() {
  const heroRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!heroRef.current) return;

      const badge = heroRef.current.querySelector('.gsap-hero-badge');
      const heading = heroRef.current.querySelector('.gsap-hero-heading');
      const subtitle = heroRef.current.querySelector('.gsap-hero-subtitle');
      const ctas = heroRef.current.querySelectorAll('.gsap-hero-cta');
      const trustRibbon = heroRef.current.querySelector('.gsap-hero-trust');

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (badge) {
        tl.fromTo(badge, { opacity: 0, y: -16, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.7 });
      }

      if (heading) {
        tl.fromTo(heading, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.85 }, '-=0.4');
      }

      if (subtitle) {
        tl.fromTo(subtitle, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.75 }, '-=0.5');
      }

      if (ctas && ctas.length > 0) {
        tl.fromTo(
          ctas,
          { opacity: 0, y: 20, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.65, stagger: 0.12 },
          '-=0.4'
        );
      }

      if (trustRibbon) {
        tl.fromTo(trustRibbon, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3');
      }
    },
    { scope: heroRef }
  );

  return heroRef;
}

/**
 * Hook for numerical counter animations (e.g. 100% Authentic, 48H, 5000+ orders)
 */
export function useGsapCounter(targetNumber: number, duration: number = 1.5) {
  const numberRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!numberRef.current) return;
    const obj = { val: 0 };

    const tween = gsap.to(obj, {
      val: targetNumber,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (numberRef.current) {
          numberRef.current.textContent = Math.round(obj.val).toLocaleString();
        }
      },
    });

    return () => {
      tween.kill();
    };
  }, [targetNumber, duration]);

  return numberRef;
}
