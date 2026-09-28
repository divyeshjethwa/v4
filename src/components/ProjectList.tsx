import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useCanHover } from '../canHover';
import { fonts } from '../fonts';
import { DEFAULT_ASPECT, type Project } from '../content';
import { PHONE_MAX_WIDTH, SCALE } from '../scale';
import { useTheme } from '../theme';
import { DeviceFrame, Screen, screenWidth } from './DeviceFrame';
import { LinkList } from './LinkList';
import { ScreenPager } from './ScreenPager';
import { Icon } from './Icon';

const isWeb = Platform.OS === 'web';
const ease = (props: string, ms = 200) =>
  isWeb
    ? ({
        transitionProperty: props,
        transitionDuration: `${ms}ms`,
        transitionTimingFunction: 'ease-out',
      } as object)
    : null;

// Window width from which website screenshots grow wider than the text column.
const BREAKOUT_MIN = 900;

// The open panel animates its height with overflow hidden, which would also cut off a screenshot
// that's wider than the column. This lets it spill sideways while still clipping top and bottom.
export const projectListCss = '[data-clip-y]{overflow:visible!important;clip-path:inset(0 -100vw);}';

// Width of the floating hover preview, per frame type.
const PREVIEW_WIDTH = { app: 120, web: 240 };

// The projects section: one quiet row per project.
// Tap or click a row to open it (screenshots in a phone or browser frame, details, links).
// With a mouse, hovering a closed row also shows a small preview that follows the cursor.
export function ProjectList({ projects }: { projects: Project[] }) {
  const { colors } = useTheme();
  const canHover = useCanHover();
  const listRef = useRef<View>(null);
  const [width, setWidth] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Hover preview position and visibility.
  const pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const shown = useRef(new Animated.Value(0)).current;
  const previewProject = projects.find((p) => p.slug === hovered && p.slug !== open);

  useEffect(() => {
    Animated.timing(shown, {
      toValue: previewProject ? 1 : 0,
      duration: 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: !isWeb,
    }).start();
  }, [previewProject, shown]);

  // Follow the cursor. The hero column is scaled with CSS zoom, so convert screen px to layout px.
  const onPointerMove = (e: { nativeEvent: { clientX: number; clientY: number } }) => {
    const el = listRef.current as unknown as (HTMLElement & { currentCSSZoom?: number }) | null;
    if (!el?.getBoundingClientRect) return;
    const rect = el.getBoundingClientRect();
    const zoom = el.currentCSSZoom ?? 1;
    Animated.spring(pos, {
      toValue: {
        x: (e.nativeEvent.clientX - rect.left) / zoom,
        y: (e.nativeEvent.clientY - rect.top) / zoom,
      },
      useNativeDriver: false,
      speed: 28,
      bounciness: 0,
    }).start();
  };

  return (
    <View ref={listRef} style={styles.list} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {projects.map((project) => (
        <ProjectRow
          key={project.slug}
          project={project}
          width={width}
          open={open === project.slug}
          onToggle={() => setOpen(open === project.slug ? null : project.slug)}
          onHover={(on) => setHovered(on ? project.slug : (h) => (h === project.slug ? null : h))}
          onPointerMove={canHover ? onPointerMove : undefined}
        />
      ))}
      <View style={[styles.rule, { backgroundColor: colors.border }]} />

      {canHover && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.preview,
            {
              opacity: shown,
              transform: [
                { translateX: pos.x },
                { translateY: pos.y },
                { scale: shown.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
              ],
            },
          ]}
        >
          {/* Anchored at the cursor and growing up and to the right, so the hovered row stays readable. */}
          <View style={styles.previewAnchor}>
            {previewProject && <HoverPreview project={previewProject} />}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

function HoverPreview({ project }: { project: Project }) {
  const width = PREVIEW_WIDTH[project.type];
  const aspect = project.screenAspect ?? DEFAULT_ASPECT[project.type];
  const inner = screenWidth(project.type, width);
  return (
    <View style={styles.previewShadow}>
      <DeviceFrame type={project.type} width={width} aspect={aspect} statusBar={project.statusBar}>
        <Screen
          source={project.screens?.[0]}
          label={project.name}
          index={0}
          width={inner}
          height={inner / aspect}
        />
      </DeviceFrame>
    </View>
  );
}

type RowProps = {
  project: Project;
  width: number;
  open: boolean;
  onToggle: () => void;
  onHover: (on: boolean) => void;
  onPointerMove?: (e: { nativeEvent: { clientX: number; clientY: number } }) => void;
};

function ProjectRow({ project, width, open, onToggle, onHover, onPointerMove }: RowProps) {
  const { colors } = useTheme();
  const canHover = useCanHover();

  // Open/close: the panel's height animates between 0 and the height of its content.
  const [contentHeight, setContentHeight] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  // Fully closed panels are hidden so their links can't be tabbed to or read out.
  const [closed, setClosed] = useState(!open);
  // Screenshots aren't rendered (or downloaded) until the row is opened the first time.
  const [opened, setOpened] = useState(open);

  useEffect(() => {
    if (open) {
      setClosed(false);
      setOpened(true);
    }
    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: open ? 420 : 300,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !open) setClosed(true);
    });
  }, [open, progress]);

  // Frame size: phones stay narrow, browser windows use the column (minus room for the arrows).
  const arrowRoom = canHover ? 2 * (30 + 14) : 0;
  // On wide screens, website screenshots break out of the narrow text column so they're big enough
  // to read: up to ~1000px across on screen. The column is scaled with CSS zoom, so convert back.
  const { width: windowWidth } = useWindowDimensions();
  const zoom = isWeb ? (windowWidth < PHONE_MAX_WIDTH ? SCALE.phone : SCALE.wide) : 1;
  const breakout = project.type === 'web' && isWeb && windowWidth >= BREAKOUT_MIN && width > 0;
  const pagerWidth = breakout ? Math.round(Math.min(windowWidth - 160, 1000) / zoom) : width;
  const frameWidth =
    project.type === 'app' ? Math.min(230, Math.round(width * 0.62)) : Math.max(160, pagerWidth - arrowRoom);

  return (
    <View {...({ onPointerMove } as object)}>
      <View style={[styles.rule, { backgroundColor: colors.border }]} />

      <Pressable
        onPress={onToggle}
        onHoverIn={() => onHover(true)}
        onHoverOut={() => onHover(false)}
        aria-expanded={open}
        aria-label={`${project.name}, ${open ? 'hide' : 'show'} details`}
        style={styles.row}
      >
        {(state) => {
          // Mouse hover on the web, finger-down on touch screens.
          const hovered = !!(state as { hovered?: boolean }).hovered || state.pressed;
          return (
            <>
              <View style={styles.rowText}>
                <View style={styles.titleLine}>
                  <Text
                    style={[
                      styles.name,
                      { color: hovered || open ? colors.link : colors.text },
                      ease('color'),
                    ]}
                  >
                    {project.name}
                  </Text>
                  <Text style={[styles.year, { color: colors.toggleOff }]}>{project.year}</Text>
                </View>
                <Text style={[styles.summary, { color: colors.muted }]}>{project.summary}</Text>
              </View>
              <Animated.View
                style={{
                  transform: [
                    { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] }) },
                  ],
                }}
              >
                <Icon name="plus" size={18} color={hovered || open ? colors.link : colors.muted} />
              </Animated.View>
            </>
          );
        }}
      </Pressable>

      <Animated.View
        {...(breakout ? { dataSet: { clipY: 'true' } } : {})}
        style={{
          height: progress.interpolate({ inputRange: [0, 1], outputRange: [0, contentHeight] }),
          overflow: 'hidden',
          ...(closed && isWeb ? ({ visibility: 'hidden' } as object) : null),
        }}
        aria-hidden={!open}
      >
        <Animated.View
          onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
          style={[
            styles.panel,
            {
              opacity: progress,
              transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
            },
          ]}
        >
          {width > 0 && opened && (
            <View style={breakout ? { width: pagerWidth, marginLeft: (width - pagerWidth) / 2 } : null}>
              <ScreenPager project={project} width={frameWidth} />
            </View>
          )}
          <Text style={[styles.description, { color: colors.muted }]}>{project.description}</Text>
          <Text style={[styles.meta, { color: colors.toggleOff }]}>
            {[project.role, ...project.stack].filter(Boolean).join(' · ')}
          </Text>
          {project.links.length > 0 && <LinkList links={project.links} />}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { position: 'relative' },
  rule: { height: StyleSheet.hairlineWidth, width: '100%' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    ...(isWeb ? { cursor: 'pointer' } : null),
  },
  rowText: { flex: 1, gap: 2 },
  titleLine: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  name: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21 },
  year: { fontFamily: fonts.regular, fontSize: 13 },
  summary: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 },
  panel: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 8, paddingBottom: 28, gap: 18 },
  description: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 25 },
  meta: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, marginTop: -8 },
  preview: { position: 'absolute', top: 0, left: 0, width: 0, height: 0, zIndex: 10 },
  previewAnchor: { position: 'absolute', left: 20, bottom: 14 },
  previewShadow: {
    borderRadius: 18,
    ...(isWeb ? ({ boxShadow: '0 12px 32px rgba(0,0,0,0.18)' } as object) : null),
  },
});
