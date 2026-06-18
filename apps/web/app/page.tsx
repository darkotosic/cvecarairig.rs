import Link from 'next/link';
import type { Metadata } from 'next';
import { ProductCard } from '@/components/ProductCard';
import { getCategories, getProducts, getPublicStoreSettings, type Category, type Product } from '@/lib/api';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://simeonshop.rs').replace(/\/$/, '');

export async function generateMetadata(): Promise<Metadata> {
  let logoUrl: string | undefined;
  try {
    const settings = await getPublicStoreSettings();
    logoUrl = settings.logo_url ?? undefined;
  } catch {}

  return {
    openGraph: {
      title: 'Simeon Shop',
      description: 'Garderoba za svaki dan, poručena bez komplikacija.',
      url: siteUrl,
      images: logoUrl ? [{ url: logoUrl }] : undefined,
    },
  };
}

async function getFeatured(): Promise<{ products: Product[]; categories: Category[]; available: boolean }> {
  try {
    const [products, categories] = await Promise.all([getProducts({ sort: 'sort_order', page_size: 4 }), getCategories()]);
    return { products: products.items, categories, available: true };
  } catch {
    return { products: [], categories: [], available: false };
  }
}

const trustBadges = ['Plaćanje pouzećem', 'Zamena veličine', 'Brza potvrda porudžbine', 'Podrška preko Instagrama/Facebooka'];

export default async function HomePage() {
  const { products, categories, available } = await getFeatured();

  return (
    <main>
      <section className="bg-primary text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gold">simeonshop.rs</p>
            <h1 className="mt-4 text-4xl font-bold sm:text-6xl">Garderoba za svaki dan, poručena bez komplikacija.</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-200">Simeon Shop donosi pažljivo odabrane komade, jasan proces poručivanja i plaćanje pouzećem za sigurnu kupovinu u Srbiji.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="bg-white px-5 py-3 text-sm font-semibold text-primary">Pogledaj kolekciju</Link>
              <Link href="/shipping" className="border border-white/40 px-5 py-3 text-sm font-semibold text-white">Dostava i plaćanje</Link>
            </div>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/10 p-6">
            <p className="text-sm text-slate-200">Sigurna online porudžbina</p>
            <p className="mt-2 text-3xl font-bold">Pouzećem, brzo i transparentno.</p>
            <div className="mt-8 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              {trustBadges.map((item) => <div key={item} className="rounded-2xl border border-white/15 bg-white/10 p-4 font-semibold">{item}</div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">Izdvojeno</p>
            <h2 className="mt-2 text-3xl font-bold text-primary">Featured proizvodi</h2>
          </div>
          <Link href="/products" className="text-sm font-semibold text-secondary">Svi proizvodi</Link>
        </div>
        {products.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-slate-600">
            <p>{available ? 'Trenutno nema izdvojenih proizvoda.' : 'Katalog se trenutno osvežava. Ne prikazujemo rezervne proizvode dok API nije dostupan.'}</p>
            <Link href="/products" className="mt-4 inline-block bg-primary px-5 py-3 text-sm font-semibold text-white">Pogledaj katalog</Link>
          </div>
        )}
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary">Kategorije</h2>
          {categories.length ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => <Link key={category.slug} href={`/products?category=${category.slug}`} className="rounded-3xl bg-white p-6 font-semibold text-primary shadow-sm ring-1 ring-slate-200">{category.name}</Link>)}
            </div>
          ) : <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">Kategorije će biti prikazane kada ih API vrati.</div>}
        </div>
      </section>
    </main>
  );
}
