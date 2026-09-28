// Web: Inter comes from two small subset WOFF2 files in public/fonts (~18 KB each), declared
// in +html.tsx, instead of the full 340 KB TTFs that expo-google-fonts would download.
// Regenerate them with scripts/subset-fonts.sh if you ever need more characters.
export const fontAssets = {};

export const fonts = {
  regular: 'Inter_400Regular',
  semibold: 'Inter_600SemiBold',
};

const face = (family: string, file: string, weight: number) =>
  `@font-face{font-family:'${family}';src:url('/fonts/${file}') format('woff2');font-weight:${weight};font-style:normal;font-display:swap;}`;

export const fontCss =
  face('Inter_400Regular', 'Inter_400Regular.woff2', 400) +
  face('Inter_600SemiBold', 'Inter_600SemiBold.woff2', 600);

export const fontPreloads = ['/fonts/Inter_400Regular.woff2', '/fonts/Inter_600SemiBold.woff2'];
