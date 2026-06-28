import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/cart', '/checkout/'],
    },
    sitemap: 'https://beyondcarat.com/sitemap.xml',
  };
}
