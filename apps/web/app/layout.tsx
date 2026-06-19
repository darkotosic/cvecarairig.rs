import type { Metadata } from 'next';
import Link from 'next/link';
import { StickyCallButton } from '@/components/StickyCallButton';
import { loadPublicStoreSettings } from '@/lib/store-settings';
import type { PublicStoreSettings } from '@/lib/api';
import '../styles/globals.css';

const fallbackBrandName = process.env.NEXT_PUBLIC_BRAND_NAME ?? 'Cvećara Irig';
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvecarairig.rs').replace(/\/$/, '');
const fallbackLogoUrl = process.env.NEXT_PUBLIC_LOGO_URL;

function absoluteUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  return url.startsWith('http://') || url.startsWith('https://') ? url : `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

function buildOrganizationJsonLd(settings: PublicStoreSettings, brandName: string) {
  const sameAs = [settings.instagram_url, settings.facebook_url].filter((url): url is string => Boolean(url));
  const contactPoint = settings.store_email || settings.store_phone
    ? [{
      '@type': 'ContactPoint',
      contactType: 'customer support',
      ...(settings.store_email ? { email: settings.store_email } : {}),
      ...(settings.store_phone ? { telephone: settings.store_phone } : {}),
      availableLanguage: ['sr'],
    }]
    : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Florist',
    name: brandName,
    url: siteUrl,
    ...(absoluteUrl(settings.logo_url) ? { logo: absoluteUrl(settings.logo_url) } : {}),
    ...(settings.company_address ? { address: settings.company_address } : {}),
    ...(settings.store_phone ? { telephone: settings.store_phone } : {}),
    ...(settings.store_email ? { email: settings.store_email } : {}),
    ...(settings.service_area ? { areaServed: settings.service_area } : {}),
    ...(settings.business_hours ? { openingHours: settings.business_hours } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(contactPoint ? { contactPoint } : {}),
  };
}

function buildWebsiteJsonLd(brandName: string) {
  return { '@context': 'https://schema.org', '@type': 'WebSite', name: brandName, url: siteUrl };
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadPublicStoreSettings();
  const brandName = settings.company_name ?? fallbackBrandName;
  const logoUrl = absoluteUrl(settings.logo_url) ?? absoluteUrl(fallbackLogoUrl);

  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${brandName} | Cveće, buketi i dostava`, template: `%s | ${brandName}` },
    description: 'Cvećara Irig - sveži buketi, ruže, flower box aranžmani i dostava cveća u Irigu i okolini.',
    openGraph: {
      type: 'website',
      url: siteUrl,
      siteName: brandName,
      title: `${brandName} | Cveće, buketi i dostava`,
      description: 'Buketi, ruže i cvetni aranžmani za rođendane, godišnjice, slave, svadbe i posebne trenutke.',
      images: logoUrl ? [{ url: logoUrl, alt: `${brandName} logo` }] : undefined,
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await loadPublicStoreSettings();
  const brandName = settings.company_name ?? fallbackBrandName;
  const contactEmail = settings.store_email;
  const jsonLd = [buildOrganizationJsonLd(settings, brandName), buildWebsiteJsonLd(brandName)];

  return (
    <html lang="sr">
      <body className="min-h-screen font-sans antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
          <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-xl font-bold tracking-wide text-primary">{brandName}</Link>
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-700">
              <Link href="/products" className="hover:text-primary">Aranžmani</Link>
              <Link href="/shipping" className="hover:text-primary">Dostava</Link>
              <Link href="/returns" className="hover:text-primary">Reklamacije</Link>
              <Link href="/flower-care" className="hover:text-primary">Nega cveća</Link>
              {settings.store_phone ? <a href={`tel:${settings.store_phone.replace(/[^\d+]/g, '')}`} className="font-semibold text-primary hover:text-primary/80">Pozovite</a> : <Link href="/contact" className="font-semibold text-primary hover:text-primary/80">Pozovite</Link>}
            </div>
          </nav>
        </header>
        {children}
        <StickyCallButton phone={settings.store_phone} />
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm text-slate-600 sm:px-6 md:grid-cols-4 lg:px-8">
            <div>
              <p className="font-semibold text-primary">{brandName}</p>
              <p className="mt-2">Cvećara u Irigu sa fokusom na sveže cveće, pažljivo aranžiranje i jasnu komunikaciju oko porudžbine i dostave.</p>
              {settings.company_address && <p className="mt-2">{settings.company_address}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/about">O nama</Link>
              <Link href="/contact">Kontakt</Link>
              <Link href="/products">Aranžmani</Link>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/shipping">Dostava</Link>
              <Link href="/returns">Reklamacije</Link>
              <Link href="/flower-care">Nega cveća</Link>
              <Link href="/terms-and-conditions">Uslovi kupovine</Link>
              <Link href="/privacy-policy">Politika privatnosti</Link>
            </div>
            <div className="flex flex-col gap-2">
              {settings.instagram_url && <a href={settings.instagram_url} rel="noreferrer" target="_blank">Instagram</a>}
              {settings.facebook_url && <a href={settings.facebook_url} rel="noreferrer" target="_blank">Facebook</a>}
              {contactEmail && <span>{contactEmail}</span>}
              {settings.store_phone && <span>{settings.store_phone}</span>}
              {!contactEmail && !settings.store_phone && <span>Kontakt podaci još nisu podešeni.</span>}
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
