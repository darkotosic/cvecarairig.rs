import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const products = JSON.parse(fs.readFileSync(path.join(root, 'data/products.json'), 'utf8'));
const activeProducts = products.filter((product) => product.active).sort((a, b) => a.sortOrder - b.sortOrder);
const siteUrl = 'https://cvecarairig.rs';
const featuredImages = [
  '/proizvodi/rodjendanska-kutija-pastel-deluxe.png',
  '/proizvodi/buket-sunce-za-rodjendan.png',
  '/proizvodi/premium-ruze-za-rodjendan.png',
  '/proizvodi/sareni-rodjendanski-miks.png',
];

const escapeXml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const imageXml = (product) => `    <image:image>\n      <image:loc>${escapeXml(`${siteUrl}${product.image}`)}</image:loc>\n      <image:title>${escapeXml(product.name)}</image:title>\n    </image:image>`;
const homepageProducts = featuredImages.map((image) => activeProducts.find((product) => product.image === image)).filter(Boolean);
if (homepageProducts.length !== featuredImages.length) throw new Error('Svi izdvojeni SEO proizvodi moraju biti aktivni u katalogu.');

const entries = [
  `  <url>\n    <loc>${siteUrl}/</loc>\n${homepageProducts.map(imageXml).join('\n')}\n  </url>`,
  ...activeProducts.map((product) => `  <url>\n    <loc>${siteUrl}/products/${escapeXml(product.slug)}</loc>\n${imageXml(product)}\n  </url>`),
];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${entries.join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(root, 'public/image-sitemap.xml'), xml);
console.log(`Image sitemap je generisan za ${activeProducts.length} aktivnih proizvoda.`);
