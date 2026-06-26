import type { MetadataRoute } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvecarairig.rs').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/admin', '/checkout', '/checkout/success', '/*?q=', '/*?page='],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
