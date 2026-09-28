import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Role } from '../content';
import { fonts } from '../fonts';
import { colorEase, isWeb, useActive } from '../motion';
import { useTheme } from '../theme';
import { Icon } from './Icon';

// Narrower than this, the years move above the title instead of sitting in their own column.
const NARROW = 400;
const DOT = 9;

// The Experience section: a quiet timeline. Each role shows years, title, company and a faint
// stack line; tap or click a role to open its dates and a few points. One role open at a time.
export function ExperienceList({ roles }: { roles: Role[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [width, setWidth] = useState(0);
  const narrow = width > 0 && width < NARROW;

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {roles.map((role, i) => (
        <RoleRow
          key={role.company + role.dates}
          role={role}
          first={i === 0}
          last={i === roles.length - 1}
          narrow={narrow}
          open={open === i}
          onToggle={() => setOpen(open === i ? null : i)}
        />
      ))}
    </View>
  );
}

type RowProps = {
  role: Role;
  first: boolean;
  last: boolean;
  narrow: boolean;
  open: boolean;
  onToggle: () => void;
};

function RoleRow({ role, first, last, narrow, open, onToggle }: RowProps) {
  const { colors } = useTheme();
  const { active, handlers } = useActive();
  const lit = active || open;

  // Open/close: the details' height animates between 0 and the height of their content.
  const [contentHeight, setContentHeight] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const [closed, setClosed] = useState(!open);

  useEffect(() => {
    if (open) setClosed(false);
    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: open ? 380 : 260,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !open) setClosed(true);
    });
  }, [open, progress]);

  const years = <Text style={[styles.years, { color: colors.toggleOff }]}>{role.years}</Text>;

  return (
    <View style={styles.row}>
      {!narrow && <View style={styles.yearsCol}>{years}</View>}

      {/* Timeline: a thin line through every role, with a dot that fills in when the role is active. */}
      <View style={styles.rail}>
        <View
          style={[
            styles.line,
            { backgroundColor: colors.border, top: first ? DOT_TOP : 0, bottom: last ? undefined : 0 },
            last && { height: DOT_TOP },
          ]}
        />
        <View
          style={[
            styles.dot,
            {
              borderColor: lit ? colors.link : colors.toggleOff,
              backgroundColor: lit ? colors.link : colors.background,
            },
          ]}
        />
      </View>

      <View style={styles.body}>
        <Pressable
          {...handlers}
          onPress={onToggle}
          aria-expanded={open}
          aria-label={`${role.title} at ${role.company}, ${open ? 'hide' : 'show'} details`}
          style={styles.head}
        >
          <View style={styles.headText}>
            {narrow && years}
            <Text style={[styles.title, { color: lit ? colors.link : colors.text }, colorEase]}>
              {role.title}
            </Text>
            <Text style={[styles.company, { color: colors.muted }]}>
              {role.company} · {role.place}
            </Text>
            <Text style={[styles.stack, { color: colors.toggleOff }]}>{role.stack.join(' · ')}</Text>
          </View>
          <Animated.View
            style={{
              marginTop: 2,
              transform: [
                { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) },
              ],
            }}
          >
            <Icon name="chevron-down" size={18} color={lit ? colors.link : colors.toggleOff} />
          </Animated.View>
        </Pressable>

        <Animated.View
          aria-hidden={!open}
          style={{
            height: progress.interpolate({ inputRange: [0, 1], outputRange: [0, contentHeight] }),
            overflow: 'hidden',
            ...(closed && isWeb ? ({ visibility: 'hidden' } as object) : null),
          }}
        >
          <Animated.View
            onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
            style={[
              styles.details,
              {
                opacity: progress,
                transform: [
                  { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) },
                ],
              },
            ]}
          >
            <Text style={[styles.dates, { color: colors.toggleOff }]}>{role.dates}</Text>
            {role.points.map((point) => (
              <View key={point} style={styles.point}>
                <Text style={[styles.dash, { color: colors.toggleOff }]}>–</Text>
                <Text style={[styles.pointText, { color: colors.muted }]}>{point}</Text>
              </View>
            ))}
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

const DOT_TOP = 18 + 10; // row padding + half the first line, so the dot sits beside it

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  yearsCol: { width: 96, paddingTop: 18 },
  years: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 21,
    ...(isWeb ? ({ fontVariant: ['tabular-nums'] } as object) : null),
  },
  rail: { width: 22, alignItems: 'center' },
  line: { position: 'absolute', width: StyleSheet.hairlineWidth * 2, left: 11 - StyleSheet.hairlineWidth },
  dot: { marginTop: DOT_TOP - DOT / 2, width: DOT, height: DOT, borderRadius: DOT, borderWidth: 1.5 },
  body: { flex: 1, paddingLeft: 10 },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 18,
    ...(isWeb ? { cursor: 'pointer' } : null),
  },
  headText: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21 },
  company: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  stack: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, marginTop: 2 },
  details: { position: 'absolute', top: 0, left: 0, right: 0, paddingBottom: 18, gap: 8 },
  dates: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19 },
  point: { flexDirection: 'row', gap: 8 },
  dash: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22 },
  pointText: { flex: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 22 },
});
