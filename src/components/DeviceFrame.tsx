import type { ReactNode } from 'react';
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { fonts } from '../fonts';
import { useTheme } from '../theme';

type FrameProps = {
  type: 'app' | 'web';
  width: number; // outer width of the frame, in px
  aspect: number; // screen width / height
  children: ReactNode; // the screen content, sized to the frame's inner area
  // Phones only: adds a status-bar strip above the screenshot in this colour, so the Dynamic Island
  // sits on empty space instead of covering the app (for screenshots taken without a status bar).
  statusBar?: string;
};

// The inner (screen) width for a frame of a given outer width.
export function screenWidth(type: 'app' | 'web', width: number) {
  return type === 'app' ? width - 2 * phoneBezel(width) : width - 2;
}

const phoneBezel = (width: number) => Math.max(4, Math.round(width * 0.035));
const statusBarHeight = (inner: number) => Math.round(inner * 0.13);

// A phone (for apps) or a browser window (for websites), drawn in code so screenshots can be plain.
export function DeviceFrame({ type, width, aspect, children, statusBar }: FrameProps) {
  const { colors } = useTheme();
  const inner = screenWidth(type, width);
  const screenHeight = inner / aspect;

  if (type === 'app') {
    const bezel = phoneBezel(width);
    const radius = Math.round(width * 0.15);
    const inset = statusBar ? statusBarHeight(inner) : 0;
    return (
      <View
        style={{
          width,
          padding: bezel,
          borderRadius: radius,
          backgroundColor: colors.frame,
        }}
      >
        <View
          style={{
            width: inner,
            height: screenHeight + inset,
            paddingTop: inset,
            borderRadius: radius - bezel,
            overflow: 'hidden',
            backgroundColor: statusBar ?? colors.surface,
          }}
        >
          {children}
          {/* Dynamic Island */}
          <View
            pointerEvents="none"
            style={[
              styles.island,
              {
                top: Math.round(inner * 0.035),
                width: Math.round(inner * 0.3),
                height: Math.round(inner * 0.085),
                marginLeft: -Math.round(inner * 0.15),
              },
            ]}
          />
        </View>
      </View>
    );
  }

  const bar = Math.max(14, Math.round(width * 0.05));
  const dot = Math.max(5, Math.round(bar * 0.3));
  return (
    <View
      style={{
        width,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        overflow: 'hidden',
      }}
    >
      <View style={[styles.bar, { height: bar, gap: dot * 0.8, paddingHorizontal: bar * 0.5 }]}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{ width: dot, height: dot, borderRadius: dot, backgroundColor: colors.border }}
          />
        ))}
      </View>
      <View style={{ width: inner, height: screenHeight, overflow: 'hidden' }}>{children}</View>
    </View>
  );
}

// One screen: the screenshot, or a numbered placeholder while there isn't one.
export function Screen({
  source,
  label,
  index,
  width,
  height,
}: {
  source?: ImageSourcePropType;
  label: string;
  index: number;
  width: number;
  height: number;
}) {
  const { colors } = useTheme();

  if (source) {
    return (
      <Image
        source={source}
        style={{ width, height }}
        resizeMode="cover"
        accessibilityLabel={`${label}, screen ${index + 1}`}
      />
    );
  }

  return (
    <View style={[styles.placeholder, { width, height, backgroundColor: colors.surface }]}>
      <Text style={[styles.placeholderTitle, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.placeholderText, { color: colors.muted }]}>Screen {index + 1}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  island: {
    position: 'absolute',
    left: '50%',
    borderRadius: 999,
    backgroundColor: '#000',
  },
  bar: { flexDirection: 'row', alignItems: 'center' },
  placeholder: { alignItems: 'center', justifyContent: 'center', gap: 4, padding: 12 },
  placeholderTitle: { fontFamily: fonts.semibold, fontSize: 13, textAlign: 'center' },
  placeholderText: { fontFamily: fonts.regular, fontSize: 12 },
});
