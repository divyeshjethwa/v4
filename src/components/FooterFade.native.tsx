import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Mask, Pattern, Rect, Stop } from 'react-native-svg';

// iOS/Android version of the footer card's background (the web draws it with CSS masks in
// footerCss). Same recipe: a smooth blue fade, plus a 2px checkerboard of the same blue that
// fades out further down, which gives the dithered tail.
export function FooterFade({ color, narrow }: { color: string; narrow: boolean }) {
  const smoothEnd = narrow ? 0.7 : 0.58;
  const ditherStart = narrow ? 0.25 : 0.18;
  const ditherEnd = narrow ? 1 : 0.92;
  const ditherEndOpacity = narrow ? 0.35 : 0;

  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <LinearGradient id="smooth" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={1} />
          <Stop offset="0.12" stopColor={color} stopOpacity={1} />
          <Stop offset={smoothEnd} stopColor={color} stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id="ditherFade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset={ditherStart} stopColor="#fff" stopOpacity={1} />
          <Stop offset={ditherEnd} stopColor="#fff" stopOpacity={ditherEndOpacity} />
        </LinearGradient>
        <Pattern id="checker" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <Rect x="0" y="0" width="2" height="2" fill={color} />
          <Rect x="2" y="2" width="2" height="2" fill={color} />
        </Pattern>
        <Mask id="ditherMask" x="0" y="0" width="100%" height="100%">
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#ditherFade)" />
        </Mask>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#checker)" mask="url(#ditherMask)" />
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#smooth)" />
    </Svg>
  );
}
