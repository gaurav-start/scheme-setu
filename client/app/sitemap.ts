import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://client-gamma-beryl-99.vercel.app';

  const routes = ['', '/schemes', '/eligibility', '/login', '/csc'];
  const locales = [
    'en', 'hi', 'as', 'bn', 'brx', 'doi', 'gu', 'kn', 'ks', 'kok',
    'mai', 'ml', 'mni', 'mr', 'ne', 'or', 'pa', 'sa', 'sat', 'sd',
    'ta', 'te', 'ur'
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of routes) {
      const path = `/${locale}${route}`;
      const languageAlternates: Record<string, string> = {};
      for (const loc of locales) {
        languageAlternates[loc] = `${baseUrl}/${loc}${route}`;
      }

      sitemapEntries.push({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : route === '/schemes' || route === '/eligibility' ? 0.9 : 0.7,
        alternates: {
          languages: languageAlternates,
        },
      });
    }
  }

  return sitemapEntries;
}
