# Lotos favicon pack

Fajlovi su pripremljeni iz dostavljene slike `logolotos.jpg`.

## Sadržaj paketa

- `favicon.ico` — multi-size ICO: 16, 32, 48, 64, 128 i 256 px
- `favicon-16x16.png`
- `favicon-32x32.png`
- `favicon-48x48.png`
- `favicon-64x64.png`
- `favicon-96x96.png`
- `favicon-128x128.png`
- `favicon-150x150.png`
- `favicon-180x180.png`
- `favicon-192x192.png`
- `favicon-256x256.png`
- `favicon-384x384.png`
- `favicon-512x512.png`
- `apple-touch-icon.png` — 180x180
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`
- `mstile-150x150.png`
- `site.webmanifest`
- `browserconfig.xml`
- `html-head-snippet.txt`
- `nextjs-metadata-snippet.txt`
- `favicon-source-1024.png` — master ikonica bez teksta, optimizovana za male dimenzije
- `logo-lotos-original.png` — originalna dostavljena slika u PNG formatu

## Implementacija na Next.js / Netlify

1. Kopirati sve PNG/ICO/XML/WEBMANIFEST fajlove iz ovog ZIP-a u frontend folder:
   `public/`

2. Ako projekat koristi `app/layout.tsx`, proveriti/dodati metadata iz:
   `nextjs-metadata-snippet.txt`

3. Ako projekat koristi klasični `<head>`, dodati tagove iz:
   `html-head-snippet.txt`

4. Očistiti cache browsera i Netlify cache posle deploy-a.

## Napomena

Za favicon sam koristio samo gornji simbol/logomark bez teksta "Lotos", zato što je tekst nečitljiv na 16x16 i 32x32. Originalni full logo je sačuvan u paketu kao `logo-lotos-original.png`.
