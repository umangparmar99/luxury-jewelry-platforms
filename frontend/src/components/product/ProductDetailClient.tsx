'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Heart, ShoppingBag, Truck, ShieldCheck, Award, Play, 
  Minus, Plus, ChevronDown, Share2, Check, Sparkles, MessageSquare 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isVerifiedPurchase: boolean;
  createdAt: string;
  user: { name: string };
}

interface ProductVariant {
  id: string;
  sku: string;
  metalType: string;
  price: string;
  imageUrls: string; // JSON string array
}

interface ProductMetalConfig {
  id: string;
  metalType: string;
  priceAdjustment: string;
}

interface ProductDetailData {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  basePrice: string;
  isCustomizable: boolean;
  rating: number;
  category: { name: string; slug: string };
  metalConfigs: ProductMetalConfig[];
  variants: ProductVariant[];
  reviews: Review[];
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: string;
  isCustomizable: boolean;
  category: { name: string };
  variants: Array<{ imageUrls: string }>;
}

interface ProductDetailClientProps {
  product: ProductDetailData;
  relatedProducts: RelatedProduct[];
}

const metalLabels: Record<string, string> = {
  YELLOW_GOLD_18K: '18k Yellow Gold',
  WHITE_GOLD_18K: '18k White Gold',
  ROSE_GOLD_18K: '18k Rose Gold',
  PLATINUM: 'Platinum',
};

const ringSizes = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { user } = useAuth();
  // Parsing variants image list
  const getProductImages = () => {
    let images: string[] = [];
    product.variants.forEach((v) => {
      try {
        const list = JSON.parse(v.imageUrls);
        if (Array.isArray(list)) images.push(...list);
      } catch {
        // Handled
      }
    });
    // Fallback if no images found
    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop');
    }
    return images;
  };

  const images = getProductImages();
  
  // States
  const [selectedImage, setSelectedImage] = useState(0);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [selectedMetal, setSelectedMetal] = useState(product.metalConfigs[0]?.metalType || 'YELLOW_GOLD_18K');
  const [selectedSize, setSelectedSize] = useState<number>(6);
  const [engravingText, setEngravingText] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  // Zoom coordinate states
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: 'none' });

  // Accordion details toggle states
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'shipping'>('details');

  // Review states
  const [reviewsList, setReviewsList] = useState<Review[]>(product.reviews || []);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  // Toast notifications states
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Pricing calculation
  const getCalculatedPrice = () => {
    const base = Number(product.basePrice);
    const adjustment = Number(
      product.metalConfigs.find((c) => c.metalType === selectedMetal)?.priceAdjustment || 0
    );
    return (base + adjustment) * quantity;
  };

  // Magnification Zoom handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${images[selectedImage]})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  // Cart submission Mock/Integration
  const handleAddToCart = async () => {
    if (user) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/checkout/cart/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product.id,
            quantity,
            selectedMetal,
            selectedSize,
            customEngraving: engravingText || null,
          }),
          credentials: 'include',
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to add item to cart.');
        }
        window.dispatchEvent(new Event('cartUpdate'));
        showToast(`Successfully added ${product.name} to your Bespoke Bag!`);
      } catch (err: any) {
        showToast(err.message || 'Error syncing with shopping cart.');
      }
    } else {
      const cartItem = {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        metal: selectedMetal,
        size: selectedSize,
        engraving: engravingText || null,
        price: getCalculatedPrice() / quantity,
        quantity,
        image: images[0],
      };

      try {
        const existingCart = JSON.parse(localStorage.getItem('luxury_cart') || '[]');
        existingCart.push(cartItem);
        localStorage.setItem('luxury_cart', JSON.stringify(existingCart));
        
        window.dispatchEvent(new Event('cartUpdate'));
        showToast(`Successfully added ${product.name} to your Bespoke Bag!`);
      } catch {
        showToast('Error syncing with shopping cart bag.');
      }
    }
  };

  // Wishlist toggling
  const handleAddToWishlist = async () => {
    if (user) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/checkout/wishlist/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product.id,
            selectedMetal,
            selectedSize,
          }),
          credentials: 'include',
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to add item to wishlist.');
        }
        window.dispatchEvent(new Event('wishlistUpdate'));
        showToast('Saved setting to your personal wishlist.');
      } catch (err: any) {
        showToast(err.message || 'Error updating wishlist.');
      }
    } else {
      const wishItem = {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: getCalculatedPrice() / quantity,
        image: images[0],
      };

      try {
        const existingWish = JSON.parse(localStorage.getItem('luxury_wishlist') || '[]');
        const alreadyExists = existingWish.find((w: any) => w.productId === product.id);
        
        if (alreadyExists) {
          const filtered = existingWish.filter((w: any) => w.productId !== product.id);
          localStorage.setItem('luxury_wishlist', JSON.stringify(filtered));
          showToast('Removed item from your personal wishlist.');
        } else {
          existingWish.push(wishItem);
          localStorage.setItem('luxury_wishlist', JSON.stringify(existingWish));
          showToast('Saved setting to your personal wishlist.');
        }
        window.dispatchEvent(new Event('wishlistUpdate'));
      } catch {
        showToast('Error updating wishlist preferences.');
      }
    }
  };

  // Review submission Mock/Integration
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    setReviewMessage('');

    try {
      // Since Auth session pages aren't completed, we mock the submission response and update client state
      setTimeout(() => {
        const reviewMock: Review = {
          id: Math.random().toString(),
          rating: newRating,
          comment: newComment || null,
          isVerifiedPurchase: true,
          createdAt: new Date().toISOString(),
          user: { name: 'Verified Collector' },
        };
        setReviewsList([reviewMock, ...reviewsList]);
        setNewComment('');
        setIsSubmittingReview(false);
        setReviewMessage('Thank you! Your verified appraisal rating has been published.');
      }, 1000);
    } catch {
      setIsSubmittingReview(false);
      setReviewMessage('Failed to post review. Please try again.');
    }
  };

  return (
    <div className="w-full bg-luxury-slate-dark text-luxury-gold-50 min-h-screen pt-12 pb-24 font-sans relative">
      
      {/* Toast Notification Popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50 bg-luxury-slate border border-luxury-gold-500/40 p-4 rounded shadow-2xl flex items-center gap-3 backdrop-blur-md"
          >
            <Sparkles className="h-5 w-5 text-luxury-gold-500 animate-pulse" />
            <div className="text-xs">
              <p className="font-semibold text-white">Item Bag Action</p>
              <p className="text-luxury-gold-200/75 mt-0.5">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-luxury-gold-200/50 mb-8 border-b border-luxury-gold-900/5 pb-4">
          <Link href="/" className="hover:text-luxury-gold-400">Home</Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-luxury-gold-400">Catalog</Link>
          <span>/</span>
          <span className="text-luxury-gold-300 font-semibold">{product.name}</span>
        </nav>

        {/* Double-column grid: Media Left, Configs Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* MEDIA GALLERY COLUMN */}
          <div className="flex flex-col gap-6">
            <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-sm bg-luxury-slate border border-luxury-gold-900/10">
              
              {!isVideoMode ? (
                /* Primary Image viewer with Zoom magnifier */
                <div 
                  className="relative w-full h-full cursor-zoom-in"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <Image
                    src={images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover animate-fade-in"
                    priority
                  />
                  {/* Magnifying Glass overlay lens */}
                  <div 
                    className="absolute inset-0 pointer-events-none border border-luxury-gold-500/20 rounded shadow-inner" 
                    style={zoomStyle}
                  />
                </div>
              ) : (
                /* Video Presentation frame placeholder */
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-black/60 backdrop-blur-md text-center p-6">
                  <Play className="h-16 w-16 text-luxury-gold-500 animate-pulse border border-luxury-gold-500/20 p-4 rounded-full bg-luxury-slate-dark" />
                  <span className="font-serif text-lg text-white mt-4 tracking-wide">360° Studio Showcase</span>
                  <p className="text-xs text-luxury-gold-200/50 max-w-xs mt-2 leading-relaxed">
                    Interactive high-fidelity cinematic video render. GIA certified diamond brilliance analysis.
                  </p>
                  <button 
                    onClick={() => setIsVideoMode(false)}
                    className="mt-6 text-[10px] uppercase tracking-widest font-bold text-luxury-gold-500 hover:text-white"
                  >
                    View Image Gallery
                  </button>
                </div>
              )}

              {/* Badges */}
              {product.isCustomizable && (
                <span className="absolute top-4 left-4 bg-luxury-gold-500 text-luxury-slate-dark font-sans text-[8px] uppercase tracking-widest font-bold px-3 py-1">
                  Bespoke Customizer Ready
                </span>
              )}
            </div>

            {/* Thumbnail tray */}
            <div className="flex items-center gap-4 overflow-x-auto py-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedImage(i);
                    setIsVideoMode(false);
                  }}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden border rounded-sm transition-all duration-300 ${
                    selectedImage === i && !isVideoMode
                      ? 'border-luxury-gold-500 scale-95 shadow-md shadow-luxury-gold-900/10'
                      : 'border-luxury-gold-900/10 hover:border-luxury-gold-500/40'
                  }`}
                >
                  <Image src={img} alt={`${product.name} thumb ${i}`} fill className="object-cover" />
                </button>
              ))}

              {/* Video presentation thumbnail trigger */}
              <button
                onClick={() => setIsVideoMode(true)}
                className={`relative h-20 w-20 shrink-0 bg-luxury-slate border rounded-sm flex flex-col items-center justify-center text-luxury-gold-300 hover:text-white transition-all duration-300 ${
                  isVideoMode ? 'border-luxury-gold-500 scale-95' : 'border-luxury-gold-900/10'
                }`}
              >
                <Play className="h-5 w-5 mb-1" />
                <span className="text-[8px] uppercase tracking-widest font-semibold">Play 360°</span>
              </button>
            </div>
          </div>

          {/* PRODUCT CONFIGURATIONS COLUMN */}
          <div className="flex flex-col gap-8">
            
            {/* Title & Ratings Header */}
            <div>
              <span className="text-xs uppercase tracking-widest text-luxury-gold-400 font-sans font-medium">
                {product.category.name}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-wide text-white mt-1 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center text-luxury-gold-400 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4.5 w-4.5 ${
                        i < Math.floor(product.rating || 5) ? 'fill-luxury-gold-400 text-luxury-gold-400' : 'text-luxury-gold-900/20'
                      }`} 
                    />
                  ))}
                  <span className="text-xs text-white font-semibold ml-2">
                    {product.rating > 0 ? product.rating.toFixed(1) : '5.0'}
                  </span>
                </div>
                <span className="text-luxury-gold-900/20">|</span>
                <span className="text-xs text-luxury-gold-200/50 uppercase tracking-wider">
                  SKU: {product.sku}
                </span>
              </div>
            </div>

            {/* Dynamic Calculated Pricing Display */}
            <div className="bg-luxury-slate/30 border-y border-luxury-gold-900/5 py-6">
              <div className="flex items-baseline gap-4">
                <span className="font-serif text-3xl font-semibold text-white">
                  ${getCalculatedPrice().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-luxury-gold-200/40 font-sans">
                  VAT & Insured Delivery Included
                </span>
              </div>
            </div>

            {/* CONFIG SELECTORS */}
            <div className="flex flex-col gap-6">
              
              {/* Metal configuration options */}
              {product.metalConfigs.length > 0 && (
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-luxury-gold-300 font-bold mb-3">
                    Select Metal Band: <span className="text-white ml-1">{metalLabels[selectedMetal]}</span>
                  </label>
                  <div className="flex items-center gap-3">
                    {product.metalConfigs.map((m) => {
                      const isActive = selectedMetal === m.metalType;
                      let colorClass = '';
                      if (m.metalType === 'YELLOW_GOLD_18K') colorClass = 'bg-[#E3C67C]';
                      else if (m.metalType === 'WHITE_GOLD_18K') colorClass = 'bg-[#E5E5E5]';
                      else if (m.metalType === 'ROSE_GOLD_18K') colorClass = 'bg-[#E8B19E]';
                      else if (m.metalType === 'PLATINUM') colorClass = 'bg-[#CCC5C1]';
                      
                      return (
                        <button
                          key={m.metalType}
                          onClick={() => setSelectedMetal(m.metalType)}
                          className={`relative h-10 w-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                            isActive ? 'border-luxury-gold-500 scale-95 ring-2 ring-luxury-gold-500/10' : 'border-transparent hover:border-luxury-gold-500/30'
                          }`}
                          title={metalLabels[m.metalType]}
                        >
                          <span className={`h-8 w-8 rounded-full ${colorClass} block shadow-inner`} />
                          {isActive && (
                            <span className="absolute inset-0 rounded-full border border-luxury-gold-500 flex items-center justify-center text-luxury-slate-dark font-black">
                              <Check className="h-4.5 w-4.5 text-luxury-slate-dark stroke-[3]" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ring Size Selection */}
              {product.category.slug.includes('ring') && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-[10px] uppercase tracking-widest text-luxury-gold-300 font-bold">
                      Standard US Size: <span className="text-white ml-1">{selectedSize}</span>
                    </label>
                    <button className="text-[9px] uppercase tracking-widest text-luxury-gold-500 hover:text-white font-bold">
                      Size Advisor Guide
                    </button>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto py-1.5 scrollbar-thin">
                    {ringSizes.map((size) => {
                      const isActive = selectedSize === size;
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`h-9 w-12 text-xs font-semibold rounded-sm border shrink-0 transition-all duration-300 ${
                            isActive
                              ? 'bg-luxury-gold-500 border-luxury-gold-500 text-luxury-slate-dark'
                              : 'bg-luxury-slate border-luxury-gold-900/10 text-luxury-gold-100 hover:border-luxury-gold-500/50'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Personalization / Engraving input */}
              {product.isCustomizable && (
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-luxury-gold-300 font-bold mb-3">
                    Complimentary Laser Engraving (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={25}
                    placeholder="Enter message (e.g. Forever Yours, Max 25 chars)..."
                    value={engravingText}
                    onChange={(e) => setEngravingText(e.target.value)}
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-4 text-xs text-white placeholder-luxury-gold-200/25 outline-none focus:border-luxury-gold-500/40 transition-colors"
                  />
                </div>
              )}

              {/* Quantity Select & Add to actions */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center bg-luxury-slate border border-luxury-gold-900/10 rounded-sm">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(quantity - 1)}
                    className="px-3 py-2.5 text-luxury-gold-300 hover:text-white disabled:opacity-20 transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs text-white font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2.5 text-luxury-gold-300 hover:text-white transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-grow py-3 bg-luxury-gold-500 hover:bg-luxury-gold-600 rounded-sm text-luxury-slate-dark text-xs uppercase tracking-widest font-bold transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg shadow-luxury-gold-900/10"
                >
                  <ShoppingBag className="h-4 w-4" /> Add to Bespoke Bag
                </button>

                {/* Add to Wishlist icon button */}
                <button
                  onClick={handleAddToWishlist}
                  className="p-3 bg-luxury-slate border border-luxury-gold-900/10 hover:border-luxury-gold-500/50 rounded-sm text-luxury-gold-300 hover:text-white transition-colors"
                  title="Save Setting"
                >
                  <Heart className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* TRUST COMMMITMENTS & ASSURANCES */}
            <div className="grid grid-cols-3 gap-4 border-t border-luxury-gold-900/5 pt-8 mt-4 text-center">
              <div className="flex flex-col items-center text-center gap-1.5 p-3 bg-luxury-slate/10 rounded">
                <Truck className="h-5 w-5 text-luxury-gold-500" />
                <span className="text-[9px] uppercase tracking-widest font-semibold text-white">Insured Priority</span>
                <p className="text-[8px] text-luxury-gold-200/40">Free FedEx security transit</p>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 p-3 bg-luxury-slate/10 rounded">
                <ShieldCheck className="h-5 w-5 text-luxury-gold-500" />
                <span className="text-[9px] uppercase tracking-widest font-semibold text-white">Lifetime Warranty</span>
                <p className="text-[8px] text-luxury-gold-200/40">Guaranteed craftsmanship</p>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 p-3 bg-luxury-slate/10 rounded">
                <Award className="h-5 w-5 text-luxury-gold-500" />
                <span className="text-[9px] uppercase tracking-widest font-semibold text-white">GIA Appraisal</span>
                <p className="text-[8px] text-luxury-gold-200/40">Independent certification</p>
              </div>
            </div>

            {/* SPECIFICATION TABS */}
            <div className="border-t border-luxury-gold-900/5 pt-8 mt-4">
              <div className="flex border-b border-luxury-gold-900/10 mb-6 text-xs uppercase tracking-wider font-semibold">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-3 pr-6 hover:text-white transition-colors relative ${
                    activeTab === 'details' ? 'text-luxury-gold-500' : 'text-luxury-gold-200/55'
                  }`}
                >
                  Description
                  {activeTab === 'details' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-luxury-gold-500" />}
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-3 px-6 hover:text-white transition-colors relative ${
                    activeTab === 'specs' ? 'text-luxury-gold-500' : 'text-luxury-gold-200/55'
                  }`}
                >
                  Specifications
                  {activeTab === 'specs' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-luxury-gold-500" />}
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`pb-3 px-6 hover:text-white transition-colors relative ${
                    activeTab === 'shipping' ? 'text-luxury-gold-500' : 'text-luxury-gold-200/55'
                  }`}
                >
                  Shipping & Returns
                  {activeTab === 'shipping' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-luxury-gold-500" />}
                </button>
              </div>

              <div className="text-xs text-luxury-gold-200/75 leading-relaxed">
                {activeTab === 'details' && (
                  <div>
                    <p className="mb-4">{product.description}</p>
                    <p>Inspired by standard high-jewelry diamond cuts, this signature prongs placement elevates the gemstone, maximizing the collection of lights reflection to secure optimal brilliance and vault luster rating.</p>
                  </div>
                )}
                
                {activeTab === 'specs' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between py-1.5 border-b border-luxury-gold-900/5">
                      <span className="text-luxury-gold-200/40">Setting SKU</span>
                      <span className="text-white font-medium">{product.sku}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-luxury-gold-900/5">
                      <span className="text-luxury-gold-200/40">Band Width</span>
                      <span className="text-white font-medium">1.8 mm delicate profile</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-luxury-gold-900/5">
                      <span className="text-luxury-gold-200/40">Prongs Count</span>
                      <span className="text-white font-medium">4-prong securing layout</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-luxury-gold-900/5">
                      <span className="text-luxury-gold-200/40">Default Stones Compatability</span>
                      <span className="text-white font-medium">Round, Oval, and Cushion cuts</span>
                    </div>
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <ul className="list-disc pl-4 flex flex-col gap-2">
                    <li>Complimentary priority shipping fully insured under Brink's and FedEx security logistics.</li>
                    <li>Required secure signature delivery on all packages.</li>
                    <li>30-day trial refund and resizing window included.</li>
                  </ul>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* REVIEWS & RATINGS SECTION */}
        <section className="border-t border-luxury-gold-900/5 pt-20 mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            
            {/* Reviews Summary Column */}
            <div>
              <h2 className="font-serif text-2xl font-bold tracking-wide text-white">Collector Appraisals</h2>
              <p className="text-xs text-luxury-gold-200/50 mt-1">Verified reviews and design ratings</p>
              
              <div className="flex items-center gap-4 mt-6">
                <span className="font-serif text-5xl font-bold text-white">
                  {product.rating > 0 ? product.rating.toFixed(1) : '5.0'}
                </span>
                <div>
                  <div className="flex text-luxury-gold-400 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4.5 w-4.5 ${
                          i < Math.floor(product.rating || 5) ? 'fill-luxury-gold-400 text-luxury-gold-400' : 'text-luxury-gold-900/20'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-luxury-gold-200/45 uppercase tracking-widest mt-1 block">
                    Based on {reviewsList.length} reviews
                  </span>
                </div>
              </div>

              {/* Star distribution display */}
              <div className="flex flex-col gap-2.5 mt-8 text-[11px] text-luxury-gold-200/60 font-sans">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviewsList.filter((r) => r.rating === stars).length;
                  const pct = reviewsList.length > 0 ? (count / reviewsList.length) * 100 : stars === 5 ? 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="w-3 text-right">{stars}</span>
                      <Star className="h-3 w-3 text-luxury-gold-400 fill-luxury-gold-400" />
                      <div className="flex-grow h-1.5 bg-luxury-slate rounded overflow-hidden">
                        <div className="h-full bg-luxury-gold-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews Listing & Submission columns */}
            <div className="lg:col-span-2 flex flex-col gap-10">
              
              {/* Submit Review Form */}
              <div className="bg-luxury-slate/20 border border-luxury-gold-900/5 p-6 rounded-sm">
                <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-white mb-4">
                  Write Your Appraisal
                </h3>
                {reviewMessage && (
                  <p className="text-xs text-luxury-gold-400 mb-4 bg-luxury-gold-900/5 p-3 border border-luxury-gold-500/20 rounded-sm">
                    {reviewMessage}
                  </p>
                )}
                <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-luxury-gold-200/60 font-sans">Select Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="text-luxury-gold-400 hover:scale-110 transition-transform"
                        >
                          <Star className={`h-5 w-5 ${newRating >= star ? 'fill-luxury-gold-400 text-luxury-gold-400' : 'text-luxury-gold-900/20'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Describe your design appraisal, diamond setting alignment, or purchase review..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2.5 px-4 text-xs text-white placeholder-luxury-gold-200/20 outline-none focus:border-luxury-gold-500/40 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="self-end px-6 py-2.5 bg-luxury-gold-900/10 border border-luxury-gold-500/25 hover:border-luxury-gold-500/50 rounded-sm text-xs font-sans uppercase tracking-widest font-bold text-luxury-gold-400 transition-colors"
                  >
                    {isSubmittingReview ? 'Publishing...' : 'Submit Appraisal'}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="flex flex-col gap-6">
                {reviewsList.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-luxury-gold-900/10 rounded">
                    <MessageSquare className="h-8 w-8 text-luxury-gold-200/20 mx-auto mb-2" />
                    <p className="text-xs text-luxury-gold-200/40">No appraisals listed yet. Be the first to review this design!</p>
                  </div>
                ) : (
                  reviewsList.map((rev) => (
                    <div key={rev.id} className="border-b border-luxury-gold-900/5 pb-6 flex flex-col gap-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{rev.user.name}</p>
                          <span className="text-[9px] text-luxury-gold-200/40 uppercase tracking-widest mt-0.5 block">
                            {new Date(rev.createdAt).toLocaleDateString(undefined, { 
                              year: 'numeric', month: 'long', day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex text-luxury-gold-400 gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${
                                  i < rev.rating ? 'fill-luxury-gold-400 text-luxury-gold-400' : 'text-luxury-gold-900/20'
                                }`} 
                              />
                            ))}
                          </div>
                          {rev.isVerifiedPurchase && (
                            <span className="text-[8px] bg-luxury-gold-900/10 text-luxury-gold-400 font-sans uppercase tracking-widest font-bold px-1.5 py-0.5">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-luxury-gold-200/70 leading-relaxed font-sans">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        </section>

        {/* RELATED PRODUCTS SECTION */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-luxury-gold-900/5 pt-20 mt-24">
            <div className="mb-10 text-center">
              <h2 className="font-serif text-2xl font-bold tracking-wide text-white">Bespoke Companions</h2>
              <p className="text-xs text-luxury-gold-200/50 mt-1 uppercase tracking-widest font-sans">
                Complementary settings in our bridal collection catalog
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {relatedProducts.map((prod) => {
                let imgUrl = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop';
                if (prod.variants && prod.variants.length > 0) {
                  try {
                    const list = JSON.parse(prod.variants[0].imageUrls);
                    if (Array.isArray(list) && list.length > 0) {
                      imgUrl = list[0];
                    }
                  } catch {
                    // Handled
                  }
                }
                
                return (
                  <div key={prod.id} className="group flex flex-col">
                    <div className="relative h-60 w-full overflow-hidden rounded-sm bg-luxury-slate border border-luxury-gold-900/10">
                      <Image 
                        src={imgUrl} 
                        alt={prod.name} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                      {prod.isCustomizable && (
                        <span className="absolute top-2.5 left-2.5 bg-luxury-gold-500 text-luxury-slate-dark text-[7px] uppercase tracking-widest font-bold px-1.5 py-0.5">
                          Bespoke
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-col gap-0.5 text-xs">
                      <span className="text-[8px] uppercase tracking-widest text-luxury-gold-400 font-sans">
                        {prod.category.name}
                      </span>
                      <h3 className="font-serif font-bold text-white group-hover:text-luxury-gold-400 transition-colors">
                        <Link href={`/catalog/products/${prod.slug}`}>{prod.name}</Link>
                      </h3>
                      <span className="font-semibold text-luxury-gold-200 mt-1">
                        ${Number(prod.basePrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
