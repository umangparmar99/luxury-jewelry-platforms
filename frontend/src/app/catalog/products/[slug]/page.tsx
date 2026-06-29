import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductDetailClient from '../../../../components/product/ProductDetailClient';

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [relatedFiltered, setRelatedFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      
      try {
        const res = await fetch(`${apiUrl}/catalog/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          const prod = data.data;
          setProduct(prod);

          if (prod?.category?.slug) {
            const relRes = await fetch(`${apiUrl}/catalog/products?category=${prod.category.slug}&limit=5`);
            if (relRes.ok) {
              const relData = await relRes.json();
              const relProducts = relData.data?.products || [];
              setRelatedFiltered(relProducts.filter((item: any) => item.id !== prod.id));
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full bg-[#060812] text-[#F0DFC8] min-h-[60vh] flex flex-col items-center justify-center p-6 text-center font-sans">
        <p className="text-xs uppercase tracking-widest animate-pulse">Consulting Studio Setting...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full bg-[#060812] text-[#F0DFC8] min-h-[60vh] flex flex-col items-center justify-center p-6 text-center font-sans">
        <h1 className="font-serif text-3xl font-bold text-white tracking-wide">Design Setting Not Found</h1>
        <p className="text-xs text-luxury-gold-200/50 mt-2 max-w-sm">
          The jewelry details or setting model is temporarily unavailable or has been archived.
        </p>
        <Link
          to="/catalog"
          className="mt-6 px-6 py-2.5 bg-gradient-rose-gold text-white text-xs uppercase tracking-widest font-bold rounded-sm transition-colors"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <ProductDetailClient 
      product={product} 
      relatedProducts={relatedFiltered} 
    />
  );
}
