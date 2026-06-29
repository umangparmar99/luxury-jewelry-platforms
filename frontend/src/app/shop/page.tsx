import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ShopPage() {
  return <Navigate to="/catalog" replace />;
}
