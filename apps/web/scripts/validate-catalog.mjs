import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const products = JSON.parse(fs.readFileSync(path.join(root, 'data/products.json'), 'utf8'));
const categories = JSON.parse(fs.readFileSync(path.join(root, 'data/categories.json'), 'utf8'));
const errors = [];
const warnings = [];
const productImageNamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:png|webp)$/;

const unique = (field) => {
  const seen = new Set();
  for (const product of products) {
    const value = product[field];
    if (!value) errors.push(`${field} nedostaje: ${product.id ?? 'nepoznat proizvod'}`);
    else if (seen.has(value)) errors.push(`Duplikat ${field}: ${value}`);
    seen.add(value);
  }
};

['id', 'sku', 'slug'].forEach(unique);

const categoryIds = new Set(categories.map((category) => category.id));
const referenced = new Set();

for (const product of products) {
  for (const field of ['name', 'shortDescription', 'description', 'seoTitle', 'seoDescription']) {
    if (typeof product[field] !== 'string' || !product[field].trim()) {
      errors.push(`${product.sku}: ${field} nedostaje`);
    }
  }

  if (!categoryIds.has(product.categoryId)) {
    errors.push(`${product.sku}: nepoznata kategorija ${product.categoryId}`);
  }
  if (typeof product.priceRsd !== 'number' || !Number.isFinite(product.priceRsd) || product.priceRsd <= 0) {
    errors.push(`${product.sku}: priceRsd mora biti pozitivna RSD cena`);
  }
  if (
    product.compareAtPriceRsd != null &&
    (typeof product.compareAtPriceRsd !== 'number' ||
      !Number.isFinite(product.compareAtPriceRsd) ||
      product.compareAtPriceRsd <= product.priceRsd)
  ) {
    errors.push(`${product.sku}: compareAtPriceRsd mora biti veći od priceRsd`);
  }
  if (!Number.isInteger(product.sortOrder) || product.sortOrder < 0) {
    errors.push(`${product.sku}: sortOrder nije validan`);
  }

  const variantIds = new Set();
  for (const variant of product.variants ?? []) {
    if (!variant.id || variantIds.has(variant.id)) {
      errors.push(`${product.sku}: neispravan/dupliran ID varijante`);
    }
    variantIds.add(variant.id);
    if (typeof variant.priceRsd !== 'number' || !Number.isFinite(variant.priceRsd) || variant.priceRsd <= 0) {
      errors.push(`${product.sku}/${variant.id}: cena varijante nije validna`);
    }
  }

  for (const image of [product.image, ...(product.images ?? [])]) {
    if (!image) continue;
    if (/^https?:\/\//i.test(image)) errors.push(`${product.sku}: udaljena slika nije dozvoljena`);
    if (!image.startsWith('/')) errors.push(`${product.sku}: putanja slike mora početi kosom crtom: ${image}`);

    const normalized = image.replace(/^\//, '');
    const imageName = path.basename(normalized);
    const imagePath = path.resolve(root, 'public', normalized);
    referenced.add(normalized);

    if (!imagePath.startsWith(`${path.join(root, 'public')}${path.sep}`)) {
      errors.push(`${product.sku}: putanja slike izlazi iz public direktorijuma: ${image}`);
      continue;
    }

    if (!productImageNamePattern.test(imageName)) {
      errors.push(`${product.sku}: naziv slike mora biti ASCII kebab-case: ${image}`);
    }
    if (!fs.existsSync(imagePath)) {
      errors.push(`${product.sku}: slika ne postoji: ${image}`);
    } else {
      if (fs.statSync(imagePath).size === 0) errors.push(`${product.sku}: slika je prazna: ${image}`);
      try {
        const metadata = await sharp(imagePath).metadata();
        if (!metadata.width || !metadata.height || metadata.width < 300 || metadata.height < 300 || metadata.width * metadata.height < 50_000) {
          errors.push(`${product.sku}: slika mora biti najmanje 300x300 px: ${image}`);
        }
      } catch {
        errors.push(`${product.sku}: dimenzije slike nije moguće pročitati: ${image}`);
      }
    }
    if (/^(?:image\d*|photo\d*|img\d*)\.(?:png|webp)$/i.test(imageName)) warnings.push(`${product.sku}: generički naziv slike: ${image}`);
  }

  if (product.active && !product.image) errors.push(`${product.sku}: aktivan proizvod nema sliku`);
  if (/placeholder/i.test(product.image ?? '')) warnings.push(`${product.sku}: koristi placeholder`);
}

const productImagesDirectory = path.join(root, 'public/proizvodi');
for (const name of fs.readdirSync(productImagesDirectory)) {
  if (name === '.gitkeep') continue;

  const relativePath = `proizvodi/${name}`;
  if (!productImageNamePattern.test(name)) {
    errors.push(`Neispravan naziv slike za deploy: /${relativePath}`);
  }
  if (!referenced.has(relativePath)) warnings.push(`Nereferencirana slika: /${relativePath}`);
}

warnings.forEach((warning) => console.warn(`UPOZORENJE: ${warning}`));
if (errors.length) {
  errors.forEach((error) => console.error(`GREŠKA: ${error}`));
  process.exit(1);
}

console.log(`Katalog je validan: ${products.length} proizvoda, ${categories.length} kategorije.`);
