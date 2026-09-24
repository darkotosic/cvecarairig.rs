import type { Metadata } from 'next';
import type { Product } from './types';
import { getCategoryById } from './catalog';
import { store } from './store';

export const siteUrl = 'https://cvecarairig.rs';
export const homePrimaryImage = '/proizvodi/rodjendanska-kutija-pastel-deluxe.png';
export const businessLogo = '/logo-lotos-original.png';
export const featuredSearchImages = [
  homePrimaryImage,
  '/proizvodi/buket-sunce-za-rodjendan.png',
  '/proizvodi/premium-ruze-za-rodjendan.png',
  '/proizvodi/sareni-rodjendanski-miks.png',
] as const;

export function absoluteUrl(url?: string | null) {
  if (!url) return undefined;
  return url.startsWith('http') ? url : `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

export const homePrimaryImageAbsolute = absoluteUrl(homePrimaryImage)!;
export const canonicalUrl = (path = '/') => `${siteUrl}${path.startsWith('/') ? '' : '/'}${path}`;
export const fallbackBrandName = store.brand;
export const fallbackLogoUrl = store.logo;
export const getBrandName = () => store.brand;

export function cleanMetaDescription(
  value?: string | null,
  fallback = 'Online Cvećara Irig — sveži buketi, aranžmani i dostava cveća u Irigu i okolini.',
) {
  const text = (value ?? fallback).replace(/\s+/g, ' ').trim();
  return text.length <= 160 ? text : `${text.slice(0, 157).trimEnd()}...`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  image,
  imageWidth = 1254,
  imageHeight = 1254,
  imageAlt,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  noIndex?: boolean;
}): Metadata {
  const cleanDescription = cleanMetaDescription(description);
  const url = canonicalUrl(path);
  const imageUrl = absoluteUrl(image);
  return {
    title,
    description: cleanDescription,
    alternates: { canonical: path },
    robots: { index: !noIndex, follow: true, googleBot: { index: !noIndex, follow: true, 'max-image-preview': 'large' } },
    openGraph: {
      type: 'website', url, siteName: store.brand, title, description: cleanDescription, locale: 'sr_RS',
      images: imageUrl ? [{ url: imageUrl, width: imageWidth, height: imageHeight, alt: imageAlt ?? title }] : undefined,
    },
    twitter: { card: imageUrl ? 'summary_large_image' : 'summary', title, description: cleanDescription, images: imageUrl ? [imageUrl] : undefined },
  };
}

export function buildWebSiteJsonLd() {
  return { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: `${siteUrl}/`, name: store.brand, inLanguage: 'sr-RS' };
}

export function buildHomeWebPageJsonLd() {
  return {
    '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${siteUrl}/#webpage`, url: `${siteUrl}/`,
    name: 'Online Cvećara Irig | Cveće, buketi i dostava',
    description: 'Sveži buketi, ruže i cvetni aranžmani sa lokalnom dostavom u Irigu i okolini.',
    primaryImageOfPage: { '@type': 'ImageObject', '@id': `${siteUrl}/#primaryimage`, url: homePrimaryImageAbsolute, contentUrl: homePrimaryImageAbsolute, width: 1254, height: 1254, caption: 'Rođendanska kutija Pastel Deluxe — Online Cvećara Irig' },
    isPartOf: { '@id': `${siteUrl}/#website` }, about: { '@id': `${siteUrl}/#florist` }, mainEntity: { '@id': `${siteUrl}/#florist` }, inLanguage: 'sr-RS',
  };
}

export function buildFloristJsonLd() {
  return {
    '@context': 'https://schema.org', '@type': 'Florist', '@id': `${siteUrl}/#florist`, name: store.brand, url: siteUrl,
    logo: { '@type': 'ImageObject', url: absoluteUrl(businessLogo) }, image: featuredSearchImages.map((image) => absoluteUrl(image)),
    telephone: store.phone, email: store.email, areaServed: store.serviceArea, openingHours: store.businessHours,
    contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer support', telephone: store.phone, email: store.email, availableLanguage: ['sr'] }],
  };
}

export function buildFeaturedProductsJsonLd(products: Product[]) {
  return {
    '@context': 'https://schema.org', '@type': 'ItemList', name: 'Izdvojeni cvetni aranžmani',
    itemListElement: products.map((product, index) => {
      const url = canonicalUrl(`/products/${product.slug}`);
      return { '@type': 'ListItem', position: index + 1, url, item: { '@type': 'Product', name: product.name, image: absoluteUrl(product.image), url, sku: product.sku, offers: { '@type': 'Offer', priceCurrency: 'RSD', price: product.priceRsd.toFixed(2), url } } };
    }),
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: canonicalUrl(item.path) })) };
}

export function buildProductJsonLd(product: Product, imageUrls: string[], productUrl: string, brandName = store.brand) {
  return {
    '@context': 'https://schema.org', '@type': 'Product', '@id': `${productUrl}#product`, name: product.name,
    brand: { '@type': 'Brand', name: brandName }, category: getCategoryById(product.categoryId)?.name, description: product.seoDescription,
    image: imageUrls.map((image) => ({ '@type': 'ImageObject', url: image, contentUrl: image, width: 1254, height: 1254, caption: product.name })),
    url: productUrl, sku: product.sku, offers: { '@type': 'Offer', priceCurrency: 'RSD', price: product.priceRsd.toFixed(2), url: productUrl },
  };
}

export function buildProductWebPageJsonLd(product: Product, productUrl: string) {
  const image = absoluteUrl(product.image)!;
  return {
    '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${productUrl}#webpage`, url: productUrl, name: product.seoTitle,
    primaryImageOfPage: { '@type': 'ImageObject', url: image, contentUrl: image, width: 1254, height: 1254, caption: product.name },
    isPartOf: { '@id': `${siteUrl}/#website` }, mainEntity: { '@id': `${productUrl}#product` }, inLanguage: 'sr-RS',
  };
}
