import confetti from 'canvas-confetti';

let isFrameRunning = false;
let animationFrameId: number | null = null;

export const stopCelebration = () => {
  if (typeof window === 'undefined') return;
  isFrameRunning = false;
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  try {
    confetti.reset();
  } catch {
    // Ignore if canvas was not mounted
  }
};

/**
 * Single Minimal Celebration Effect
 * Only enabled (Yes) or disabled (No).
 */
export const triggerCelebration = (enabled: boolean | string = true) => {
  if (typeof window === 'undefined') return;

  // Single binary setting: If 'No' or false or 'none', do nothing!
  if (enabled === false || enabled === 'no' || enabled === 'none') {
    stopCelebration();
    return;
  }

  // Cancel any prior active animation first
  stopCelebration();

  // One single minimal celebration: soft 20 particles with subtle hearts
  isFrameRunning = true;
  const end = Date.now() + 600;
  const colors = ['#f43f5e', '#ec4899', '#a855f7', '#fb7185'];

  (function frame() {
    if (!isFrameRunning) return;

    confetti({
      particleCount: 2,
      angle: 60,
      spread: 30,
      origin: { x: 0.1, y: 0.8 },
      colors: colors,
      shapes: ['circle'],
      scalar: 0.85,
      ticks: 70,
    });

    confetti({
      particleCount: 2,
      angle: 120,
      spread: 30,
      origin: { x: 0.9, y: 0.8 },
      colors: colors,
      shapes: ['circle'],
      scalar: 0.85,
      ticks: 70,
    });

    if (Date.now() < end && isFrameRunning) {
      animationFrameId = requestAnimationFrame(frame);
    } else {
      isFrameRunning = false;
    }
  })();

  // Central subtle pop
  confetti({
    particleCount: 16,
    spread: 40,
    origin: { y: 0.7 },
    colors: ['#ec4899', '#8b5cf6', '#fda4af'],
    ticks: 70,
    scalar: 0.8,
    disableForReducedMotion: true,
  });
};
