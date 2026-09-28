import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { revealFrom } from './reveal';
import { snapshot } from './snapshot';

// Runs `start` and waits until it calls `done` (an image finished loading), or 800 ms at most.
const waitFor = (start: (done: () => void) => void) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, 800);
    start(() => {
      clearTimeout(timer);
      requestAnimationFrame(() => resolve());
    });
  });

// Waits for a few rendered frames.
const nextFrames = (n: number) =>
  new Promise<void>((resolve) => {
    const step = (left: number) => (left <= 0 ? resolve() : requestAnimationFrame(() => step(left - 1)));
    step(n);
  });

export type Scheme = 'light' | 'dark';

export const palette = {
  light: {
    background: '#ffffff',
    text: '#111318',
    muted: '#4b5160',
    link: '#1f4fe0',
    toggleOn: '#161a24',
    toggleOff: '#8a8f99',
    border: '#e6e8ec',
    surface: '#f3f4f6',
    frame: '#161a24',
    scrollThumb: '#d3d7de',
    footerBlue: '#2453e6',
    footerInk: '#ffffff',
    footerInkHover: '#0d1a4d',
  },
  dark: {
    background: '#0c0d10',
    text: '#eef0f4',
    muted: '#a3a9b5',
    link: '#7fa2ff',
    toggleOn: '#eef0f4',
    toggleOff: '#6b707a',
    border: '#24272e',
    surface: '#17191e',
    frame: '#2c2f37',
    scrollThumb: '#2d3139',
    footerBlue: '#86a7e6',
    footerInk: '#161a24',
    footerInkHover: '#0d2a8a',
  },
};

export type Colors = (typeof palette)['light'];

const isWeb = Platform.OS === 'web';
const STORAGE_KEY = 'theme';

// On the web every colour is a CSS variable. The page is pre-rendered to static HTML, and a small
// script in +html.tsx picks light or dark before the first paint, so the HTML never has to change
// when React loads and dark-mode visitors never see a white flash.
const cssVarColors = Object.fromEntries(
  Object.keys(palette.light).map((key) => [key, `var(--${key})`]),
) as Colors;

// Page scrollbar: a slim rounded thumb in the theme's grey that turns link-blue on hover.
// Firefox only understands scrollbar-color; Chrome, Edge and Safari use the ::-webkit rules.
const scrollbarCss = [
  '@supports (-moz-appearance:none){*{scrollbar-width:thin;scrollbar-color:var(--scrollThumb) transparent;}}',
  '::-webkit-scrollbar{width:12px;height:12px;}',
  '::-webkit-scrollbar-track{background:transparent;}',
  '::-webkit-scrollbar-thumb{background-color:var(--scrollThumb);border-radius:999px;border:3px solid var(--background);}',
  '::-webkit-scrollbar-thumb:hover{background-color:var(--link);}',
  '::-webkit-scrollbar-corner{background:transparent;}',
].join('');

export function themeCss() {
  const block = (scheme: Scheme) =>
    Object.entries(palette[scheme])
      .map(([key, value]) => `--${key}:${value};`)
      .join('');
  return (
    `:root,:root[data-theme="light"]{${block('light')}}:root[data-theme="dark"]{${block('dark')}}html,body{background-color:var(--background);}` +
    scrollbarCss
  );
}

export const themeScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}})();`;

type ThemeValue = {
  // null on the web until the page has loaded in the browser (the static HTML can't know it).
  scheme: Scheme | null;
  colors: Colors;
  toggle: (from?: { x: number; y: number }) => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system: Scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [chosen, setChosen] = useState<Scheme | null>(null);

  useEffect(() => {
    if (!isWeb) return;
    setChosen(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  }, []);

  const scheme: Scheme | null = isWeb ? chosen : (chosen ?? system);

  // iOS/Android version of the circular reveal (the web uses View Transitions, see reveal.web.ts).
  // 1. Take a picture of the screen in the old theme and lay it over everything.
  // 2. Switch the theme underneath it, then take a picture of the new theme.
  // 3. Grow a circle from the toggle that shows the new picture on top of the old one.
  // 4. Remove both pictures, leaving the real, already-switched screen.
  const rootRef = useRef<View>(null);
  const busy = useRef(false);
  const [reveal, setReveal] = useState<{
    oldUri: string;
    newUri?: string;
    x: number;
    y: number;
    r: number;
  } | null>(null);
  const grow = useRef(new Animated.Value(0.001)).current;
  const oldShown = useRef<() => void>(undefined);
  const newShown = useRef<() => void>(undefined);

  const nativeReveal = useCallback(
    async (next: Scheme, from: { x: number; y: number }) => {
      if (busy.current) return;
      busy.current = true;
      try {
        const { width, height } = Dimensions.get('window');
        const r = Math.hypot(Math.max(from.x, width - from.x), Math.max(from.y, height - from.y));
        const oldUri = await snapshot(rootRef);
        await waitFor((done) => {
          oldShown.current = done;
          setReveal({ oldUri, x: from.x, y: from.y, r });
        });
        setChosen(next);
        await nextFrames(3); // let the new theme render underneath before photographing it
        const newUri = await snapshot(rootRef);
        grow.setValue(0.001);
        await waitFor((done) => {
          newShown.current = done;
          setReveal((cur) => (cur ? { ...cur, newUri } : cur));
        });
        await new Promise<void>((resolve) =>
          Animated.timing(grow, {
            toValue: 1,
            duration: 600,
            easing: Easing.bezier(0.65, 0, 0.35, 1),
            useNativeDriver: true,
          }).start(() => resolve()),
        );
      } catch {
        setChosen(next); // snapshots failed: just switch
      } finally {
        setReveal(null);
        busy.current = false;
      }
    },
    [grow],
  );

  // `from` is the point the new theme spreads out from (the toggle's centre, in screen px).
  const toggle = useCallback(
    (from?: { x: number; y: number }) => {
      const next: Scheme = (scheme ?? system) === 'dark' ? 'light' : 'dark';

      if (!isWeb && from) {
        nativeReveal(next, from);
        return;
      }

      const apply = () => {
        setChosen(next);
        if (!isWeb) return;
        document.documentElement.dataset.theme = next;
        document.documentElement.style.colorScheme = next;
      };

      if (from) revealFrom(from.x, from.y, apply);
      else apply();

      if (!isWeb) return;
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Private mode or blocked storage: the toggle still works for this visit.
      }
    },
    [scheme, system, nativeReveal],
  );

  const value = useMemo<ThemeValue>(
    () => ({ scheme, colors: isWeb ? cssVarColors : palette[scheme ?? 'light'], toggle }),
    [scheme, toggle],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={styles.fill}>
        <View ref={rootRef} collapsable={false} style={styles.fill}>
          {children}
        </View>
        {reveal && (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Image
              source={{ uri: reveal.oldUri }}
              style={StyleSheet.absoluteFill}
              fadeDuration={0}
              onLoad={() => oldShown.current?.()}
            />
            {reveal.newUri && (
              // A circle centred on the toggle, scaled up from nothing. The inner layer undoes the
              // scale (same centre), so the new-theme picture inside stays lined up with the screen.
              <Animated.View
                style={{
                  position: 'absolute',
                  left: reveal.x - reveal.r,
                  top: reveal.y - reveal.r,
                  width: reveal.r * 2,
                  height: reveal.r * 2,
                  borderRadius: reveal.r,
                  overflow: 'hidden',
                  transform: [{ scale: grow }],
                }}
              >
                <Animated.View
                  style={[StyleSheet.absoluteFill, { transform: [{ scale: Animated.divide(1, grow) }] }]}
                >
                  <Image
                    source={{ uri: reveal.newUri }}
                    fadeDuration={0}
                    onLoad={() => newShown.current?.()}
                    style={{
                      position: 'absolute',
                      left: -(reveal.x - reveal.r),
                      top: -(reveal.y - reveal.r),
                      width: Dimensions.get('window').width,
                      height: Dimensions.get('window').height,
                    }}
                  />
                </Animated.View>
              </Animated.View>
            )}
          </View>
        )}
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
