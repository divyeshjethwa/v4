import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';

// A 0 → 1 value that animates whenever `on` changes. Works the same on iOS, Android and the web
// (CSS transitions only exist on the web, so every motion in the app goes through this instead).
export function useProgress(on: boolean, duration = 200) {
  const value = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(value, {
      toValue: on ? 1 : 0,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: !isWeb,
    }).start();
  }, [on, duration, value]);
  return value;
}

// "Active" = hovered with a mouse, or pressed with a finger. Touch screens have no hover,
// so pressing is what triggers the same animation there. Spread the handlers onto a Pressable.
export function useActive() {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  return {
    active: hovered || pressed,
    handlers: {
      onHoverIn: () => setHovered(true),
      onHoverOut: () => setHovered(false),
      onPressIn: () => setPressed(true),
      // Hold the pressed look a moment on touch screens so the animation is actually seen.
      onPressOut: () => (isWeb ? setPressed(false) : setTimeout(() => setPressed(false), 260)),
    },
  };
}

// Colour changes: a CSS transition on the web; on native the colour just switches.
export const colorEase = isWeb
  ? ({
      transitionProperty: 'color',
      transitionDuration: '200ms',
      transitionTimingFunction: 'ease-out',
    } as object)
  : null;
