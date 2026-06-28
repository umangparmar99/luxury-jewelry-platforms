import React from 'react';
import { Metadata } from 'next';
import CartClient from '../../components/cart/CartClient';

export const metadata: Metadata = {
  title: 'Bespoke Shopping Bag | BeyondCarat Luxury Customizer',
  description:
    'Review your custom engagement ring configurations, solitaires, and loose certified diamonds in your Bespoke Bag. Manage quantities and secure appraisals transit.',
};

export default function CartPage() {
  return <CartClient />;
}
