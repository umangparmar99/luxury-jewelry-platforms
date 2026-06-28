import React from 'react';
import { Metadata } from 'next';
import ProductDetailClient from '../../../../components/product/ProductDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function fetchProductDetails(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  try {
    const res = await fetch(`${apiUrl}/catalog/products/${slug}`, { cache: 'no-store' });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('[Product Detail Fetch Error]', error);
    return null;
  }
}

async function fetchRelatedProducts(categorySlug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  try {
    const res = await fetch(`${apiUrl}/catalog/products?category=${categorySlug}&limit=5`, { 
      next: { revalidate: 1800 } 
    });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    return data.data?.products || [];
  } catch (error) {
    console.error('[Related Products Fetch Error]', error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductDetails(slug);
  
  if (!product) {
    return {
      title: 'Product Not Found | BeyondCarat Bespoke',
      description: 'The requested bespoke setting could not be found.',
    };
  }

  return {
    title: `${product.name} | BeyondCarat Bespoke Solitaires`,
    description: `${product.description} Explore configurations, GIA certified diamond matches, and pricing options.`,
    alternates: {
      canonical: `https://beyondcarat.com/catalog/products/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | BeyondCarat Bespoke Solitaires`,
      description: product.description,
      url: `https://beyondcarat.com/catalog/products/${product.slug}`,
      type: 'website',
      images: [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/v12345/luxury_og.jpg',
          width: 1200,
          height: 630,
          alt: product.name,
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | BeyondCarat Bespoke Solitaires`,
      description: product.description,
      images: ['https://res.cloudinary.com/demo/image/upload/v12345/luxury_og.jpg'],
    }
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await fetchProductDetails(slug);

  if (!product) {
    return (
      <div className="w-full bg-luxury-slate-dark text-luxury-gold-50 min-h-[60vh] flex flex-col items-center justify-center p-6 text-center font-sans">
        <h1 className="font-serif text-3xl font-bold text-white tracking-wide">Design Setting Not Found</h1>
        <p className="text-xs text-luxury-gold-200/50 mt-2 max-w-sm">
          The jewelry details or setting model is temporarily unavailable or has been archived.
        </p>
        <a
          href="/catalog"
          className="mt-6 px-6 py-2.5 bg-luxury-gold-500 text-luxury-slate-dark text-xs uppercase tracking-widest font-bold rounded-sm transition-colors hover:bg-luxury-gold-600"
        >
          Return to Catalog
        </a>
      </div>
    );
  }

  // Fetch related products in the same category
  const categorySlug = product.category?.slug || '';
  const relatedList = await fetchRelatedProducts(categorySlug);
  
  // Filter out current product
  const relatedFiltered = relatedList.filter((item: any) => item.id !== product.id);

  // Generate JSON-LD Schema
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'image': 'https://res.cloudinary.com/demo/image/upload/v12345/luxury_og.jpg',
    'description': product.description,
    'sku': product.sku,
    'offers': {
      '@type': 'Offer',
      'url': `https://beyondcarat.com/catalog/products/${product.slug}`,
      'priceCurrency': 'USD',
      'price': product.basePrice,
      'availability': 'https://schema.org/InStock',
      'priceValidUntil': '2030-12-31'
    }
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://beyondcarat.com'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': product.category?.name || 'Catalog',
        'item': `https://beyondcarat.com/catalog?category=${product.category?.slug}`
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': product.name,
        'item': `https://beyondcarat.com/catalog/products/${product.slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetailClient 
        product={product} 
        relatedProducts={relatedFiltered} 
      />
    </>
  );
}
