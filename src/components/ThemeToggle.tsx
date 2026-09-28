import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { isWeb, useActive, useProgress } from '../motion';
import { unscaled } from '../scale';
import { useTheme } from '../theme';
import { Icon } from './Icon';

// Extra hover/tap area around the two dots, in px.
const HOVER_PAD = 10;

// Two dots: the big ringed one marks the current mode (left = light, right = dark).
// On hover (or while pressed on a touch screen), the small dot turns into an arrow pointing to
// the side the switch will move to. On click, the new theme spreads out from the toggle as a
// growing circle (reveal.web.ts on the web, RevealOverlay in theme.tsx on iOS/Android).
export function ThemeToggle() {
  const { scheme, colors, toggle } = useTheme();
  const ref = useRef<View>(null);
  const { active, handlers } = useActive();
  const progress = useProgress(active, 180);

  // The static HTML can't know the visitor's mode, so hold the space until the browser does.
  if (scheme === null) return <View {...unscaled} style={styles.placeholder} />;

  const isDark = scheme === 'dark';

  // The circle starts from the centre of the toggle, in screen coordinates.
  const onPress = () => {
    const node = ref.current;
    if (!node) return toggle();
    if (isWeb) {
      const r = (node as unknown as HTMLElement).getBoundingClientRect();
      return toggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    }
    node.measureInWindow((x, y, w, h) => toggle({ x: x + w / 2, y: y + h / 2 }));
  };

  const activeDot = (
    <View style={[styles.active, { backgroundColor: colors.toggleOn }]}>
      <View style={[styles.core, { backgroundColor: colors.background }]} />
    </View>
  );

  const idleSlot = (
    <View style={styles.idleSlot}>
      <Animated.View
        style={[
          styles.idle,
          {
            backgroundColor: colors.toggleOff,
            opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
            transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] }) }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.arrow,
          {
            opacity: progress,
            transform: [
              { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [isDark ? 5 : -5, 0] }) },
            ],
          },
        ]}
      >
        <Icon name={isDark ? 'arrow-left' : 'arrow-right'} size={18} color={colors.toggleOn} />
      </Animated.View>
    </View>
  );

  return (
    <Pressable
      {...unscaled}
      {...handlers}
      ref={ref}
      onPress={onPress}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={styles.track}
    >
      {isDark ? idleSlot : activeDot}
      {isDark ? activeDot : idleSlot}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // The padding makes the whole area around both dots hoverable and tappable;
  // the negative margin cancels it out so the layout doesn't move.
  placeholder: { width: 44, height: 24, margin: -HOVER_PAD, padding: HOVER_PAD, boxSizing: 'content-box' },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 24,
    padding: HOVER_PAD,
    margin: -HOVER_PAD,
    boxSizing: 'content-box',
    ...(isWeb ? { cursor: 'pointer' } : null),
  },
  active: { width: 20, height: 20, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  core: { width: 7, height: 7, borderRadius: 999 },
  idleSlot: { width: 18, height: 20, alignItems: 'center', justifyContent: 'center' },
  idle: { width: 7, height: 7, borderRadius: 999 },
  arrow: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
});
