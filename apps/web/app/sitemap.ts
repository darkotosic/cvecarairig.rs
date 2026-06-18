import type { MetadataRoute } from 'next';
import type { Product, ProductListResponse } from '@/lib/api';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvecarairig.rs').replace(/\/$/, '');
const apiBaseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL)?.replace(/\/$/, '');
const sitemapFetchTimeoutMs = 5000;
const maxProductPages = 50;

const staticPaths = [
  '',
  '/products',
  '/about',
  '/contact',
  '/shipping',
  '/returns',
  '/flower-care',
  '/privacy-policy',
  '/terms-and-conditions',
];

function buildStaticRoutes(lastModified: Date): MetadataRoute.Sitemap {
  return staticPaths.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: path === '' || path === '/products' ? 'daily' : 'monthly',
    priority: path === '' ? 1 : path === '/products' ? 0.9 : 0.6,
  }));
}

async function fetchProductsPage(page: number, pageSize: number): Promise<ProductListResponse> {
  if (!apiBaseUrl) {
    return { items: [], total: 0, page, page_size: pageSize, pages: 1 };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), sitemapFetchTimeoutMs);

  try {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    const response = await fetch(`${apiBaseUrl}/api/v1/products/?${params.toString()}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Products API returned ${response.status}`);
    }

    return response.json() as Promise<ProductListResponse>;
  } finally {
    clearTimeout(timeout);
  }
}

async function getAllActiveProducts(): Promise<Product[]> {
  const pageSize = 100;
  const products: Product[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await fetchProductsPage(page, pageSize);
    products.push(...response.items.filter((product) => product.is_active && product.slug));
    totalPages = Math.min(response.pages || 1, maxProductPages);
    page += 1;
  } while (page <= totalPages);

  return products;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const generatedAt = new Date();
  const staticRoutes = buildStaticRoutes(generatedAt);

  try {
    const products = await getAllActiveProducts();
    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${siteUrl}/products/${encodeURIComponent(product.slug)}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : generatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    console.warn('Sitemap product URLs could not be loaded; serving static sitemap routes.', error);
    return staticRoutes;
  }
}
