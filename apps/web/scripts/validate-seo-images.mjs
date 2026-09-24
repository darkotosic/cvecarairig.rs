import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = path.join(root, 'public');
const products = JSON.parse(fs.readFileSync(path.join(root, 'data/products.json'), 'utf8'));
const activeProducts = products.filter((product) => product.active);
const requiredImages = ['/proizvodi/rodjendanska-kutija-pastel-deluxe.png', '/logo-lotos-original.png', '/proizvodi/buket-sunce-za-rodjendan.png', '/proizvodi/premium-ruze-za-rodjendan.png', '/proizvodi/sareni-rodjendanski-miks.png'];
const sitemapPath = path.join(publicRoot, 'image-sitemap.xml');
const errors = [];
const supportedExtension = /\.(?:png|webp|jpe?g)$/i;

for (const image of [...requiredImages, ...activeProducts.map((product) => product.image)]) {
  if (!image || !image.startsWith('/') || /^https?:/i.test(image)) errors.push(`Slika mora biti lokalna apsolutna putanja: ${image}`);
  if (!supportedExtension.test(image ?? '')) errors.push(`Nepodržana ekstenzija slike: ${image}`);
  const resolved = path.resolve(publicRoot, `.${image}`);
  if (!resolved.startsWith(`${publicRoot}${path.sep}`) || !fs.existsSync(resolved)) errors.push(`Slika ne postoji u public direktorijumu: ${image}`);
}
const slugs = activeProducts.map((product) => product.slug);
if (new Set(slugs).size !== slugs.length) errors.push('Aktivni proizvodi imaju duplirane slug vrednosti.');
if (!fs.existsSync(sitemapPath)) errors.push('public/image-sitemap.xml nije generisan.');
else {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  for (const product of activeProducts) {
    if (!sitemap.includes(`https://cvecarairig.rs${product.image}`)) errors.push(`Image sitemap ne sadrži sliku: ${product.image}`);
    if (!sitemap.includes(`https://cvecarairig.rs/products/${product.slug}`)) errors.push(`Image sitemap ne sadrži proizvod: ${product.slug}`);
  }
}
if (errors.length) { errors.forEach((error) => console.error(`GREŠKA: ${error}`)); process.exit(1); }
console.log(`SEO slike su validne: ${activeProducts.length} aktivnih proizvoda i ${requiredImages.length} ključnih slika.`);
