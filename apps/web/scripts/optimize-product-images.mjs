/** One-time helper. It intentionally requires explicit input/output arguments and is never run by Netlify. */
import path from 'node:path';import fs from 'node:fs';import sharp from 'sharp';
const [, , input, output] = process.argv;
if (!input || !output) { console.error('Upotreba: node scripts/optimize-product-images.mjs <ulaz.png> <izlaz.webp>'); process.exit(1); }
if (!/^[a-z0-9-]+\.webp$/.test(path.basename(output))) { console.error('Izlaz mora biti ASCII kebab-case .webp naziv.'); process.exit(1); }
await fs.promises.mkdir(path.dirname(output), { recursive: true });
await sharp(input).rotate().resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true }).webp({ quality: 83 }).toFile(output);
console.log(`Kreirano: ${output}`);
