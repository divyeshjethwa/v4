import { useRef, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useCanHover } from '../canHover';
import { DEFAULT_ASPECT, type Project } from '../content';
import { useTheme } from '../theme';
import { DeviceFrame, Screen, screenWidth } from './DeviceFrame';
import { Icon } from './Icon';

const PLACEHOLDER_COUNT = 3;
const isWeb = Platform.OS === 'web';

// The project's screenshots inside its frame. Swipe (touch) or scroll sideways to move between
// screens; mouse users also get arrow buttons beside the frame. Dots below show where you are.
export function ScreenPager({ project, width }: { project: Project; width: number }) {
  const { colors } = useTheme();
  const canHover = useCanHover();
  const scroller = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const aspect = project.screenAspect ?? DEFAULT_ASPECT[project.type];
  const inner = screenWidth(project.type, width);
  const height = inner / aspect;
  const count = project.screens?.length ?? PLACEHOLDER_COUNT;

  // Moving the current dot: a CSS transition on the web, a layout animation on iOS/Android.
  const select = (i: number) => {
    if (!isWeb) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIndex(i);
  };

  const goTo = (i: number) => {
    const next = Math.max(0, Math.min(count - 1, i));
    scroller.current?.scrollTo({ x: next * inner, animated: true });
    select(next);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / inner);
    if (i !== index) select(i);
  };

  const arrow = (dir: -1 | 1) => {
    const disabled = dir === -1 ? index === 0 : index === count - 1;
    return (
      <Pressable
        onPress={() => goTo(index + dir)}
        disabled={disabled}
        aria-label={dir === -1 ? 'Previous screen' : 'Next screen'}
        style={(state) => [
          styles.arrow,
          { borderColor: colors.border, opacity: disabled ? 0.3 : 1 },
          (state as { hovered?: boolean }).hovered && !disabled && { backgroundColor: colors.surface },
        ]}
      >
        <Icon name={dir === -1 ? 'chevron-left' : 'chevron-right'} size={16} color={colors.text} />
      </Pressable>
    );
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {canHover && count > 1 && arrow(-1)}
        <DeviceFrame type={project.type} width={width} aspect={aspect} statusBar={project.statusBar}>
          <ScrollView
            ref={scroller}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={32}
            style={[{ width: inner, height }, isWeb && ({ scrollSnapType: 'x mandatory' } as object)]}
          >
            {Array.from({ length: count }, (_, i) => (
              <View key={i} style={isWeb ? ({ scrollSnapAlign: 'start' } as object) : undefined}>
                <Screen
                  source={project.screens?.[i]}
                  label={project.name}
                  index={i}
                  width={inner}
                  height={height}
                />
              </View>
            ))}
          </ScrollView>
        </DeviceFrame>
        {canHover && count > 1 && arrow(1)}
      </View>

      {count > 1 && (
        <View style={styles.dots}>
          {Array.from({ length: count }, (_, i) => (
            <Pressable key={i} onPress={() => goTo(i)} aria-label={`Screen ${i + 1}`} hitSlop={6}>
              <View
                style={[
                  styles.dot,
                  {
                    width: i === index ? 16 : 6,
                    backgroundColor: i === index ? colors.text : colors.toggleOff,
                  },
                  isWeb &&
                    ({
                      transitionProperty: 'width, background-color',
                      transitionDuration: '200ms',
                    } as object),
                ]}
              />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  arrow: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { height: 6, borderRadius: 999 },
});
