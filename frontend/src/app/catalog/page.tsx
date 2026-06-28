import React from 'react';
import CatalogClient from '../../components/product/CatalogClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Luxury Jewelry Catalog | BeyondCarat Bespoke Collection',
  description:
    'Browse our classic custom engagement rings, solitaire configurations, and loose diamond indexes. Sort by price, metal types, and certified gemstone cuts.',
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    metal?: string;
    stone?: string;
    search?: string;
    sort?: string;
    page?: string;
  }>;
}

async function fetchCatalogData(queryString: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${apiUrl}/catalog/products?${queryString}`, { cache: 'no-store' }),
      fetch(`${apiUrl}/catalog/categories`, { next: { revalidate: 3600 } }),
    ]);

    if (!productsRes.ok || !categoriesRes.ok) {
      throw new Error('Failed to load catalog options.');
    }

    const products = await productsRes.json();
    const categories = await categoriesRes.json();

    return {
      products: products.data?.products || [],
      pagination: products.data?.pagination || { page: 1, limit: 20, totalCount: 0, totalPages: 1 },
      categories: categories.data || [],
    };
  } catch (error) {
    console.error('[Catalog Server Fetch Error]', error);
    return {
      products: [],
      pagination: { page: 1, limit: 20, totalCount: 0, totalPages: 1 },
      categories: [],
    };
  }
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  // Build query string variables mapping keys correctly
  const query = new URLSearchParams();
  if (resolvedParams.category) query.append('category', resolvedParams.category);
  if (resolvedParams.minPrice) query.append('minPrice', resolvedParams.minPrice);
  if (resolvedParams.maxPrice) query.append('maxPrice', resolvedParams.maxPrice);
  if (resolvedParams.metal) query.append('metal', resolvedParams.metal);
  if (resolvedParams.stone) query.append('gemstone', resolvedParams.stone);
  if (resolvedParams.search) query.append('search', resolvedParams.search);
  if (resolvedParams.sort) query.append('sort', resolvedParams.sort);
  if (resolvedParams.page) query.append('page', resolvedParams.page);
  query.append('limit', '12'); // Return 12 items per catalog page standard

  const data = await fetchCatalogData(query.toString());

  return (
    <CatalogClient
      initialProducts={data.products}
      initialPagination={data.pagination}
      categories={data.categories}
      searchParams={resolvedParams}
    />
  );
}
