'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, ShoppingBag, Eye, Sliders, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface WishlistItem {
  productId: string;
  name: string;
  slug: string;
  price: string | number;
  image: string;
  isDiamond?: boolean;
  diamondDetails?: {
    id: string;
    shape: string;
    carat: string | number;
    color: string;
    clarity: string;
    cut: string | null;
    certificateNumber: string | null;
    price: string | number;
  };
}

export default function WishlistPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  // Wishlist list
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Compare states
  const [comparedItems, setComparedItems] = useState<WishlistItem[]>([]);
  const [isCompareMode, setIsCompareMode] = useState(false);

  // Toast message
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        try {
          setLoading(true);
          const res = await fetch(`${apiUrl}/checkout/wishlist`, {
            credentials: 'include',
          });
          if (!res.ok) throw new Error('Could not fetch wishlist products.');
          const data = await res.json();
          // Map backend items matching format
          const items = (data.data || []).map((item: any) => ({
            productId: item.product?.id || item.productId,
            name: item.product?.name || 'Bespoke Setting',
            slug: item.product?.slug || '',
            price: Number(item.product?.basePrice || 0),
            image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=300&auto=format&fit=crop',
          }));
          setWishlist(items);
        } catch (err: any) {
          setError(err.message || 'Error loading wishlist records.');
        } finally {
          setLoading(false);
        }
      } else {
        // Read local storage wishlist
        try {
          setLoading(true);
          const local = JSON.parse(localStorage.getItem('luxury_wishlist') || '[]');
          setWishlist(local);
        } catch {
          // Handled fallback
        } finally {
          setLoading(false);
        }
      }
    };

    fetchWishlist();
  }, [user]);

  const handleRemoveItem = async (productId: string) => {
    if (user) {
      try {
        const res = await fetch(`${apiUrl}/checkout/wishlist/items/${productId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Could not remove item.');
        setWishlist((prev) => prev.filter((item) => item.productId !== productId));
        setComparedItems((prev) => prev.filter((item) => item.productId !== productId));
        window.dispatchEvent(new Event('wishlistUpdate'));
        showToast('Successfully removed item from your collection.');
      } catch (err: any) {
        showToast(err.message || 'Error deleting from wishlist.');
      }
    } else {
      try {
        const local = JSON.parse(localStorage.getItem('luxury_wishlist') || '[]');
        const filtered = local.filter((w: any) => w.productId !== productId);
        localStorage.setItem('luxury_wishlist', JSON.stringify(filtered));
        setWishlist(filtered);
        setComparedItems((prev) => prev.filter((item) => item.productId !== productId));
        window.dispatchEvent(new Event('wishlistUpdate'));
        showToast('Successfully removed item from your collection.');
      } catch {
        showToast('Error syncing preferences.');
      }
    }
  };

  const handleAddCompared = (item: WishlistItem) => {
    if (comparedItems.find((c) => c.productId === item.productId)) {
      setComparedItems((prev) => prev.filter((c) => c.productId !== item.productId));
      return;
    }

    if (comparedItems.length >= 3) {
      showToast('You can compare a maximum of 3 items side-by-side.');
      return;
    }

    setComparedItems((prev) => [...prev, item]);
  };

  const handleAddComparedToCart = (item: WishlistItem) => {
    // Add to cart matching standard format
    const cartItem = {
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      sku: `WISH-ADD-${item.productId.substring(0, 5)}`,
      metal: 'YELLOW_GOLD_18K',
      size: 6.0,
      engraving: null,
      price: Number(item.price),
      quantity: 1,
      image: item.image,
      gemstoneId: item.isDiamond ? item.productId : null,
    };

    try {
      const existingCart = JSON.parse(localStorage.getItem('luxury_cart') || '[]');
      existingCart.push(cartItem);
      localStorage.setItem('luxury_cart', JSON.stringify(existingCart));
      window.dispatchEvent(new Event('cartUpdate'));
      showToast(`Added ${item.name} to your Bespoke Bag!`);
    } catch {
      showToast('Error saving item to bag.');
    }
  };

  return (
    <div className="w-full bg-luxury-slate-dark text-luxury-gold-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50 bg-luxury-slate border border-luxury-gold-500/40 p-4 rounded shadow-2xl flex items-center gap-3 backdrop-blur-md"
          >
            <ShieldCheck className="h-5 w-5 text-luxury-gold-500 shrink-0" />
            <span className="text-xs uppercase tracking-wider text-white font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-luxury-gold-900/10 pb-8 mb-12 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-luxury-gold-500 font-semibold mb-2 block">
              Bespoke Curator
            </span>
            <h1 className="font-serif text-4xl font-bold tracking-wide text-white">
              My Saved Showcases
            </h1>
          </div>
          
          {wishlist.length > 0 && (
            <button
              onClick={() => {
                setIsCompareMode(!isCompareMode);
                if (isCompareMode) setComparedItems([]);
              }}
              className={`px-6 py-3 border text-xs uppercase tracking-widest font-bold rounded-sm transition-colors ${
                isCompareMode
                  ? 'bg-luxury-gold-500 border-luxury-gold-400 text-luxury-slate-dark'
                  : 'bg-transparent border-luxury-gold-900/20 text-luxury-gold-200 hover:border-luxury-gold-500/30'
              }`}
            >
              {isCompareMode ? 'Exit Compare Suite' : 'Open Compare Suite'}
            </button>
          )}
        </div>

        {loading ? (
          <div className="w-full h-80 flex flex-col justify-center items-center gap-4">
            <div className="h-8 w-8 border-2 border-luxury-gold-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs uppercase tracking-widest text-luxury-gold-500">Querying saved portfolio...</span>
          </div>
        ) : error ? (
          <div className="bg-red-950/20 border border-red-900/35 p-6 text-center text-xs text-red-200 uppercase tracking-widest">
            {error}
          </div>
        ) : wishlist.length === 0 ? (
          <div className="bg-luxury-slate/10 border border-luxury-gold-900/5 p-16 text-center text-xs uppercase tracking-widest text-luxury-gold-200/40">
            <Heart className="h-8 w-8 mx-auto mb-4 opacity-30" />
            No jewelry configurations saved in your collection profile yet.
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            
            {/* Compare Bar if active */}
            {isCompareMode && (
              <div className="bg-luxury-slate/20 border border-luxury-gold-500/20 p-5 rounded-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-xs">
                  <span className="font-bold text-white uppercase tracking-wider block">Compare Selection</span>
                  <span className="text-[10px] text-luxury-gold-200/50 uppercase mt-0.5 block">
                    Choose up to 3 saved diamonds/settings from the grid to compare side-by-side. ({comparedItems.length}/3 selected)
                  </span>
                </div>

                {comparedItems.length > 1 && (
                  <button
                    onClick={() => {
                      const element = document.getElementById('comparison-matrix');
                      if (element) element.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-2.5 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-[10px] uppercase tracking-widest font-bold rounded-sm transition-colors"
                  >
                    View Comparison Matrix
                  </button>
                )}
              </div>
            )}

            {/* Wishlist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {wishlist.map((item) => {
                const isSelected = !!comparedItems.find((c) => c.productId === item.productId);
                
                return (
                  <div
                    key={item.productId}
                    className={`group bg-luxury-slate/10 border rounded-sm p-5 flex flex-col justify-between transition-all duration-300 relative ${
                      isSelected ? 'border-luxury-gold-500 shadow-xl' : 'border-luxury-gold-900/10 hover:border-luxury-gold-500/20'
                    }`}
                  >
                    {/* Compare Selection Checkbox */}
                    {isCompareMode && (
                      <button
                        onClick={() => handleAddCompared(item)}
                        className={`absolute top-4 left-4 h-6 w-6 border rounded-full flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-luxury-gold-500 border-luxury-gold-400 text-luxury-slate-dark' : 'border-luxury-gold-900/40 bg-luxury-slate-dark/50'
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </button>
                    )}

                    {/* Trash remove item */}
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="absolute top-4 right-4 text-luxury-gold-200/30 hover:text-red-400 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div>
                      {/* Visual Image */}
                      <div className="h-40 flex items-center justify-center bg-luxury-slate-dark/35 border border-luxury-gold-900/5 rounded-sm mb-4 relative overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {item.isDiamond && (
                          <div className="absolute top-2 left-2 bg-luxury-emerald-900/70 border border-luxury-emerald-500/30 text-white text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                            Diamond
                          </div>
                        )}
                      </div>

                      <span className="text-[9px] uppercase tracking-widest text-luxury-gold-400 font-semibold font-mono">
                        {item.isDiamond ? 'GIA Loose Certified' : 'Custom Config setting'}
                      </span>
                      <h3 className="font-serif text-sm font-bold text-white mt-1 group-hover:text-luxury-gold-400 transition-colors">
                        {item.name}
                      </h3>
                      
                      {item.isDiamond && item.diamondDetails && (
                        <div className="flex gap-2 text-[9px] font-mono text-luxury-gold-100/50 mt-1 border-t border-luxury-gold-900/5 pt-2">
                          <span>Shape: {item.diamondDetails.shape}</span>
                          <span>Carat: {item.diamondDetails.carat}ct</span>
                          <span>Clarity: {item.diamondDetails.clarity}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 border-t border-luxury-gold-900/5 pt-4">
                      <div className="flex justify-between items-center mb-4 text-xs">
                        <span className="text-luxury-gold-200/40 uppercase">Price:</span>
                        <span className="text-sm font-serif font-bold text-luxury-gold-300">
                          ${Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {item.isDiamond ? (
                          <button
                            onClick={() => router.push(`/customizer?diamondId=${item.productId}`)}
                            className="w-full py-2.5 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-[10px] uppercase tracking-widest font-bold rounded-sm transition-colors flex items-center justify-center gap-1"
                          >
                            Match in Builder
                          </button>
                        ) : (
                          <button
                            onClick={() => router.push(`/customizer?settingId=${item.productId}`)}
                            className="w-full py-2.5 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-[10px] uppercase tracking-widest font-bold rounded-sm transition-colors flex items-center justify-center gap-1"
                          >
                            Configure Setting
                          </button>
                        )}
                        <button
                          onClick={() => handleAddComparedToCart(item)}
                          className="w-full py-2 border border-luxury-gold-900/20 hover:border-luxury-gold-500/40 text-luxury-gold-200 text-[9px] uppercase tracking-widest font-bold rounded-sm transition-colors flex items-center justify-center gap-1"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" /> Add to Bag
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comparison Matrix Area */}
            {isCompareMode && comparedItems.length > 1 && (
              <motion.div
                id="comparison-matrix"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-luxury-slate/20 border border-luxury-gold-900/10 rounded-sm p-6 sm:p-8 mt-12 scroll-mt-24"
              >
                <div className="text-center mb-8 border-b border-luxury-gold-900/10 pb-6">
                  <span className="text-xs uppercase tracking-widest text-luxury-gold-500 font-semibold font-sans">
                    Bespoke Analytics
                  </span>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mt-1">
                    Side-by-Side Appraisal Matrix
                  </h2>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-luxury-gold-900/15">
                        <th className="py-4 px-3 text-luxury-gold-200/50 uppercase tracking-widest text-[9px] w-1/4">Specs / Attributes</th>
                        {comparedItems.map((item) => (
                          <th key={item.productId} className="py-4 px-4 w-1/4">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-serif font-bold text-white line-clamp-1">{item.name}</span>
                              <span className="text-[10px] font-bold text-luxury-gold-400">
                                ${Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-luxury-gold-900/5">
                        <td className="py-4 px-3 text-luxury-gold-200/50 uppercase tracking-wider text-[9px]">Inventory Type</td>
                        {comparedItems.map((item) => (
                          <td key={item.productId} className="py-4 px-4 text-white font-semibold">
                            {item.isDiamond ? 'Loose Certified Gemstone' : 'Jewelry Setting'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-luxury-gold-900/5">
                        <td className="py-4 px-3 text-luxury-gold-200/50 uppercase tracking-wider text-[9px]">Visual Shape</td>
                        {comparedItems.map((item) => (
                          <td key={item.productId} className="py-4 px-4 text-white font-semibold uppercase">
                            {item.isDiamond ? item.diamondDetails?.shape : 'Round/Oval/Fancy Compatible'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-luxury-gold-900/5">
                        <td className="py-4 px-3 text-luxury-gold-200/50 uppercase tracking-wider text-[9px]">Carat Weight</td>
                        {comparedItems.map((item) => (
                          <td key={item.productId} className="py-4 px-4 text-white font-mono font-semibold">
                            {item.isDiamond ? `${item.diamondDetails?.carat} ct` : 'Customizable'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-luxury-gold-900/5">
                        <td className="py-4 px-3 text-luxury-gold-200/50 uppercase tracking-wider text-[9px]">Color Grade</td>
                        {comparedItems.map((item) => (
                          <td key={item.productId} className="py-4 px-4 text-white font-semibold">
                            {item.isDiamond ? item.diamondDetails?.color : 'N/A (Setting Only)'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-luxury-gold-900/5">
                        <td className="py-4 px-3 text-luxury-gold-200/50 uppercase tracking-wider text-[9px]">Clarity Grade</td>
                        {comparedItems.map((item) => (
                          <td key={item.productId} className="py-4 px-4 text-white font-semibold">
                            {item.isDiamond ? item.diamondDetails?.clarity : 'N/A (Setting Only)'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-luxury-gold-900/5">
                        <td className="py-4 px-3 text-luxury-gold-200/50 uppercase tracking-wider text-[9px]">Cut Quality</td>
                        {comparedItems.map((item) => (
                          <td key={item.productId} className="py-4 px-4 text-white font-semibold">
                            {item.isDiamond ? (item.diamondDetails?.cut || 'EXCELLENT') : 'Handcrafted NY Boutique'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-luxury-gold-900/15">
                        <td className="py-4 px-3 text-luxury-gold-200/50 uppercase tracking-wider text-[9px]">Official Certificate</td>
                        {comparedItems.map((item) => (
                          <td key={item.productId} className="py-4 px-4 text-luxury-gold-300 font-semibold font-mono">
                            {item.isDiamond ? `GIA-${item.diamondDetails?.certificateNumber}` : 'N/A (Metal Hallmarked)'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-6 px-3" />
                        {comparedItems.map((item) => (
                          <td key={item.productId} className="py-6 px-4">
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleAddComparedToCart(item)}
                                className="w-full py-2.5 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-[10px] uppercase tracking-widest font-bold rounded-sm transition-colors flex items-center justify-center gap-1"
                              >
                                <ShoppingBag className="h-3.5 w-3.5" /> Add to bag
                              </button>
                              <button
                                onClick={() => handleRemoveItem(item.productId)}
                                className="w-full py-2 border border-red-950/20 hover:bg-red-950/10 text-red-400 text-[9px] uppercase tracking-widest font-bold rounded-sm transition-colors flex items-center justify-center gap-1"
                              >
                                Delete Saved
                              </button>
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
