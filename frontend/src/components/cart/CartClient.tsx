'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Trash2, Heart, Plus, Minus, Tag, ShieldCheck, 
  Truck, HelpCircle, ArrowRight, Loader2, RefreshCw, Bookmark 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CartItem {
  id: string; // backend cartItemId OR mock client id
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  selectedMetal: string | null;
  selectedSize: number | null;
  customEngraving: string | null;
  unitPrice: number;
  totalPrice: number;
  image?: string;
  slug?: string;
}

const metalLabels: Record<string, string> = {
  YELLOW_GOLD_18K: '18k Yellow Gold',
  WHITE_GOLD_18K: '18k White Gold',
  ROSE_GOLD_18K: '18k Rose Gold',
  PLATINUM: 'Platinum',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function CartClient() {
  const { user } = useAuth();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; type: string; value: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Load cart data from backend OR localStorage
  const loadCart = async () => {
    setIsLoading(true);
    try {
      if (user) {
        // Authenticated backend fetch
        const res = await fetch(`${API_URL}/checkout/cart`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          // Map backend items structure to CartItem component interface
          const items: CartItem[] = data.data.items.map((item: any) => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            productSku: item.productSku,
            quantity: item.quantity,
            selectedMetal: item.selectedMetal,
            selectedSize: item.selectedSize,
            customEngraving: item.customEngraving,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            image: item.gemstone 
              ? 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop'
              : 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop',
            slug: item.productSlug || 'classic-solitaire-setting',
          }));
          setCartItems(items);
        }
      } else {
        // Unauthenticated local storage load
        const localCart = JSON.parse(localStorage.getItem('luxury_cart') || '[]');
        setCartItems(localCart.map((item: any, index: number) => ({
          id: item.id || `local_${index}`,
          productId: item.productId,
          productName: item.name,
          productSku: item.sku,
          quantity: item.quantity || 1,
          selectedMetal: item.metal || null,
          selectedSize: item.size || null,
          customEngraving: item.engraving || null,
          unitPrice: item.price,
          totalPrice: item.price * (item.quantity || 1),
          image: item.image,
          slug: item.slug,
        })));
      }

      // Load Save for Later items from localStorage
      const localSaved = JSON.parse(localStorage.getItem('luxury_saved_for_later') || '[]');
      setSavedItems(localSaved);
    } catch {
      showToast('Error retrieving shopping cart items.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  // Handle quantity modification
  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      if (user) {
        // Update backend
        const res = await fetch(`${API_URL}/checkout/cart/items/${itemId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: newQty }),
          credentials: 'include',
        });
        if (!res.ok) throw new Error('API failure');
      } else {
        // Update localStorage
        const updated = cartItems.map((item) => {
          if (item.id === itemId) {
            return { ...item, quantity: newQty, totalPrice: item.unitPrice * newQty };
          }
          return item;
        });
        const mappedLocal = updated.map(item => ({
          productId: item.productId,
          name: item.productName,
          sku: item.productSku,
          metal: item.selectedMetal,
          size: item.selectedSize,
          engraving: item.customEngraving,
          price: item.unitPrice,
          quantity: item.quantity,
          image: item.image,
          slug: item.slug,
        }));
        localStorage.setItem('luxury_cart', JSON.stringify(mappedLocal));
      }
      
      // Reload cart values
      await loadCart();
      window.dispatchEvent(new Event('cartUpdate'));
    } catch {
      showToast('Failed to update quantity.');
    }
  };

  // Remove Item
  const handleRemoveItem = async (itemId: string) => {
    try {
      if (user) {
        const res = await fetch(`${API_URL}/checkout/cart/items/${itemId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!res.ok) throw new Error('API failure');
      } else {
        const filtered = cartItems.filter((item) => item.id !== itemId);
        const mappedLocal = filtered.map(item => ({
          productId: item.productId,
          name: item.productName,
          sku: item.productSku,
          metal: item.selectedMetal,
          size: item.selectedSize,
          engraving: item.customEngraving,
          price: item.unitPrice,
          quantity: item.quantity,
          image: item.image,
          slug: item.slug,
        }));
        localStorage.setItem('luxury_cart', JSON.stringify(mappedLocal));
      }
      
      await loadCart();
      window.dispatchEvent(new Event('cartUpdate'));
      showToast('Item removed from Bespoke Bag.');
    } catch {
      showToast('Failed to remove item.');
    }
  };

  // Save for Later
  const handleSaveForLater = async (item: CartItem) => {
    try {
      // 1. Remove from active cart
      if (user) {
        await fetch(`${API_URL}/checkout/cart/items/${item.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
      } else {
        const filtered = cartItems.filter((i) => i.id !== item.id);
        const mappedLocal = filtered.map(i => ({
          productId: i.productId,
          name: i.productName,
          sku: i.productSku,
          metal: i.selectedMetal,
          size: i.selectedSize,
          engraving: i.customEngraving,
          price: i.unitPrice,
          quantity: i.quantity,
          image: i.image,
          slug: i.slug,
        }));
        localStorage.setItem('luxury_cart', JSON.stringify(mappedLocal));
      }

      // 2. Append to savedItems local storage
      const localSaved = JSON.parse(localStorage.getItem('luxury_saved_for_later') || '[]');
      const alreadySaved = localSaved.find((i: any) => i.productId === item.productId);
      if (!alreadySaved) {
        localSaved.push(item);
        localStorage.setItem('luxury_saved_for_later', JSON.stringify(localSaved));
      }

      await loadCart();
      window.dispatchEvent(new Event('cartUpdate'));
      showToast('Item saved for later.');
    } catch {
      showToast('Error saving item for later.');
    }
  };

  // Move Saved Item back to Cart
  const handleMoveToCart = async (item: CartItem) => {
    try {
      // 1. Remove from saved list
      const localSaved = savedItems.filter((i) => i.id !== item.id);
      localStorage.setItem('luxury_saved_for_later', JSON.stringify(localSaved));

      // 2. Add to active cart
      if (user) {
        const res = await fetch(`${API_URL}/checkout/cart/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.productId,
            quantity: item.quantity,
            selectedMetal: item.selectedMetal,
            selectedSize: item.selectedSize,
            customEngraving: item.customEngraving,
          }),
          credentials: 'include',
        });
        if (!res.ok) throw new Error('API failure');
      } else {
        const localCart = JSON.parse(localStorage.getItem('luxury_cart') || '[]');
        localCart.push({
          productId: item.productId,
          name: item.productName,
          sku: item.productSku,
          metal: item.selectedMetal,
          size: item.selectedSize,
          engraving: item.customEngraving,
          price: item.unitPrice,
          quantity: item.quantity,
          image: item.image,
          slug: item.slug,
        });
        localStorage.setItem('luxury_cart', JSON.stringify(localCart));
      }

      await loadCart();
      window.dispatchEvent(new Event('cartUpdate'));
      showToast('Item moved back to Bespoke Bag.');
    } catch {
      showToast('Error moving item to bag.');
    }
  };

  // Remove Saved Item
  const handleRemoveSavedItem = (itemId: string) => {
    const filtered = savedItems.filter((i) => i.id !== itemId);
    localStorage.setItem('luxury_saved_for_later', JSON.stringify(filtered));
    setSavedItems(filtered);
    showToast('Saved design setting removed.');
  };

  // Calculate pricing values
  const getSubtotal = () => cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  
  const getDiscount = () => {
    if (!activeCoupon) return 0;
    const sub = getSubtotal();
    if (activeCoupon.type === 'PERCENTAGE') {
      return (sub * activeCoupon.value) / 100;
    }
    return activeCoupon.value;
  };

  const getShipping = () => {
    const sub = getSubtotal();
    if (sub === 0) return 0;
    return sub >= 1000 ? 0 : 150; // Free above $1000, else $150 luxury carrier priority
  };

  const getTax = () => {
    const taxableAmount = getSubtotal() - getDiscount();
    return taxableAmount * 0.0825; // 8.25% luxury sales tax
  };

  const getGrandTotal = () => {
    return getSubtotal() - getDiscount() + getShipping() + getTax();
  };

  // Validate Promo Coupon Code
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    setIsValidatingCoupon(true);

    try {
      const subtotal = getSubtotal();
      const res = await fetch(`${API_URL}/checkout/coupons/validate?code=${encodeURIComponent(couponCode)}&amount=${subtotal}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Invalid coupon code.');
      }

      setActiveCoupon({
        code: data.data.code,
        type: data.data.discountType,
        value: Number(data.data.discountValue),
      });
      setCouponSuccess(`Coupon '${data.data.code}' applied successfully!`);
    } catch (err: any) {
      setCouponError(err.message || 'Failed to validate promo code.');
      setActiveCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center font-sans" style={{ backgroundColor: '#060812' }}>
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: '#D4706A' }} />
        <span className="text-xs uppercase tracking-widest mt-4" style={{ color: 'rgba(219,191,136,0.4)' }}>Retrieving Bespoke Bag…</span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pt-12 pb-28 font-sans relative" style={{ backgroundColor: '#060812', color: '#F0DFC8' }}>
      
      {/* Toast popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-6 z-50 p-4 rounded-sm flex items-center gap-3"
            style={{ background: 'rgba(10,14,30,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(212,112,106,0.3)', boxShadow: '0 16px 48px rgba(0,0,0,0.7)' }}
          >
            <Bookmark className="h-4 w-4 shrink-0" style={{ color: '#D4706A' }} />
            <div className="text-xs">
              <p className="font-semibold" style={{ color: '#F0DFC8' }}>Bespoke Bag Update</p>
              <p className="mt-0.5" style={{ color: 'rgba(219,191,136,0.55)' }}>{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="pb-8 mb-12" style={{ borderBottom: '1px solid rgba(212,112,106,0.08)' }}>
          <span className="font-sans text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#D4706A' }}>Fine Jewelry</span>
          <h1 className="font-serif text-3xl md:text-4xl font-light mt-2" style={{ color: '#F5E6D0' }}>Bespoke Bag</h1>
          <p className="font-sans text-[11px] mt-1.5 uppercase tracking-widest" style={{ color: 'rgba(219,191,136,0.4)' }}>
            Manage your bespoke configurations and secure appraisals
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* Empty bag view */
          <div className="w-full text-center py-24 rounded-sm" style={{ border: '1px dashed rgba(212,112,106,0.15)' }}>
            <ShoppingBag className="h-12 w-12 mx-auto mb-5 opacity-25" style={{ color: '#D4706A' }} />
            <p className="font-serif text-xl font-light mb-2" style={{ color: 'rgba(219,191,136,0.5)' }}>Your Bespoke Bag is empty.</p>
            <p className="font-sans text-xs mb-7 max-w-sm mx-auto leading-relaxed" style={{ color: 'rgba(219,191,136,0.3)' }}>
              Explore our certified diamonds index or configure your own solitaire ring.
            </p>
            <Link href="/catalog" className="btn-rose inline-flex items-center gap-2">
              <span className="relative z-10">Configure Jewelry</span>
            </Link>
          </div>
        ) : (
          /* Grid structure: Items left, Summary right */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* CART ITEMS COLUMN */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <AnimatePresence initial={false}>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex flex-col sm:flex-row gap-6 p-6 rounded-sm relative group transition-all duration-300"
                    style={{ background: 'rgba(13,18,40,0.45)', border: '1px solid rgba(212,112,106,0.08)' }}
                  >
                    {/* Item Image */}
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-sm" style={{ background: 'rgba(13,18,40,0.7)', border: '1px solid rgba(212,112,106,0.1)' }}>
                      <Image 
                        src={item.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop'} 
                        alt={item.productName} 
                        fill 
                        className="object-cover" 
                      />
                    </div>

                    {/* Metadata & Configurations */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="flex flex-col gap-1 pr-6">
                        <h3 className="font-serif text-sm font-light transition-colors duration-200" style={{ color: '#F0DFC8' }}>
                          <Link href={`/catalog/products/${item.slug}`}>{item.productName}</Link>
                        </h3>
                        <span className="text-[10px] uppercase tracking-wider font-mono" style={{ color: 'rgba(219,191,136,0.3)' }}>
                          SKU: {item.productSku}
                        </span>

                        {/* Custom configurations */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-[10px] font-sans" style={{ color: 'rgba(219,191,136,0.45)' }}>
                          {item.selectedMetal && (
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#D4706A' }} />
                              Metal: <strong style={{ color: '#F0DFC8' }}>{metalLabels[item.selectedMetal]}</strong>
                            </span>
                          )}
                          {item.selectedSize && (
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#D4706A' }} />
                              US Size: <strong style={{ color: '#F0DFC8' }}>{item.selectedSize}</strong>
                            </span>
                          )}
                          {item.customEngraving && (
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#D4706A' }} />
                              Engraving: <strong style={{ color: '#F0DFC8' }}>"{item.customEngraving}"</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Selector & Secondary Actions */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center rounded-sm" style={{ border: '1px solid rgba(212,112,106,0.15)', background: 'rgba(6,8,18,0.6)' }}>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="px-2.5 py-1.5 transition-colors duration-200"
                            style={{ color: 'rgba(212,112,106,0.6)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#F0DFC8')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(212,112,106,0.6)')}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold" style={{ color: '#F0DFC8' }}>{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="px-2.5 py-1.5 transition-colors duration-200"
                            style={{ color: 'rgba(212,112,106,0.6)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#F0DFC8')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(212,112,106,0.6)')}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Secondary controls */}
                        <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold">
                          <button
                            onClick={() => handleSaveForLater(item)}
                            className="flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-widest font-bold transition-colors duration-200"
                            style={{ color: 'rgba(212,112,106,0.65)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#E68C72')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(212,112,106,0.65)')}
                          >
                            <Heart className="h-3.5 w-3.5" /> Save
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-widest font-bold transition-colors duration-200"
                            style={{ color: 'rgba(180,60,60,0.7)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#FF8A8A')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(180,60,60,0.7)')}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Pricing metadata */}
                    <div className="sm:text-right shrink-0 flex sm:flex-col justify-between sm:justify-start items-baseline sm:items-end gap-2 pt-4 sm:pt-0" style={{ borderTop: 'none' }}>
                      <span className="font-serif text-base font-semibold" style={{ color: '#DBBF88' }}>
                        ${item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      {item.quantity > 1 && (
                        <span className="font-sans text-[10px]" style={{ color: 'rgba(219,191,136,0.35)' }}>
                          (${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} ea)
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* CART SUMMARY COLUMN */}
            <div className="flex flex-col gap-6">
              
              {/* Calculations panel card */}
              <div className="p-6 rounded-sm" style={{ background: 'rgba(13,18,40,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(212,112,106,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                <h2 className="font-serif text-lg font-light pb-4 mb-6" style={{ color: '#F5E6D0', borderBottom: '1px solid rgba(212,112,106,0.08)' }}>
                  Order Summary
                </h2>

                <div className="flex flex-col gap-4 text-xs font-sans">
                  
                  {/* Subtotal */}
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(219,191,136,0.45)' }}>Subtotal</span>
                    <span className="font-medium" style={{ color: '#F0DFC8' }}>
                      ${getSubtotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Coupon Discount */}
                  {activeCoupon && (
                    <div className="flex justify-between font-semibold" style={{ color: '#D4706A' }}>
                      <span>Promo ({activeCoupon.code})</span>
                      <span>-${getDiscount().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  {/* Shipping */}
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1" style={{ color: 'rgba(219,191,136,0.45)' }}>
                      Priority Insured Carrier
                      <HelpCircle className="h-3.5 w-3.5" style={{ color: 'rgba(219,191,136,0.25)' }} />
                    </span>
                    <span className="font-medium" style={{ color: '#F0DFC8' }}>
                      {getShipping() === 0 ? 'Complimentary' : `$${getShipping().toFixed(2)}`}
                    </span>
                  </div>

                  {/* Taxes */}
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(219,191,136,0.45)' }}>Luxury Sales Tax (8.25%)</span>
                    <span className="font-medium" style={{ color: '#F0DFC8' }}>
                      ${getTax().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="my-2" style={{ height: '1px', background: 'rgba(212,112,106,0.08)' }} />

                  <div className="flex justify-between text-sm font-semibold">
                    <span className="uppercase tracking-wider" style={{ color: '#F5E6D0' }}>Estimated Total</span>
                    <span className="font-serif text-xl" style={{ color: '#DBBF88' }}>
                      ${getGrandTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Coupon promo form */}
                <form onSubmit={handleApplyCoupon} className="mt-7 pt-6 flex gap-2" style={{ borderTop: '1px solid rgba(212,112,106,0.08)' }}>
                  <div className="relative flex-grow">
                    <Tag className="absolute left-3 top-2.5 h-3.5 w-3.5" style={{ color: 'rgba(212,112,106,0.35)' }} />
                    <input
                      type="text"
                      placeholder="WELCOME10"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full py-2.5 pl-9 pr-2 rounded-sm text-xs outline-none uppercase tracking-widest font-mono transition-all duration-200"
                      style={{ background: 'rgba(6,8,18,0.7)', border: '1px solid rgba(212,112,106,0.12)', color: '#F0DFC8' }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,112,106,0.4)')}
                      onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(212,112,106,0.12)')}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isValidatingCoupon || !couponCode}
                    className="px-4 py-2 rounded-sm font-sans text-[10px] uppercase tracking-widest font-bold transition-all duration-200 disabled:opacity-20 shrink-0"
                    style={{ background: 'rgba(212,112,106,0.08)', border: '1px solid rgba(212,112,106,0.2)', color: '#D4706A' }}
                  >
                    {isValidatingCoupon ? 'Checking…' : 'Apply'}
                  </button>
                </form>

                {couponError   && <p className="font-sans text-[10px] mt-2" style={{ color: '#FF8A8A' }}>{couponError}</p>}
                {couponSuccess && <p className="font-sans text-[10px] mt-2" style={{ color: '#D4706A' }}>{couponSuccess}</p>}

                {/* Proceed link button */}
                <Link href="/checkout" className="btn-rose w-full mt-7 flex items-center justify-center gap-2">
                  <span className="relative z-10">Proceed to Secure Checkout</span>
                  <ArrowRight className="h-4 w-4 relative z-10" />
                </Link>
              </div>

              {/* Secure Trust Assurances */}
              <div className="flex flex-col gap-3 p-4 rounded-sm font-sans text-[11px] leading-relaxed" style={{ background: 'rgba(212,112,106,0.04)', border: '1px solid rgba(212,112,106,0.07)', color: 'rgba(219,191,136,0.45)' }}>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#D4706A' }} />
                  <p>Certified secure checkout. Insured Brink's transit with priority signature release on arrival.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Truck className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#D4706A' }} />
                  <p>Complimentary resizing and GIA/IGI certification documents boxed with all orders.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* SAVE FOR LATER LIST SECTION */}
        {savedItems.length > 0 && (
          <section className="pt-20 mt-24" style={{ borderTop: '1px solid rgba(212,112,106,0.07)' }}>
            <div className="mb-10">
              <h2 className="font-serif text-2xl font-light flex items-center gap-2" style={{ color: '#F5E6D0' }}>
                <Bookmark className="h-5 w-5" style={{ color: '#D4706A' }} /> Saved Design Settings
              </h2>
              <p className="font-sans text-[11px] mt-1.5 uppercase tracking-widest" style={{ color: 'rgba(219,191,136,0.4)' }}>
                Review and move items back to your Bespoke Bag to checkout
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {savedItems.map((item) => (
                <div key={item.id} className="group relative flex flex-col p-5 rounded-sm" style={{ background: 'rgba(13,18,40,0.4)', border: '1px solid rgba(212,112,106,0.08)' }}>
                  <div className="relative h-48 w-full overflow-hidden rounded-sm" style={{ border: '1px solid rgba(212,112,106,0.1)' }}>
                    <Image
                      src={item.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop'}
                      alt={item.productName} fill className="object-cover"
                      style={{ filter: 'brightness(0.75) saturate(0.8)' }}
                    />
                  </div>

                  <div className="mt-4 flex flex-col gap-1.5">
                    <h3 className="font-serif text-sm font-light transition-colors duration-200" style={{ color: '#F0DFC8' }}>
                      <Link href={`/catalog/products/${item.slug}`}>{item.productName}</Link>
                    </h3>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="font-serif font-semibold" style={{ color: '#DBBF88' }}>
                        ${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      {item.selectedMetal && (
                        <span className="font-sans text-[10px] uppercase tracking-widest" style={{ color: 'rgba(219,191,136,0.4)' }}>
                          {metalLabels[item.selectedMetal]}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4 mt-2" style={{ borderTop: '1px solid rgba(212,112,106,0.07)' }}>
                      <button
                        onClick={() => handleMoveToCart(item)}
                        className="flex-grow py-2 rounded-sm font-sans text-[10px] uppercase tracking-widest font-bold text-center transition-all duration-200"
                        style={{ background: 'rgba(212,112,106,0.08)', border: '1px solid rgba(212,112,106,0.2)', color: '#D4706A' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,112,106,0.14)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(212,112,106,0.08)')}
                      >
                        Move To Bag
                      </button>
                      <button
                        onClick={() => handleRemoveSavedItem(item.id)}
                        className="px-3 py-2 rounded-sm transition-all duration-200"
                        style={{ background: 'rgba(180,60,60,0.06)', border: '1px solid rgba(180,60,60,0.15)', color: 'rgba(200,80,80,0.7)' }}
                        title="Remove Saved Design"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
