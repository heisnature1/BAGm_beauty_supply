'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export function OrderConfetti() {
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#BE185D', '#D4AF37', '#F472B6', '#E5C378'],
      });
    } catch {}
  }, []);

  return null;
}
