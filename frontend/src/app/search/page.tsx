import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const query = searchParams.get('q') || searchParams.get('search') || '';
    if (query) {
      navigate(`/catalog?search=${encodeURIComponent(query)}`, { replace: true });
    } else {
      navigate('/catalog', { replace: true });
    }
  }, [searchParams, navigate]);

  return null;
}
