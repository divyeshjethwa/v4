import Svg, { Path } from 'react-native-svg';
import { ICON_PATHS, type IconName } from '../iconPaths';

// A small inline SVG icon. Replaces the icon fonts (FontAwesome, Feather), which cost ~300 KB
// to download for the dozen icons the site uses. `size` matches the old font size.
export function Icon({ name, size, color }: { name: IconName; size: number; color: string }) {
  const { d, w, h } = ICON_PATHS[name];
  return (
    <Svg width={(size * w) / h} height={size} viewBox={`0 0 ${w} ${h}`} pointerEvents="none">
      <Path d={d} fill={color} />
    </Svg>
  );
}

export type { IconName };
