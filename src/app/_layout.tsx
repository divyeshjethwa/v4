import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { fontAssets } from '../fonts';
import { ThemeProvider, useTheme } from '../theme';

function ThemedStack() {
  const { scheme, colors } = useTheme();
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : scheme === 'light' ? 'dark' : 'auto'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
    </>
  );
}

export default function RootLayout() {
  // Text falls back to the system font until Inter arrives, instead of blocking the page.
  useFonts(fontAssets);

  return (
    <ThemeProvider>
      <ThemedStack />
    </ThemeProvider>
  );
}
