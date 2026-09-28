import Head from 'expo-router/head';
import { useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ExperienceList } from '../components/ExperienceList';
import { Footer } from '../components/Footer';
import { LinkList } from '../components/LinkList';
import { ProjectList } from '../components/ProjectList';
import { ThemeToggle } from '../components/ThemeToggle';
import { experience, profile, projects } from '../content';
import { fonts } from '../fonts';
import { scaled, useScale } from '../scale';
import { useTheme } from '../theme';

export default function Home() {
  const { colors } = useTheme();
  const { s } = useScale();
  const scroller = useRef<ScrollView>(null);
  // Keeps the hero clear of the notch / status bar in the native app (0 on the web).
  const insets = useSafeAreaInsets();

  // Base sizes, multiplied by the hero scale in src/scale.ts.
  const sized = {
    column: { maxWidth: s(380), paddingTop: s(72) + insets.top },
    name: { fontSize: s(15), lineHeight: s(21) },
    title: { fontSize: s(15), lineHeight: s(21) },
    intro: { marginTop: s(62), marginBottom: s(56), gap: s(18) },
    body: { fontSize: s(15), lineHeight: s(25) },
    projects: { marginTop: s(72), gap: s(14) },
  };

  return (
    <ScrollView
      ref={scroller}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.page}
    >
      <Head>
        <title>{`${profile.name} · ${profile.title}`}</title>
        <meta name="description" content={profile.intro.join(' ')} />
      </Head>

      <View {...scaled} style={[styles.column, sized.column]}>
        <View style={styles.header}>
          <View>
            <Text role="heading" aria-level={1} style={[styles.name, sized.name, { color: colors.text }]}>
              Hi, I’m {profile.name}
            </Text>
            <Text style={[styles.title, sized.title, { color: colors.muted }]}>{profile.title}</Text>
          </View>
          <ThemeToggle />
        </View>

        <View style={sized.intro}>
          {profile.intro.map((line) => (
            <Text key={line} style={[styles.body, sized.body, { color: colors.muted }]}>
              {line}
            </Text>
          ))}
        </View>

        <LinkList links={profile.links} />

        <View style={sized.projects}>
          <Text role="heading" aria-level={2} style={[styles.name, sized.name, { color: colors.text }]}>
            Projects
          </Text>
          <ProjectList projects={projects} />
        </View>

        <View style={sized.projects}>
          <Text role="heading" aria-level={2} style={[styles.name, sized.name, { color: colors.text }]}>
            Experience
          </Text>
          <ExperienceList roles={experience} />
        </View>
      </View>

      <Footer onBackToTop={() => scroller.current?.scrollTo({ y: 0, animated: true })} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  column: { width: '100%' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontFamily: fonts.semibold },
  title: { fontFamily: fonts.regular },
  body: { fontFamily: fonts.regular },
});
