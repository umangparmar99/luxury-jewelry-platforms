import { MetadataRoute } from 'next';

const BASE_URL = 'https://beyondcarat.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    '',
    '/customizer',
    '/diamonds',
    '/engagement',
    '/high-jewelry',
    '/appointments',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  try {
    const res = await fetch(`${API_URL}/catalog/products?limit=100`);
    if (res.ok) {
      const data = await res.json();
      const products = data.data.products || [];
      const productUrls = products.map((prod: any) => ({
        url: `${BASE_URL}/catalog/products/${prod.slug}`,
        lastModified: new Date(prod.updatedAt || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
      routes.push(...productUrls);
    }
  } catch (err) {
    console.error('[Sitemap Generation Error]', err);
  }

  return routes;
}
