import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductGallery, getProductImages } from '@/components/ProductGallery';
import { ProductPurchaseBox } from '@/components/ProductPurchaseBox';
import { ApiError, getProduct } from '@/lib/api';
import { loadPublicStoreSettings } from '@/lib/store-settings';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvecarairig.rs').replace(/\/$/, '');
const fallbackLogoUrl = process.env.NEXT_PUBLIC_LOGO_URL;

function absoluteUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  return url.startsWith('http://') || url.startsWith('https://') ? url : `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const [product, settings] = await Promise.all([getProduct(slug), loadPublicStoreSettings()]);
    const primaryImage = absoluteUrl(getProductImages(product)[0]?.image_url);
    const fallbackImage = absoluteUrl(settings.logo_url) ?? absoluteUrl(fallbackLogoUrl);
    const image = primaryImage ?? fallbackImage;
    return {
      title: product.seo_title ?? `${product.name} | Online Cvećara Irig`,
      description: product.seo_description ?? product.short_description ?? product.description ?? `Poručite ${product.name} u Online Cvećari Irig. Buketi, ruže i cvetni aranžmani sa lokalnom dostavom u Irigu i okolini.`,
      alternates: { canonical: `/products/${encodeURIComponent(product.slug)}` },
      openGraph: {
        title: product.name,
        description: product.short_description ?? product.description ?? undefined,
        url: `${siteUrl}/products/${encodeURIComponent(product.slug)}`,
        images: image ? [{ url: image, alt: primaryImage ? product.name : `${settings.company_name ?? 'Online Cvećara Irig'} logo` }] : undefined,
      },
    };
  } catch {
    return { title: 'Proizvod' };
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let product;
  try {
    product = await getProduct(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const settings = await loadPublicStoreSettings();
  const images = getProductImages(product);
  const fallbackImage = absoluteUrl(settings.logo_url) ?? absoluteUrl(fallbackLogoUrl);
  const imageUrls = images.map((image) => absoluteUrl(image.image_url)).filter((url): url is string => Boolean(url));
  const jsonLdImages = imageUrls.length > 0 ? imageUrls : fallbackImage ? [fallbackImage] : [];
  const stock = product.effective_stock_quantity ?? product.stock_quantity;
  const productUrl = `${siteUrl}/products/${encodeURIComponent(product.slug)}`;
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    ...(product.seo_description || product.short_description || product.description
      ? { description: product.seo_description ?? product.short_description ?? product.description }
      : {}),
    image: jsonLdImages,
    sku: product.sku ?? product.variants?.find((variant) => variant.sku)?.sku ?? String(product.id),
    url: productUrl,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'RSD',
      price: (product.price_cents / 100).toFixed(2),
      availability: stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: productUrl,
    },
  };

  return (
    <main className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <ProductGallery product={product} />
      <section>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{product.category?.name}</p>
        <h1 className="mt-2 text-4xl font-bold text-primary">{product.name}</h1>
        <p className="mt-4 text-slate-700">{product.description ?? product.short_description}</p>
        <ProductPurchaseBox product={product} phone={settings.store_phone} />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <article className="rounded-3xl bg-slate-50 p-5">
            <h2 className="font-bold text-primary">Dostava i plaćanje</h2>
            <p className="mt-2 text-sm text-slate-600">Poručivanje ide telefonom. Tokom poziva potvrđujemo dostupnost, plaćanje i dostavu.</p>
          </article>
          <article className="rounded-3xl bg-slate-50 p-5">
            <h2 className="font-bold text-primary">Reklamacije</h2>
            <p className="mt-2 text-sm text-slate-600">Sveži aranžmani su kvarljiva roba; reklamacije rešavamo individualno odmah po prijemu.</p>
          </article>
          <article className="rounded-3xl bg-slate-50 p-5">
            <h2 className="font-bold text-primary">Nega cveća</h2>
            <p className="mt-2 text-sm text-slate-600">Preporučujemo svežu vodu, hladnije mesto bez direktnog sunca i uklanjanje uvelih listova.</p>
          </article>
          <article className="rounded-3xl bg-slate-50 p-5">
            <h2 className="font-bold text-primary">Sastav aranžmana</h2>
            <p className="mt-2 text-sm text-slate-600">{product.material ?? 'Detalji o sastavu aranžmana dostupni su na zahtev.'}</p>
          </article>
          <article className="rounded-3xl bg-slate-50 p-5 sm:col-span-2">
            <h2 className="font-bold text-primary">Instrukcije za negu</h2>
            <p className="mt-2 text-sm text-slate-600">{product.care_instructions ?? 'Držite cveće u svežoj vodi, na hladnijem mestu i van direktnog sunca.'}</p>
          </article>
        </div>
      </section>
    </main>
  );
}
