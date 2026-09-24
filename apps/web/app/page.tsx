/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import type { Metadata } from 'next';
import { ProductCard } from '@/components/ProductCard';
import { getCategories, getFeaturedProducts } from '@/lib/catalog';
import { store } from '@/lib/store';
import { absoluteUrl, buildFeaturedProductsJsonLd, buildHomeWebPageJsonLd, buildWebSiteJsonLd, featuredSearchImages, homePrimaryImageAbsolute, siteUrl } from '@/lib/seo';

const title = 'Online Cvećara Irig | Cveće, buketi i dostava';
const description = 'Cveće za svaki važan trenutak u Irigu i okolini. Online Cvećara Irig nudi sveže bukete, ruže, flower box aranžmane i lokalnu dostavu cveća.';
const socialDescription = 'Sveži buketi i cvetni aranžmani sa lokalnom dostavom u Irigu i okolini.';
const imageAlts = ['Rođendanska kutija Pastel Deluxe', 'Buket Sunce za rođendan', 'Premium ruže za rođendan', 'Šareni rođendanski miks'];

export const metadata: Metadata = {
  title, description, alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  openGraph: { type: 'website', url: `${siteUrl}/`, siteName: store.brand, locale: 'sr_RS', title, description: socialDescription, images: featuredSearchImages.map((image, index) => ({ url: absoluteUrl(image)!, width: 1254, height: 1254, alt: `${imageAlts[index]} — ${store.brand}` })) },
  twitter: { card: 'summary_large_image', title: store.brand, description: socialDescription, images: [homePrimaryImageAbsolute] },
};

const trust = ['Sveži buketi i aranžmani', 'Dostava u Irigu i okolini', 'Porudžbine za posebne prilike', 'Brza potvrda telefonom'];

export default function Home() {
  const products = getFeaturedProducts();
  const heroProducts = featuredSearchImages.map((image) => products.find((product) => product.image === image)).filter((product): product is NonNullable<typeof product> => Boolean(product));
  const categories = getCategories();
  const jsonLd = [buildWebSiteJsonLd(), buildHomeWebPageJsonLd(), buildFeaturedProductsJsonLd(heroProducts)];
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <section className="bg-primary text-white"><div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20"><div><p className="text-sm font-semibold uppercase tracking-wide text-gold">{store.brand}</p><h1 className="mt-4 text-4xl font-bold sm:text-6xl">Cveće za svaki važan trenutak u Irigu i okolini.</h1><p className="mt-5 max-w-xl text-lg leading-8 text-slate-200">Sveži buketi i cvetni aranžmani sa brzom potvrdom porudžbine i lokalnom dostavom.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/products" className="bg-white px-5 py-3 font-semibold text-primary">Pogledaj aranžmane</Link><Link href="/shipping" className="border border-white/40 px-5 py-3 font-semibold">Dostava</Link></div></div>
      <div className="grid grid-cols-2 gap-3" aria-label="Izdvojeni cvetni aranžmani">{heroProducts.map((product, index) => <article key={product.id} className="overflow-hidden rounded-2xl bg-white text-primary shadow-lg"><Link href={`/products/${product.slug}`} className="group block"><img src={product.image} width="1254" height="1254" alt={`${product.name} — cvetni aranžman sa dostavom u Irigu`} loading="eager" fetchPriority={index === 0 ? 'high' : 'auto'} decoding={index === 0 ? 'sync' : 'async'} className="aspect-square w-full object-cover transition group-hover:scale-[1.02]" /><h2 className="px-3 py-3 text-sm font-semibold sm:text-base">{product.name}</h2></Link></article>)}</div>
    </div></section>
    <section className="border-b bg-slate-50"><div className="mx-auto grid max-w-7xl gap-3 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">{trust.map((item) => <div key={item} className="rounded-2xl bg-white p-4 font-semibold text-primary shadow-sm ring-1 ring-slate-200">{item}</div>)}</div></section>
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="flex items-end justify-between"><div><p className="font-semibold uppercase text-accent">Izdvojeno</p><h2 className="mt-2 text-3xl font-bold text-primary">Izdvojeni aranžmani</h2></div><Link href="/products" className="font-semibold text-secondary">Svi aranžmani</Link></div><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>
    <section className="bg-slate-50"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><h2 className="text-3xl font-bold text-primary">Kategorije</h2><div className="mt-6 grid gap-4 sm:grid-cols-2">{categories.map((category) => <Link key={category.id} href={`/products?category=${category.slug}`} className="rounded-3xl bg-white p-6 font-semibold text-primary shadow-sm ring-1 ring-slate-200">{category.name}</Link>)}</div></div></section>
  </main>;
}
