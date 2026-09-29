import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';
import { footerCss } from '../components/Footer';
import { fontCss, fontPreloads } from '../fonts';
import { projectListCss } from '../components/ProjectList';
import { revealCss } from '../reveal';
import { scaleCss } from '../scale';
import { themeCss, themeScript } from '../theme';

// Web-only root HTML. The theme script runs before the page paints, so it opens in the right mode.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        {/* Tab icon: the ringed dot from the theme toggle; the SVG switches colours for dark browser themes. */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {fontPreloads.map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <style
          dangerouslySetInnerHTML={{
            __html: fontCss + themeCss() + scaleCss() + revealCss + footerCss + projectListCss,
          }}
        />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
