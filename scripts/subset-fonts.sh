#!/usr/bin/env bash
# Rebuilds the web fonts in public/fonts: Inter 400 and 600, Latin characters only, as WOFF2.
# Needs fonttools + brotli:  pip install fonttools brotli
set -e
cd "$(dirname "$0")/.."
for w in 400Regular 600SemiBold; do
  pyftsubset "node_modules/@expo-google-fonts/inter/$w/Inter_$w.ttf" \
    --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2190-2193,U+2212" \
    --flavor=woff2 --layout-features='kern,liga,calt,tnum' \
    --output-file="public/fonts/Inter_$w.woff2"
done
