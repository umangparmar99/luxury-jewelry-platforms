'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HighJewelryRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/catalog?category=necklaces');
  }, [router]);

  return (
    <div className="w-full h-screen bg-luxury-slate-dark flex justify-center items-center">
      <div className="h-8 w-8 border-2 border-luxury-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
