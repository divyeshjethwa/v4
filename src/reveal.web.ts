import { flushSync } from 'react-dom';

const DURATION_MS = 650;
const EASING = 'cubic-bezier(0.65, 0, 0.35, 1)';

type Doc = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void> };
};

// Runs `apply` (the theme switch) and reveals the new theme as a circle that grows from (x, y)
// until it covers the screen. Falls back to an instant switch where the browser has no
// View Transitions, or when the visitor prefers reduced motion.
export function revealFrom(x: number, y: number, apply: () => void) {
  const doc = document as Doc;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!doc.startViewTransition || reduced) {
    apply();
    return;
  }

  // The farthest corner from the button, so the circle always ends past every edge.
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  const transition = doc.startViewTransition(() => flushSync(apply));

  transition.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: DURATION_MS, easing: EASING, pseudoElement: '::view-transition-new(root)' },
    );
  });
}

// Turns off the browser's default cross-fade so only the circle animates.
export const revealCss =
  '::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal;}';
