import Link from 'next/link';
import type { Metadata, ResolvingMetadata } from 'next';
import { SectionHeader } from '@/components/SectionHeader';
import { ProductFilters } from '@/components/ProductFilters';
import { ProductGrid } from '@/components/ProductGrid';
import { getCategories, getProducts, type Category, type ProductListResponse } from '@/lib/api';
import { loadPublicStoreSettings } from '@/lib/store-settings';
import { buildBreadcrumbJsonLd, buildPageMetadata, getBrandName } from '@/lib/seo';

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }, _parent: ResolvingMetadata): Promise<Metadata> {
  const raw = await searchParams;
  const category = first(raw.category);
  const query = first(raw.q);
  const page = first(raw.page);
  const settings = await loadPublicStoreSettings();
  const brandName = getBrandName(settings);
  const title = category ? `Cvetni aranžmani - ${category}` : query ? `Pretraga aranžmana - ${query}` : 'Aranžmani';
  const description = category
    ? `Sveži cvetni aranžmani iz kategorije ${category} sa lokalnom dostavom u Irigu i okolini.`
    : 'Katalog svežih buketa, ruža, flower box aranžmana i poklon aranžmana za lokalnu dostavu u Irigu i okolini.';
  const path = createPageHref({ q: query, category, page }, page ? Number(page) || 1 : 1);
  return buildPageMetadata({ title, description, path, brandName, noIndex: Boolean(query || page) });
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

const toCents = (value?: string) => {
  if (!value) return undefined;
  const normalized = value.replace(',', '.').trim();
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return String(Math.round(parsed * 100));
};

const toPage = (value?: string) => {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return undefined;
  return String(parsed);
};

function createPageHref(params: Record<string, string | undefined>, page: number) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (key !== 'page' && value) search.set(key, value);
  });
  if (page > 1) search.set('page', String(page));
  const query = search.toString();
  return query ? `/products?${query}` : '/products';
}

async function loadCatalog(params: Record<string, string | undefined>): Promise<{ products: ProductListResponse; categories: Category[] } | null> {
  try {
    const [products, categories] = await Promise.all([getProducts(params), getCategories().catch(() => [])]);
    return { products, categories };
  } catch {
    return null;
  }
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const uiParams = {
    q: first(raw.q),
    category: first(raw.category),
    min_price_rsd: first(raw.min_price_rsd),
    max_price_rsd: first(raw.max_price_rsd),
    sort: first(raw.sort),
    page: first(raw.page),
  };
  const apiParams = {
    q: uiParams.q,
    category: uiParams.category,
    min_price: toCents(uiParams.min_price_rsd),
    max_price: toCents(uiParams.max_price_rsd),
    sort: uiParams.sort,
    page: toPage(uiParams.page),
  };
  const [catalog, settings] = await Promise.all([loadCatalog(apiParams), loadPublicStoreSettings()]);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([{ name: 'Početna', path: '/' }, { name: 'Aranžmani', path: '/products' }]);

  if (!catalog) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <SectionHeader eyebrow="Cvećara" title="Aranžmani" description="Katalog trenutno nije dostupan. Pokušajte kasnije." />
        <div className="mt-8 border border-amber-200 bg-amber-50 p-6 text-amber-900">Katalog trenutno nije dostupan. Pokušajte kasnije.</div>
      </main>
    );
  }

  const { page, pages } = catalog.products;
  const hasPrevious = page > 1;
  const hasNext = page < pages;

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <SectionHeader eyebrow="Cvećara" title="Aranžmani" description="Katalog svežih buketa, ruža, flower box aranžmana i poklon aranžmana za lokalnu dostavu." />
      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <ProductFilters categories={catalog.categories} searchParams={uiParams} />
        <div>
          <ProductGrid products={catalog.products.items} phone={settings.store_phone} />
          {catalog.products.items.length === 0 && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-700">
              <p className="text-lg font-semibold text-primary">Nema aranžmana za izabrane filtere.</p>
              <p className="mt-2 text-slate-600">Probajte širi raspon RSD cena, uklonite kategoriju ili pogledajte celu kolekciju.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/products" className="border border-primary px-4 py-2 font-semibold text-primary">Resetuj filtere</Link>
                <Link href="/contact" className="bg-primary px-4 py-2 font-semibold text-white">Pitaj za preporuku</Link>
              </div>
            </div>
          )}
          {pages > 1 && (
            <nav className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-600" aria-label="Paginacija aranžmana">
              <Link
                href={createPageHref(uiParams, page - 1)}
                aria-disabled={!hasPrevious}
                className={`border px-4 py-2 font-semibold ${hasPrevious ? 'border-slate-300 text-primary' : 'pointer-events-none border-slate-200 text-slate-400'}`}
              >
                Prethodna
              </Link>
              <span>Strana {page} od {pages}</span>
              <Link
                href={createPageHref(uiParams, page + 1)}
                aria-disabled={!hasNext}
                className={`border px-4 py-2 font-semibold ${hasNext ? 'border-slate-300 text-primary' : 'pointer-events-none border-slate-200 text-slate-400'}`}
              >
                Sledeća
              </Link>
            </nav>
          )}
        </div>
      </div>
    </main>
  );
}
