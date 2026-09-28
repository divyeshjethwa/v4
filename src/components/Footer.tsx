import { useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { profile } from '../content';
import { fonts } from '../fonts';
import { colorEase, useActive, useProgress } from '../motion';
import { useTheme } from '../theme';
import { FooterFade } from './FooterFade';
import { LinkList } from './LinkList';
import { Icon } from './Icon';

const isWeb = Platform.OS === 'web';
const MAX_WIDTH = 1240;

const SHORT_LABELS: Partial<Record<string, string>> = { linkedin: 'LinkedIn', github: 'GitHub', x: 'X' };

// The card's blue fades into the page through a pixel-dither pattern. That needs CSS masks,
// so on the web it's drawn by these rules (included in +html.tsx); native gets a flat blue.
export const footerCss = [
  '[data-footer-card]::before,[data-footer-card]::after{content:"";position:absolute;inset:0;pointer-events:none;}',
  // Smooth part: solid at the top, gone by just past halfway.
  '[data-footer-card]::before{background:var(--footerBlue);',
  '-webkit-mask-image:linear-gradient(to bottom,#000 0%,#000 12%,transparent 58%);',
  'mask-image:linear-gradient(to bottom,#000 0%,#000 12%,transparent 58%);}',
  // Dithered tail: a 2px checkerboard of the same blue, fading out further down.
  '[data-footer-card]::after{background:repeating-conic-gradient(var(--footerBlue) 0 25%,transparent 0 50%) 0 0/4px 4px;',
  '-webkit-mask-image:linear-gradient(to bottom,#000 18%,transparent 92%);',
  'mask-image:linear-gradient(to bottom,#000 18%,transparent 92%);}',
  // Phones: a longer, gentler fade so both lines of the stacked name stay visible.
  '[data-footer-card="narrow"]::before{-webkit-mask-image:linear-gradient(to bottom,#000 0%,#000 12%,transparent 70%);',
  'mask-image:linear-gradient(to bottom,#000 0%,#000 12%,transparent 70%);}',
  '[data-footer-card="narrow"]::after{-webkit-mask-image:linear-gradient(to bottom,#000 25%,rgba(0,0,0,.35) 100%);',
  'mask-image:linear-gradient(to bottom,#000 25%,rgba(0,0,0,.35) 100%);}',
].join('');

export function Footer({ onBackToTop }: { onBackToTop: () => void }) {
  const { colors } = useTheme();
  const [cardWidth, setCardWidth] = useState(0);
  const narrow = cardWidth > 0 && cardWidth < 640;

  // Phones get short labels ("LinkedIn") so the row fits; wider screens show the full URLs.
  const links = profile.links
    .filter((l) => profile.footerLinks.includes(l.icon))
    .map((l) => (narrow ? { ...l, label: SHORT_LABELS[l.icon] ?? l.label } : l));

  // The big name: one line on wide screens, stacked on two lines on phones so it can stay large.
  const nameLines = narrow ? profile.fullName.split(' ') : [profile.fullName];
  const nameSize = Math.round(cardWidth * (narrow ? 0.24 : 0.118));

  return (
    <View style={styles.footer} role="contentinfo">
      <View style={narrow ? styles.topLineNarrow : styles.topLine}>
        <Text style={[styles.small, narrow && styles.center, { color: colors.muted }]}>{profile.madeIn}</Text>
        {!!profile.funLine && (
          <Text style={[styles.small, narrow && styles.center, { color: colors.muted }]}>
            {profile.funLine}
          </Text>
        )}
      </View>

      <View
        {...(isWeb ? { dataSet: { footerCard: narrow ? 'narrow' : 'wide' } } : {})}
        onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
        style={[styles.card, { height: narrow ? 340 : 400 }]}
      >
        {/* iOS/Android have no CSS masks: the same fade is drawn with SVG there. */}
        {!isWeb && <FooterFade color={colors.footerBlue} narrow={narrow} />}
        <View style={[styles.links, { paddingTop: narrow ? 56 : 128 }]}>
          <LinkList
            links={links}
            horizontal
            color={colors.footerInk}
            hoverColor={colors.footerInkHover}
            trailing={
              <BackToTop onPress={onBackToTop} color={colors.footerInk} hoverColor={colors.footerInkHover} />
            }
          />
        </View>

        {nameSize > 0 && (
          <View aria-hidden style={[styles.bigName, { bottom: -nameSize * (narrow ? 0.02 : 0.1) }]}>
            {nameLines.map((line) => (
              <Text
                key={line}
                numberOfLines={1}
                style={[
                  styles.bigNameText,
                  {
                    color: colors.background,
                    fontSize: nameSize,
                    lineHeight: nameSize * 0.92,
                    letterSpacing: -nameSize * 0.035,
                  },
                ]}
              >
                {line}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function BackToTop({
  onPress,
  color,
  hoverColor,
}: {
  onPress: () => void;
  color: string;
  hoverColor: string;
}) {
  const { active, handlers } = useActive();
  const progress = useProgress(active);
  const c = active ? hoverColor : color;
  return (
    <Pressable
      {...handlers}
      onPress={onPress}
      role="button"
      aria-label="Back to top"
      style={styles.backToTop}
    >
      <Animated.View
        style={[
          styles.backIcon,
          { transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }] },
        ]}
      >
        <Icon name="arrow-up" size={15} color={c} />
      </Animated.View>
      <Text style={[styles.backLabel, { color: c }, colorEase]}>Back to top</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  footer: { width: '100%', maxWidth: MAX_WIDTH, marginTop: 140 },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 22,
  },
  topLineNarrow: { alignItems: 'center', gap: 4, paddingBottom: 18 },
  center: { textAlign: 'center' },
  small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  card: {
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  links: { position: 'relative', zIndex: 1, paddingHorizontal: 24 },
  bigName: { position: 'absolute', left: 0, right: 0, zIndex: 1 },
  bigNameText: {
    textAlign: 'center',
    fontFamily: fonts.semibold,
    ...(isWeb ? ({ userSelect: 'none', whiteSpace: 'nowrap' } as object) : null),
  },
  backToTop: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 24,
    ...(isWeb ? { cursor: 'pointer' } : null),
  },
  backIcon: { width: 21 },
  backLabel: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23 },
});
