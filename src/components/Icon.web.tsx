import { ICON_PATHS, type IconName } from '../iconPaths';

// Web version of Icon: a plain <svg>, so the website doesn't ship react-native-svg (~40 KB).
// Same props and sizing as Icon.tsx, which iOS/Android use.
export function Icon({ name, size, color }: { name: IconName; size: number; color: string }) {
  const { d, w, h } = ICON_PATHS[name];
  return (
    <svg
      width={(size * w) / h}
      height={size}
      viewBox={`0 0 ${w} ${h}`}
      style={{ display: 'block', pointerEvents: 'none', flexShrink: 0 }}
      aria-hidden="true"
    >
      <path d={d} fill={color} />
    </svg>
  );
}

export type { IconName };
