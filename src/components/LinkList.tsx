import type { ReactNode } from 'react';
import { Animated, Linking, Pressable, StyleSheet, View } from 'react-native';
import { SITE_URL, type LinkIcon, type ProfileLink } from '../content';
import { fonts } from '../fonts';
import { colorEase, isWeb, useActive, useProgress } from '../motion';
import { useScale } from '../scale';
import { useTheme } from '../theme';
import { Icon, type IconName } from './Icon';

const ICONS: Record<LinkIcon, { name: IconName; brand: boolean }> = {
  about: { name: 'asterisk', brand: false },
  linkedin: { name: 'linkedin', brand: true },
  github: { name: 'github', brand: true },
  x: { name: 'x-twitter', brand: true },
  web: { name: 'globe', brand: false },
  appstore: { name: 'app-store-ios', brand: true },
  playstore: { name: 'google-play', brand: true },
};

type Props = {
  links: ProfileLink[];
  horizontal?: boolean; // a centred, wrapping row instead of a column (used in the footer)
  color?: string; // resting colour of labels and icons (default: link blue)
  hoverColor?: string; // colour on hover/press (default: main text colour)
  trailing?: ReactNode; // an extra item after the links (the footer's Back to top)
};

// Every link opens in a new tab (web) or the browser (native). On hover, or while pressed on a
// touch screen, the label takes the hover colour and the icon slides out to the top right while
// a ↗ arrow slides in from the bottom left.
export function LinkList({ links, horizontal, color, hoverColor, trailing }: Props) {
  const { colors } = useTheme();
  return (
    <View style={horizontal ? styles.rowList : styles.list}>
      {links.map((link) => (
        <LinkRow key={link.url} link={link} rest={color ?? colors.link} hover={hoverColor ?? colors.text} />
      ))}
      {trailing}
    </View>
  );
}

function LinkRow({ link, rest, hover }: { link: ProfileLink; rest: string; hover: string }) {
  const { s } = useScale();
  const { active, handlers } = useActive();
  const progress = useProgress(active);
  const shift = s(6);
  const icon = ICONS[link.icon];

  // On the web the row is a real <a target="_blank">; native opens the browser instead
  // (relative links like /resume.pdf are resolved against the live site).
  const url = link.url.startsWith('/') ? SITE_URL + link.url : link.url;
  const linkProps = isWeb
    ? { href: link.url, hrefAttrs: { target: '_blank', rel: 'noopener noreferrer' } }
    : { onPress: () => Linking.openURL(url) };

  const move = (from: number, to: number) =>
    progress.interpolate({ inputRange: [0, 1], outputRange: [from, to] });

  return (
    <Pressable
      {...(linkProps as object)}
      {...handlers}
      role="link"
      style={StyleSheet.flatten([styles.row, { minHeight: s(24) }])}
    >
      <View style={[styles.iconBox, { width: s(21), height: s(20) }]}>
        <Animated.View
          style={[
            styles.iconLayer,
            {
              opacity: move(1, 0),
              transform: [{ translateX: move(0, shift) }, { translateY: move(0, -shift) }],
            },
          ]}
        >
          <Icon name={icon.name} size={s(icon.brand ? 14 : 11)} color={rest} />
        </Animated.View>
        <Animated.View
          style={[
            styles.iconLayer,
            {
              opacity: progress,
              transform: [{ translateX: move(-shift, 0) }, { translateY: move(shift, 0) }],
            },
          ]}
        >
          <Icon name="arrow-up-right" size={s(15)} color={hover} />
        </Animated.View>
      </View>
      <Animated.Text
        style={[
          styles.label,
          { fontSize: s(15), lineHeight: s(23), color: active ? hover : rest },
          colorEase,
        ]}
      >
        {link.label}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { gap: 1, alignItems: 'flex-start' },
  rowList: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 44, rowGap: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { justifyContent: 'center', overflow: 'hidden' },
  iconLayer: { position: 'absolute', left: 0, top: 0, bottom: 0, justifyContent: 'center' },
  label: { fontFamily: fonts.regular },
});
