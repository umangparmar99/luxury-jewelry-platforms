import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CatalogClient from '../../components/product/CatalogClient';

export default function CatalogPage() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const resolvedParams: any = {};
  searchParams.forEach((value, key) => {
    resolvedParams[key] = value;
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const query = new URLSearchParams();
      if (resolvedParams.category) query.append('category', resolvedParams.category);
      if (resolvedParams.minPrice) query.append('minPrice', resolvedParams.minPrice);
      if (resolvedParams.maxPrice) query.append('maxPrice', resolvedParams.maxPrice);
      if (resolvedParams.metal) query.append('metal', resolvedParams.metal);
      if (resolvedParams.stone) query.append('gemstone', resolvedParams.stone);
      if (resolvedParams.search) query.append('search', resolvedParams.search);
      if (resolvedParams.sort) query.append('sort', resolvedParams.sort);
      if (resolvedParams.page) query.append('page', resolvedParams.page);
      query.append('limit', '12');

      const apiUrl = import.meta.env.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`${apiUrl}/catalog/products?${query.toString()}`),
          fetch(`${apiUrl}/catalog/categories`),
        ]);

        if (productsRes.ok && categoriesRes.ok) {
          const products = await productsRes.json();
          const categories = await categoriesRes.json();
          setData({
            products: products.data?.products || [],
            pagination: products.data?.pagination || { page: 1, limit: 12, totalCount: 0, totalPages: 1 },
            categories: categories.data || [],
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [searchParams]);

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0b2626' }}>
        <p className="text-[#fef8f1] font-sans text-xs uppercase tracking-widest animate-pulse">Unlocking Catalog Vault...</p>
      </div>
    );
  }

  return (
    <CatalogClient
      initialProducts={data?.products || []}
      initialPagination={data?.pagination || { page: 1, limit: 12, totalCount: 0, totalPages: 1 }}
      categories={data?.categories || []}
      searchParams={resolvedParams}
    />
  );
}
