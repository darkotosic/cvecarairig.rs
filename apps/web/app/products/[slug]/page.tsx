import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductGallery, getProductImages } from '@/components/ProductGallery';
import { ProductPurchaseBox } from '@/components/ProductPurchaseBox';
import { ApiError, getProduct } from '@/lib/api';
import { loadPublicStoreSettings } from '@/lib/store-settings';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://simeonshop.rs').replace(/\/$/, '');
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
      title: product.seo_title ?? product.name,
      description: product.seo_description ?? product.short_description ?? product.description ?? undefined,
      alternates: { canonical: `/products/${product.slug}` },
      openGraph: {
        title: product.name,
        description: product.short_description ?? product.description ?? undefined,
        url: `${siteUrl}/products/${product.slug}`,
        images: image ? [{ url: image, alt: primaryImage ? product.name : `${settings.company_name ?? 'Simeon Shop'} logo` }] : undefined,
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
  const productUrl = `${siteUrl}/products/${product.slug}`;
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
        <ProductPurchaseBox product={product} />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <article className="rounded-3xl bg-slate-50 p-5">
            <h2 className="font-bold text-primary">Dostava i plaćanje</h2>
            <p className="mt-2 text-sm text-slate-600">Plaćanje pouzećem. Potvrđujemo porudžbinu pre slanja.</p>
          </article>
          <article className="rounded-3xl bg-slate-50 p-5">
            <h2 className="font-bold text-primary">Povraćaj i zamena</h2>
            <p className="mt-2 text-sm text-slate-600">Zamena veličine i povraćaj su dostupni za nekorišćene proizvode u originalnom stanju.</p>
          </article>
          <article className="rounded-3xl bg-slate-50 p-5">
            <h2 className="font-bold text-primary">Vodič za veličine</h2>
            <p className="mt-2 text-sm text-slate-600">Ako ste između dve veličine, kontaktirajte nas pre poručivanja.</p>
          </article>
          <article className="rounded-3xl bg-slate-50 p-5">
            <h2 className="font-bold text-primary">Materijal</h2>
            <p className="mt-2 text-sm text-slate-600">{product.material ?? 'Detalji o materijalu dostupni su na zahtev.'}</p>
          </article>
          <article className="rounded-3xl bg-slate-50 p-5 sm:col-span-2">
            <h2 className="font-bold text-primary">Održavanje</h2>
            <p className="mt-2 text-sm text-slate-600">{product.care_instructions ?? 'Pratite oznaku na proizvodu i perite sa sličnim bojama.'}</p>
          </article>
        </div>
      </section>
    </main>
  );
}
