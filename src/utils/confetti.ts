import confetti from 'canvas-confetti';
import { CelebrationEffect } from '../types';

export const triggerCelebration = (effect: CelebrationEffect = 'confetti') => {
  if (typeof window === 'undefined') return;

  if (effect === 'hearts') {
    const end = Date.now() + 1000;
    const colors = ['#f43f5e', '#ec4899', '#fb7185', '#fda4af', '#f472b6'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
        shapes: ['circle'],
        scalar: 1.2
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
        shapes: ['circle'],
        scalar: 1.2
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
    return;
  }

  if (effect === 'fireworks') {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#f59e0b', '#fbbf24', '#fef08a']
    });
    fire(0.2, {
      spread: 60,
      colors: ['#a855f7', '#ec4899', '#3b82f6']
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      colors: ['#ec4899', '#8b5cf6']
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45
    });
    return;
  }

  if (effect === 'sparkles') {
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#fef08a', '#e0e7ff', '#c084fc'],
      ticks: 200,
      gravity: 0.6,
      scalar: 1.1,
    });
    return;
  }

  // Default: rich duo confetti
  confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.65 },
    colors: ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981'],
    disableForReducedMotion: true,
  });
};
