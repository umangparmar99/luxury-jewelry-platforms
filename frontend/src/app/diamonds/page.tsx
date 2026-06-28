'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, Filter, Sliders, ChevronDown, Check, ShieldCheck, Download, ExternalLink, HelpCircle, Heart, Eye, ArrowRight, ShoppingBag } from 'lucide-react';

interface Diamond {
  id: string;
  type: string;
  shape: string;
  carat: string | number;
  color: string;
  clarity: string;
  cut: string | null;
  certificateNumber: string | null;
  certificateUrl: string | null;
  price: string | number;
  status: string;
}

const shapes = [
  { name: 'ROUND', icon: '💎' },
  { name: 'OVAL', icon: '🥚' },
  { name: 'EMERALD', icon: '🟩' },
  { name: 'CUSHION', icon: '🟪' },
  { name: 'PEAR', icon: '💧' },
  { name: 'PRINCESS', icon: '⏹️' },
  { name: 'MARQUISE', icon: '👁️' },
  { name: 'RADIANT', icon: '✨' },
  { name: 'HEART', icon: '❤️' },
];

const colors = ['D', 'E', 'F', 'G', 'H', 'I', 'J'];
const clarities = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2'];
const cuts = ['EXCELLENT', 'VERY_GOOD', 'GOOD'];

function DiamondsVaultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  // State
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter States
  const [selectedShape, setSelectedShape] = useState<string>('');
  const [caratRange, setCaratRange] = useState<[number, number]>([0.5, 4.0]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedClarities, setSelectedClarities] = useState<string[]>([]);
  const [selectedCuts, setSelectedCuts] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([2000, 35000]);
  const [sortBy, setSortBy] = useState<string>('carat_asc');

  // Selected Diamond for detail modal
  const [inspectedDiamond, setInspectedDiamond] = useState<Diamond | null>(null);

  // Cart / Wishlist actions message
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    // Read from search params if direct linking (e.g. from Customizer)
    const shapeParam = searchParams.get('shape');
    if (shapeParam) setSelectedShape(shapeParam.toUpperCase());
  }, [searchParams]);

  useEffect(() => {
    const fetchDiamonds = async () => {
      try {
        setLoading(true);
        // Build API filters query
        const query = new URLSearchParams();
        if (selectedShape) query.append('shape', selectedShape);
        query.append('minCarat', caratRange[0].toString());
        query.append('maxCarat', caratRange[1].toString());
        query.append('minPrice', priceRange[0].toString());
        query.append('maxPrice', priceRange[1].toString());
        query.append('limit', '50');

        const res = await fetch(`${apiUrl}/catalog/diamonds?${query.toString()}`);
        if (!res.ok) throw new Error('Failed to load certified diamonds.');
        
        const data = await res.json();
        let list: Diamond[] = data.data?.diamonds || [];

        // Apply local array filters for color, clarity, and cut
        if (selectedColors.length > 0) {
          list = list.filter((d) => selectedColors.includes(d.color));
        }
        if (selectedClarities.length > 0) {
          list = list.filter((d) => selectedClarities.includes(d.clarity));
        }
        if (selectedCuts.length > 0) {
          list = list.filter((d) => d.cut && selectedCuts.includes(d.cut));
        }

        // Sorting
        list.sort((a, b) => {
          const priceA = Number(a.price);
          const priceB = Number(b.price);
          const caratA = Number(a.carat);
          const caratB = Number(b.carat);

          if (sortBy === 'price_asc') return priceA - priceB;
          if (sortBy === 'price_desc') return priceB - priceA;
          if (sortBy === 'carat_desc') return caratB - caratA;
          return caratA - caratB; // carat_asc default
        });

        setDiamonds(list);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Error connecting to loose diamond vault.');
      } finally {
        setLoading(false);
      }
    };

    fetchDiamonds();
  }, [selectedShape, caratRange, selectedColors, selectedClarities, selectedCuts, priceRange, sortBy]);

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleClarity = (clarity: string) => {
    setSelectedClarities((prev) =>
      prev.includes(clarity) ? prev.filter((c) => c !== clarity) : [...prev, clarity]
    );
  };

  const toggleCut = (cut: string) => {
    setSelectedCuts((prev) =>
      prev.includes(cut) ? prev.filter((c) => c !== cut) : [...prev, cut]
    );
  };

  const handleAddDiamondToCart = (diamond: Diamond) => {
    const cartItem = {
      productId: 'diamond-loose', // unique dummy ID for loose diamonds
      name: `${diamond.carat} Carat ${diamond.shape} Loose Diamond`,
      slug: 'loose-diamond',
      sku: diamond.certificateNumber || `DI-LOOSE-${diamond.id}`,
      metal: null,
      size: null,
      engraving: null,
      price: Number(diamond.price),
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=300&auto=format&fit=crop',
      gemstoneId: diamond.id,
    };

    try {
      const existingCart = JSON.parse(localStorage.getItem('luxury_cart') || '[]');
      existingCart.push(cartItem);
      localStorage.setItem('luxury_cart', JSON.stringify(existingCart));
      window.dispatchEvent(new Event('cartUpdate'));
      showToast(`Added GIA-${diamond.certificateNumber} Loose Diamond to your bag!`);
    } catch {
      showToast('Error syncing with shopping bag.');
    }
  };

  const handleAddToWishlist = (diamond: Diamond) => {
    const wishItem = {
      productId: diamond.id,
      name: `${diamond.carat} CT ${diamond.shape} Loose Diamond`,
      slug: `loose-diamond-${diamond.id}`,
      price: Number(diamond.price),
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=300&auto=format&fit=crop',
      isDiamond: true,
      diamondDetails: diamond,
    };

    try {
      const existingWish = JSON.parse(localStorage.getItem('luxury_wishlist') || '[]');
      const alreadyExists = existingWish.find((w: any) => w.productId === diamond.id);
      
      if (alreadyExists) {
        const filtered = existingWish.filter((w: any) => w.productId !== diamond.id);
        localStorage.setItem('luxury_wishlist', JSON.stringify(filtered));
        showToast('Removed diamond from wishlist.');
      } else {
        existingWish.push(wishItem);
        localStorage.setItem('luxury_wishlist', JSON.stringify(existingWish));
        showToast('Saved diamond to wishlist.');
      }
      window.dispatchEvent(new Event('wishlistUpdate'));
    } catch {
      showToast('Error syncing wishlist.');
    }
  };

  const resetFilters = () => {
    setSelectedShape('');
    setCaratRange([0.5, 4.0]);
    setSelectedColors([]);
    setSelectedClarities([]);
    setSelectedCuts([]);
    setPriceRange([2000, 35000]);
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
        {/* Header Block */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest text-luxury-gold-500 font-semibold mb-3 inline-block">
            GIA & IGI Verified Vault
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-wide text-white leading-tight">
            Certified Loose Diamonds
          </h1>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-luxury-gold-100/70 mt-4 leading-relaxed">
            Search our physical vault of certified conflict-free loose diamonds. Filter by the 4Cs, view certified specs, and match instantly inside our Bespoke Ring Builder.
          </p>
        </div>

        {/* Shape Filter Swatches */}
        <div className="w-full overflow-x-auto pb-4 mb-12 flex justify-start md:justify-center gap-4 scrollbar-thin scrollbar-thumb-luxury-gold-900">
          {shapes.map((s) => (
            <button
              key={s.name}
              onClick={() => setSelectedShape(selectedShape === s.name ? '' : s.name)}
              className={`flex flex-col items-center justify-center min-w-[76px] h-[76px] border rounded-sm transition-all duration-300 ${
                selectedShape === s.name
                  ? 'bg-luxury-gold-500 border-luxury-gold-400 text-luxury-slate-dark scale-105'
                  : 'bg-luxury-slate/30 border-luxury-gold-900/10 hover:border-luxury-gold-500/40 text-luxury-gold-200'
              }`}
            >
              <span className="text-xl mb-1">{s.icon}</span>
              <span className="text-[9px] uppercase tracking-wider font-bold">{s.name}</span>
            </button>
          ))}
        </div>

        {/* Faceted Filter Suite Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 bg-luxury-slate/20 border border-luxury-gold-900/10 rounded-sm p-6 flex flex-col gap-8 h-fit">
            <div className="flex items-center justify-between border-b border-luxury-gold-900/10 pb-4">
              <span className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-luxury-gold-500" /> Filters
              </span>
              <button
                onClick={resetFilters}
                className="text-[10px] uppercase tracking-wider text-luxury-gold-500 hover:text-luxury-gold-400 font-semibold"
              >
                Reset All
              </button>
            </div>

            {/* Carat Weight Slider */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-luxury-gold-200 uppercase tracking-wider">Carat Weight</span>
                <span className="text-white font-bold">{caratRange[0]}ct - {caratRange[1]}ct</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.1"
                value={caratRange[0]}
                onChange={(e) => setCaratRange([Number(e.target.value), caratRange[1]])}
                className="w-full accent-luxury-gold-500 h-1 bg-luxury-slate-dark rounded-lg cursor-pointer"
              />
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.1"
                value={caratRange[1]}
                onChange={(e) => setCaratRange([caratRange[0], Number(e.target.value)])}
                className="w-full accent-luxury-gold-500 h-1 bg-luxury-slate-dark rounded-lg cursor-pointer"
              />
            </div>

            {/* Price Slider */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-luxury-gold-200 uppercase tracking-wider">Price Range</span>
                <span className="text-white font-bold">${priceRange[0]} - ${priceRange[1]}</span>
              </div>
              <input
                type="range"
                min="2000"
                max="35000"
                step="500"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="w-full accent-luxury-gold-500 h-1 bg-luxury-slate-dark rounded-lg cursor-pointer"
              />
              <input
                type="range"
                min="2000"
                max="35000"
                step="500"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-luxury-gold-500 h-1 bg-luxury-slate-dark rounded-lg cursor-pointer"
              />
            </div>

            {/* Color Select */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-luxury-gold-200 uppercase tracking-wider">Color Grade</span>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleColor(c)}
                    className={`py-1.5 rounded-sm text-[10px] font-bold border transition-colors ${
                      selectedColors.includes(c)
                        ? 'bg-luxury-gold-500 border-luxury-gold-400 text-luxury-slate-dark'
                        : 'bg-transparent border-luxury-gold-900/10 hover:border-luxury-gold-500/25 text-luxury-gold-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Clarity Select */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-luxury-gold-200 uppercase tracking-wider">Clarity Grade</span>
              <div className="grid grid-cols-4 gap-2">
                {clarities.map((cl) => (
                  <button
                    key={cl}
                    onClick={() => toggleClarity(cl)}
                    className={`py-1.5 rounded-sm text-[9px] font-bold border transition-colors ${
                      selectedClarities.includes(cl)
                        ? 'bg-luxury-gold-500 border-luxury-gold-400 text-luxury-slate-dark'
                        : 'bg-transparent border-luxury-gold-900/10 hover:border-luxury-gold-500/25 text-luxury-gold-200'
                    }`}
                  >
                    {cl}
                  </button>
                ))}
              </div>
            </div>

            {/* Cut Select */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-luxury-gold-200 uppercase tracking-wider">Cut Quality</span>
              <div className="flex flex-col gap-2">
                {cuts.map((ct) => (
                  <button
                    key={ct}
                    onClick={() => toggleCut(ct)}
                    className={`py-2 px-3 rounded-sm text-[10px] font-bold border flex items-center justify-between transition-colors ${
                      selectedCuts.includes(ct)
                        ? 'bg-luxury-gold-500 border-luxury-gold-400 text-luxury-slate-dark'
                        : 'bg-transparent border-luxury-gold-900/10 hover:border-luxury-gold-500/25 text-luxury-gold-200'
                    }`}
                  >
                    <span>{ct.replace('_', ' ')}</span>
                    {selectedCuts.includes(ct) && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs uppercase tracking-widest text-luxury-gold-200/50">
                Showing {diamonds.length} Premium Diamonds
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-luxury-gold-200/40">Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-luxury-slate-dark text-luxury-gold-100 border border-luxury-gold-900/10 outline-none p-1 text-xs uppercase tracking-wider"
                >
                  <option value="carat_asc">Carat (Low to High)</option>
                  <option value="carat_desc">Carat (High to Low)</option>
                  <option value="price_asc">Price (Low to High)</option>
                  <option value="price_desc">Price (High to Low)</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="w-full h-80 flex flex-col justify-center items-center gap-4">
                <div className="h-8 w-8 border-2 border-luxury-gold-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs uppercase tracking-widest text-luxury-gold-500">Querying Certified Vault...</span>
              </div>
            ) : error ? (
              <div className="bg-red-950/20 border border-red-900/30 p-6 text-center text-xs text-red-200 uppercase tracking-widest">
                {error}
              </div>
            ) : diamonds.length === 0 ? (
              <div className="bg-luxury-slate/10 border border-luxury-gold-900/5 p-12 text-center text-xs uppercase tracking-widest text-luxury-gold-200/40">
                No diamonds match the current selection filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {diamonds.map((d, index) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.03 }}
                    className="group bg-luxury-slate/10 border border-luxury-gold-900/10 rounded-sm hover:border-luxury-gold-500/40 p-5 flex flex-col justify-between transition-all duration-300 relative"
                  >
                    <button
                      onClick={() => handleAddToWishlist(d)}
                      className="absolute top-4 right-4 text-luxury-gold-200/40 hover:text-luxury-gold-500 transition-colors"
                    >
                      <Heart className="h-4 w-4" />
                    </button>

                    <div>
                      {/* Shape Representation */}
                      <div className="h-32 flex items-center justify-center bg-luxury-slate-dark/30 rounded-sm mb-4 border border-luxury-gold-900/5 relative overflow-hidden">
                        <span className="text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-500">💎</span>
                        <span className="absolute bottom-2 left-2 text-[9px] font-mono tracking-wider text-luxury-gold-200/30">
                          {d.certificateNumber}
                        </span>
                      </div>

                      {/* Specs Summary */}
                      <span className="text-[10px] uppercase tracking-widest text-luxury-gold-400 font-semibold">
                        GIA Certified Loose
                      </span>
                      <h3 className="font-serif text-lg font-bold text-white mt-1">
                        {d.carat} Carat {d.shape.toLowerCase()}
                      </h3>

                      {/* Spec Badges Grid */}
                      <div className="grid grid-cols-3 gap-2 mt-4 border-y border-luxury-gold-900/5 py-3">
                        <div className="text-center">
                          <div className="text-[8px] uppercase tracking-wider text-luxury-gold-200/40">Color</div>
                          <div className="text-xs font-bold text-white mt-0.5">{d.color}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[8px] uppercase tracking-wider text-luxury-gold-200/40">Clarity</div>
                          <div className="text-xs font-bold text-white mt-0.5">{d.clarity}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[8px] uppercase tracking-wider text-luxury-gold-200/40">Cut</div>
                          <div className="text-[10px] font-bold text-white mt-0.5 truncate">{d.cut || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] uppercase tracking-widest text-luxury-gold-200/50">Price</span>
                        <span className="text-base font-serif font-bold text-luxury-gold-300">
                          ${Number(d.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {/* Match in Ring customizer */}
                        <button
                          onClick={() => router.push(`/customizer?diamondId=${d.id}`)}
                          className="w-full py-2 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-[10px] uppercase tracking-widest font-bold rounded-sm transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span>Match in Ring Builder</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>

                        {/* Inspect Certificate */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setInspectedDiamond(d)}
                            className="py-2 border border-luxury-gold-900/20 hover:border-luxury-gold-500/40 text-luxury-gold-200 text-[9px] uppercase tracking-widest font-bold rounded-sm transition-colors flex items-center justify-center gap-1"
                          >
                            <Eye className="h-3 w-3" /> Inspect
                          </button>
                          <button
                            onClick={() => handleAddDiamondToCart(d)}
                            className="py-2 border border-luxury-gold-900/20 hover:border-luxury-gold-500/40 text-luxury-gold-200 text-[9px] uppercase tracking-widest font-bold rounded-sm transition-colors flex items-center justify-center gap-1"
                          >
                            <ShoppingBag className="h-3 w-3" /> Buy Loose
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GIA Certificate Inspect Drawer/Modal */}
      <AnimatePresence>
        {inspectedDiamond && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectedDiamond(null)}
              className="fixed inset-0 z-50 bg-black"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-luxury-slate-dark border-l border-luxury-gold-900/10 p-8 shadow-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start border-b border-luxury-gold-900/10 pb-6 mb-8">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-luxury-gold-500 font-semibold">
                      GIA Certificate Details
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-white mt-1">
                      {inspectedDiamond.certificateNumber}
                    </h2>
                  </div>
                  <button
                    onClick={() => setInspectedDiamond(null)}
                    className="text-luxury-gold-200 hover:text-white text-xs font-sans uppercase tracking-widest font-semibold"
                  >
                    Close [x]
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  {/* Visual Certification Seal */}
                  <div className="bg-luxury-slate/30 border border-luxury-gold-900/5 p-6 rounded-sm text-center">
                    <span className="text-4xl">📄</span>
                    <h4 className="font-serif text-sm font-semibold text-white mt-3">GIA Diamond Grading Report</h4>
                    <p className="text-[10px] text-luxury-gold-100/50 uppercase tracking-widest mt-1">
                      Report Number: {inspectedDiamond.certificateNumber}
                    </p>
                  </div>

                  {/* Specification Table */}
                  <div className="flex flex-col gap-3 font-sans text-xs">
                    <div className="flex justify-between border-b border-luxury-gold-900/5 pb-2">
                      <span className="text-luxury-gold-200/60 uppercase tracking-wider">Shape & Cut</span>
                      <span className="text-white font-bold uppercase">{inspectedDiamond.shape}</span>
                    </div>
                    <div className="flex justify-between border-b border-luxury-gold-900/5 pb-2">
                      <span className="text-luxury-gold-200/60 uppercase tracking-wider">Carat Weight</span>
                      <span className="text-white font-bold">{inspectedDiamond.carat} ct</span>
                    </div>
                    <div className="flex justify-between border-b border-luxury-gold-900/5 pb-2">
                      <span className="text-luxury-gold-200/60 uppercase tracking-wider">Color Grade</span>
                      <span className="text-white font-bold">{inspectedDiamond.color}</span>
                    </div>
                    <div className="flex justify-between border-b border-luxury-gold-900/5 pb-2">
                      <span className="text-luxury-gold-200/60 uppercase tracking-wider">Clarity Grade</span>
                      <span className="text-white font-bold">{inspectedDiamond.clarity}</span>
                    </div>
                    <div className="flex justify-between border-b border-luxury-gold-900/5 pb-2">
                      <span className="text-luxury-gold-200/60 uppercase tracking-wider">Cut Quality</span>
                      <span className="text-white font-bold uppercase">{inspectedDiamond.cut || 'EXCELLENT'}</span>
                    </div>
                    <div className="flex justify-between border-b border-luxury-gold-900/5 pb-2">
                      <span className="text-luxury-gold-200/60 uppercase tracking-wider">Fluorescence</span>
                      <span className="text-white font-bold uppercase">None</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-luxury-gold-900/10 pt-6">
                <a
                  href={inspectedDiamond.certificateUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-4 border border-luxury-gold-500 hover:bg-luxury-gold-500/5 text-luxury-gold-300 hover:text-white text-xs uppercase tracking-widest font-bold rounded-sm flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <Download className="h-4 w-4" /> Download PDF Report
                </a>
                <button
                  onClick={() => router.push(`/customizer?diamondId=${inspectedDiamond.id}`)}
                  className="w-full py-4 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-xs uppercase tracking-widest font-bold rounded-sm flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <span>Build Ring with this Diamond</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DiamondsVault() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-luxury-slate-dark flex justify-center items-center">
        <div className="h-8 w-8 border-2 border-luxury-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DiamondsVaultContent />
    </Suspense>
  );
}
