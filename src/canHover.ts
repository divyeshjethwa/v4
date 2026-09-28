import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// True on devices with a real mouse or trackpad. Touch screens (and native apps) get false,
// so hover-only extras are skipped and taps do the work instead.
// Starts false so the pre-rendered HTML matches the first render in the browser.
export function useCanHover() {
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setCanHover(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return canHover;
}
