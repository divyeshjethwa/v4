import { Platform, useWindowDimensions } from 'react-native';

// How much bigger the hero is than the base sizes written in the components.
// Phones get a smaller bump so body text doesn't crowd a narrow screen.
export const SCALE = { phone: 1.15, wide: 1.3 };
export const PHONE_MAX_WIDTH = 600;

const isWeb = Platform.OS === 'web';

// On the web the hero is scaled with CSS `zoom`, picked by a media query, so the pre-rendered
// HTML is already the right size before React loads and nothing jumps.
// `data-scaled` scales an element; `data-unscaled` cancels it for a child (the theme toggle).
export function scaleCss() {
  return [
    `:root{--scale:${SCALE.phone}}`,
    `@media (min-width:${PHONE_MAX_WIDTH}px){:root{--scale:${SCALE.wide}}}`,
    `[data-scaled]{zoom:var(--scale)}`,
    `[data-unscaled]{zoom:calc(1 / var(--scale))}`,
  ].join('');
}

export const scaled = isWeb ? { dataSet: { scaled: 'true' } } : {};
export const unscaled = isWeb ? { dataSet: { unscaled: 'true' } } : {};

// Native apps have no CSS zoom, so sizes are multiplied here instead.
// On the web s(n) returns n unchanged and the zoom does the work.
export function useScale() {
  const { width } = useWindowDimensions();
  const factor = width < PHONE_MAX_WIDTH ? SCALE.phone : SCALE.wide;
  return { s: (n: number) => (isWeb ? n : Math.round(n * factor)) };
}
