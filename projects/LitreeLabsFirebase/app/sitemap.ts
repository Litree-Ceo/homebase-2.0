import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://litlabs.app';
  const now = new Date().toISOString();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/dashboard`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/billing`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/auth`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${base}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/terms-of-service`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
