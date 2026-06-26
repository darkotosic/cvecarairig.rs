import type { Metadata } from 'next';
import type { Product, PublicStoreSettings } from '@/lib/api';

export const fallbackBrandName = process.env.NEXT_PUBLIC_BRAND_NAME ?? 'Online Cvećara Irig';
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvecarairig.rs').replace(/\/$/, '');
export const fallbackLogoUrl = process.env.NEXT_PUBLIC_LOGO_URL;

const defaultDescription =
  'Online Cvećara Irig - sveži buketi, ruže, flower box aranžmani i dostava cveća u Irigu i okolini.';

export function absoluteUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  return url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function canonicalUrl(path = '/') {
  return `${siteUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function cleanMetaDescription(value?: string | null, fallback = defaultDescription) {
  const text = (value ?? fallback).replace(/\s+/g, ' ').trim();
  if (text.length <= 160) return text;
  return `${text.slice(0, 157).trimEnd()}...`;
}

export function getBrandName(settings?: PublicStoreSettings | null) {
  return settings?.company_name?.trim() || fallbackBrandName;
}

export function buildPageMetadata({
  title,
  description,
  path,
  image,
  brandName = fallbackBrandName,
  type = 'website',
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  brandName?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}): Metadata {
  const normalizedDescription = cleanMetaDescription(description);
  const url = canonicalUrl(path);
  const absoluteImage = absoluteUrl(image);

  return {
    title,
    description: normalizedDescription,
    alternates: { canonical: path },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type,
      url,
      siteName: brandName,
      title,
      description: normalizedDescription,
      locale: 'sr_RS',
      images: absoluteImage ? [{ url: absoluteImage, alt: title }] : undefined,
    },
    twitter: {
      card: absoluteImage ? 'summary_large_image' : 'summary',
      title,
      description: normalizedDescription,
      images: absoluteImage ? [absoluteImage] : undefined,
    },
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

export function buildProductJsonLd(product: Product, imageUrls: string[], productUrl: string, brandName: string) {
  const stock = product.effective_stock_quantity ?? product.stock_quantity;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    brand: { '@type': 'Brand', name: brandName },
    category: product.category?.name,
    ...(product.seo_description || product.short_description || product.description
      ? { description: product.seo_description ?? product.short_description ?? product.description }
      : {}),
    ...(imageUrls.length ? { image: imageUrls } : {}),
    sku: product.sku ?? product.variants?.find((variant) => variant.sku)?.sku ?? String(product.id),
    url: productUrl,
    offers: {
      '@type': 'Offer',
      priceCurrency: product.currency || 'RSD',
      price: (product.price_cents / 100).toFixed(2),
      availability: stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: productUrl,
    },
  };
}
