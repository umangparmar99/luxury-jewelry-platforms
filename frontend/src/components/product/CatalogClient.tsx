'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal, ArrowUpDown, Search, Heart, X,
  ChevronDown, Check, Loader2, Bookmark, Gem, Star,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface CategoryNode {
  id: string; name: string; slug: string; children?: CategoryNode[];
}
interface ProductVariant {
  id: string; sku: string; metalType: string; price: string; imageUrls: string;
}
interface ProductCardData {
  id: string; name: string; slug: string; sku: string; basePrice: string;
  isCustomizable: boolean; rating: number;
  category: { name: string; slug: string };
  variants: ProductVariant[];
}
interface PaginationData {
  page: number; limit: number; totalCount: number; totalPages: number;
}
interface CatalogClientProps {
  initialProducts: ProductCardData[];
  initialPagination: PaginationData;
  categories: CategoryNode[];
  searchParams: {
    category?: string; minPrice?: string; maxPrice?: string;
    metal?: string; stone?: string; search?: string; sort?: string; page?: string;
  };
}

const metalsList = [
  { name: '18k Yellow Gold', value: 'YELLOW_GOLD_18K' },
  { name: '18k White Gold', value: 'WHITE_GOLD_18K' },
  { name: '18k Rose Gold',  value: 'ROSE_GOLD_18K' },
  { name: 'Platinum',       value: 'PLATINUM' },
];
const stonesList  = ['Diamond', 'Sapphire', 'Emerald', 'Ruby'];
const sortOptions = [
  { label: 'Newest Releases',    value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Highly Popular',     value: 'popular' },
];

/* ── shared inline-style tokens ─────────────────────────────── */
const S = {
  void:        '#060812',
  voidMid:     'rgba(13,18,40,0.6)',
  rose:        '#D4706A',
  roseHover:   '#E68C72',
  cream:       '#F0DFC8',
  creamDim:    'rgba(219,191,136,0.55)',
  creamFaint:  'rgba(219,191,136,0.35)',
  borderRose:  '1px solid rgba(212,112,106,0.12)',
  borderFaint: '1px solid rgba(212,112,106,0.07)',
};

export default function CatalogClient({
  initialProducts, initialPagination, categories, searchParams,
}: CatalogClientProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();

  const [wishlistedIds,       setWishlistedIds]       = useState<Set<string>>(new Set());
  const [toastMessage,        setToastMessage]        = useState('');
  const [toastType,           setToastType]           = useState<'success'|'error'>('success');
  const [searchInput,         setSearchInput]         = useState(searchParams.search || '');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isSortDropdownOpen,  setIsSortDropdownOpen]  = useState(false);
  const [minPrice,            setMinPrice]            = useState(searchParams.minPrice || '');
  const [maxPrice,            setMaxPrice]            = useState(searchParams.maxPrice || '');
  const [hoveredCard,         setHoveredCard]         = useState<string | null>(null);

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToastMessage(msg); setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem('luxury_wishlist') || '[]');
      const ids = new Set<string>(local.map((i: any) => i.productId || i.id).filter(Boolean));
      setWishlistedIds(ids);
    } catch {}
  }, [user]);

  const handleToggleWishlist = async (e: React.MouseEvent, prod: ProductCardData, displayImage: string) => {
    e.preventDefault(); e.stopPropagation();
    const isWishlisted = wishlistedIds.has(prod.id);
    setWishlistedIds(prev => { const n = new Set(prev); isWishlisted ? n.delete(prod.id) : n.add(prod.id); return n; });

    if (user) {
      try {
        if (isWishlisted) {
          await fetch(`${API_URL}/checkout/wishlist/items/${prod.id}`, { method: 'DELETE', credentials: 'include' });
          showToast('Removed from wishlist.');
        } else {
          await fetch(`${API_URL}/checkout/wishlist/items`, {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: prod.id }),
          });
          showToast('Saved to wishlist ♡');
        }
      } catch {
        setWishlistedIds(prev => { const n = new Set(prev); isWishlisted ? n.add(prod.id) : n.delete(prod.id); return n; });
        showToast('Could not update wishlist.', 'error');
        return;
      }
    } else {
      try {
        const local = JSON.parse(localStorage.getItem('luxury_wishlist') || '[]');
        if (isWishlisted) {
          localStorage.setItem('luxury_wishlist', JSON.stringify(local.filter((i: any) => (i.productId || i.id) !== prod.id)));
          showToast('Removed from wishlist.');
        } else {
          local.push({ productId: prod.id, id: prod.id, name: prod.name, slug: prod.slug, sku: prod.sku, price: Number(prod.basePrice), image: displayImage, isDiamond: false });
          localStorage.setItem('luxury_wishlist', JSON.stringify(local));
          showToast('Saved to wishlist ♡');
        }
      } catch { showToast('Could not update wishlist.', 'error'); }
    }
    window.dispatchEvent(new Event('wishlistUpdate'));
  };

  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => { if (v) params.set(k, v); });
    if (!updates.page && searchParams.page) params.delete('page');
    Object.entries(updates).forEach(([k, v]) => { (v === null || v === '') ? params.delete(k) : params.set(k, v); });
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  useEffect(() => {
    const t = setTimeout(() => { if (searchInput !== (searchParams.search || '')) updateQuery({ search: searchInput }); }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const resetAllFilters = () => {
    startTransition(() => { router.push(pathname); setSearchInput(''); setMinPrice(''); setMaxPrice(''); });
  };

  /* ── Sidebar component ───────────────────────────────────── */
  const SidebarFilters = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col gap-7 ${mobile ? '' : 'pr-6'}`}>
      <div className="flex items-center justify-between pb-4" style={{ borderBottom: S.borderFaint }}>
        <h3 className="font-serif text-sm tracking-wide" style={{ color: S.cream }}>Filters</h3>
        <button
          onClick={resetAllFilters}
          className="font-sans text-[10px] uppercase tracking-widest font-semibold transition-colors duration-200"
          style={{ color: S.rose }}
        >
          Reset All
        </button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-sans text-[10px] uppercase tracking-widest font-semibold mb-4" style={{ color: S.rose }}>
          Categories
        </h4>
        <div className="flex flex-col gap-2 text-xs">
          <button
            onClick={() => updateQuery({ category: null })}
            className="text-left py-1 transition-colors duration-200 font-sans"
            style={{ color: !searchParams.category ? S.rose : S.creamFaint }}
          >
            All Jewelry
          </button>
          {categories.map(cat => (
            <div key={cat.slug} className="flex flex-col gap-1 pl-2 mt-0.5">
              <button
                onClick={() => updateQuery({ category: cat.slug })}
                className="text-left transition-colors duration-200 font-sans"
                style={{ color: searchParams.category === cat.slug ? S.rose : S.creamFaint }}
              >
                {cat.name}
              </button>
              {cat.children?.map(child => (
                <button
                  key={child.slug}
                  onClick={() => updateQuery({ category: child.slug })}
                  className="text-left pl-3 transition-colors font-sans"
                  style={{
                    color: searchParams.category === child.slug ? S.rose : 'rgba(219,191,136,0.28)',
                    borderLeft: '1px solid rgba(212,112,106,0.12)',
                  }}
                >
                  {child.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h4 className="font-sans text-[10px] uppercase tracking-widest font-semibold mb-4" style={{ color: S.rose }}>
          Price Range
        </h4>
        <div className="flex items-center gap-2 text-xs">
          {['Min', 'Max'].map((label, i) => (
            <input
              key={label}
              type="number"
              placeholder={label}
              value={i === 0 ? minPrice : maxPrice}
              onChange={e => i === 0 ? setMinPrice(e.target.value) : setMaxPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-sm text-center outline-none font-sans transition-all duration-200"
              style={{
                background: 'rgba(6,8,18,0.7)',
                border: S.borderRose,
                color: S.cream,
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,112,106,0.4)')}
              onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(212,112,106,0.12)')}
            />
          ))}
        </div>
        <button
          onClick={() => updateQuery({ minPrice, maxPrice })}
          className="w-full mt-3 py-2 rounded-sm font-sans text-[10px] uppercase tracking-widest font-bold transition-all duration-200"
          style={{
            background: 'rgba(212,112,106,0.08)',
            border: '1px solid rgba(212,112,106,0.2)',
            color: S.rose,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,112,106,0.14)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(212,112,106,0.08)')}
        >
          Apply Range
        </button>
      </div>

      {/* Metals */}
      <div>
        <h4 className="font-sans text-[10px] uppercase tracking-widest font-semibold mb-4" style={{ color: S.rose }}>
          Metal Choice
        </h4>
        <div className="flex flex-col gap-3">
          {metalsList.map(m => {
            const checked = searchParams.metal === m.value;
            return (
              <button
                key={m.value}
                onClick={() => updateQuery({ metal: checked ? null : m.value })}
                className="flex items-center gap-3 text-xs text-left font-sans transition-colors duration-200"
                style={{ color: checked ? S.cream : S.creamFaint }}
              >
                <span
                  className="h-4 w-4 rounded-sm shrink-0 flex items-center justify-center transition-all duration-200"
                  style={{
                    background: checked ? '#D4706A' : 'transparent',
                    border: checked ? '1px solid #D4706A' : '1px solid rgba(212,112,106,0.3)',
                  }}
                >
                  {checked && <Check className="h-2.5 w-2.5" style={{ color: '#060812', strokeWidth: 3 }} />}
                </span>
                {m.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stones */}
      <div>
        <h4 className="font-sans text-[10px] uppercase tracking-widest font-semibold mb-4" style={{ color: S.rose }}>
          Gemstone Settings
        </h4>
        <div className="flex flex-col gap-3">
          {stonesList.map(s => {
            const checked = searchParams.stone?.toLowerCase() === s.toLowerCase();
            return (
              <button
                key={s}
                onClick={() => updateQuery({ stone: checked ? null : s.toLowerCase() })}
                className="flex items-center gap-3 text-xs text-left font-sans transition-colors duration-200"
                style={{ color: checked ? S.cream : S.creamFaint }}
              >
                <span
                  className="h-4 w-4 rounded-sm shrink-0 flex items-center justify-center transition-all duration-200"
                  style={{
                    background: checked ? '#D4706A' : 'transparent',
                    border: checked ? '1px solid #D4706A' : '1px solid rgba(212,112,106,0.3)',
                  }}
                >
                  {checked && <Check className="h-2.5 w-2.5" style={{ color: '#060812', strokeWidth: 3 }} />}
                </span>
                {s} Elements
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen font-sans relative" style={{ backgroundColor: S.void, color: S.cream }}>

      {/* ── TOAST ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.92 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            className="fixed bottom-8 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-sm"
            style={{
              background: 'rgba(10,14,30,0.97)',
              border: toastType === 'success' ? '1px solid rgba(212,112,106,0.3)' : '1px solid rgba(220,60,60,0.3)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <Bookmark className="h-4 w-4 shrink-0" style={{ color: toastType === 'success' ? S.rose : '#e55' }} />
            <div>
              <p className="text-xs font-semibold" style={{ color: S.cream }}>Wishlist Updated</p>
              <p className="text-[10px] mt-0.5" style={{ color: S.creamFaint }}>{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MOBILE FILTER DRAWER ──────────────────────────────── */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(6,8,18,0.75)', backdropFilter: 'blur(8px)' }}
              onClick={() => setIsMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 w-80 p-7 overflow-y-auto"
              style={{
                background: 'rgba(8,11,24,0.98)',
                backdropFilter: 'blur(30px)',
                borderRight: '1px solid rgba(212,112,106,0.12)',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-lg tracking-wide" style={{ color: S.cream }}>Filters</h2>
                <button onClick={() => setIsMobileFiltersOpen(false)} style={{ color: S.rose }}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarFilters mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-28">

        {/* ── PAGE HEADER ───────────────────────────────────── */}
        <div className="mb-10 pb-8" style={{ borderBottom: S.borderFaint }}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="font-sans text-[10px] uppercase tracking-widest font-semibold" style={{ color: S.rose }}>
                Fine Jewelry
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-light mt-2" style={{ color: S.cream }}>
                Bespoke Jewelry Catalog
              </h1>
              <p className="font-sans text-[11px] mt-1.5 uppercase tracking-widest" style={{ color: S.creamFaint }}>
                {initialPagination.totalCount} listings matching your choice
              </p>
            </div>

            {/* Search bar */}
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-sm w-full md:max-w-xs"
              style={{ background: 'rgba(13,18,40,0.5)', border: S.borderRose }}
            >
              <Search className="h-3.5 w-3.5 shrink-0" style={{ color: 'rgba(212,112,106,0.5)' }} />
              <input
                type="text"
                placeholder="Search setting names…"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="bg-transparent text-xs w-full outline-none font-sans"
                style={{ color: S.cream }}
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')} style={{ color: S.creamFaint }}>
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── TOOLBAR ───────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: S.borderFaint }}>
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-sm font-sans text-xs uppercase tracking-widest font-bold transition-all duration-200"
            style={{ background: 'rgba(212,112,106,0.08)', border: '1px solid rgba(212,112,106,0.2)', color: S.rose }}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
          </button>

          <div className="hidden lg:flex items-center gap-2 text-xs font-sans" style={{ color: S.creamFaint }}>
            {isPending && (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: S.rose }} />
                Updating…
              </span>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative z-20">
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="flex items-center gap-2 font-sans text-xs uppercase tracking-widest font-semibold py-2 transition-colors duration-200"
              style={{ color: isSortDropdownOpen ? S.cream : S.creamFaint }}
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              {sortOptions.find(o => o.value === (searchParams.sort || 'newest'))?.label}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isSortDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsSortDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0,  scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 rounded-sm p-2 flex flex-col gap-0.5 z-20"
                    style={{
                      background: 'rgba(10,14,30,0.97)',
                      backdropFilter: 'blur(20px)',
                      border: S.borderRose,
                      boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
                    }}
                  >
                    {sortOptions.map(opt => {
                      const active = searchParams.sort === opt.value || (!searchParams.sort && opt.value === 'newest');
                      return (
                        <button
                          key={opt.value}
                          onClick={() => { updateQuery({ sort: opt.value }); setIsSortDropdownOpen(false); }}
                          className="flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-sans transition-all duration-150"
                          style={{
                            color: active ? S.cream : S.creamFaint,
                            background: active ? 'rgba(212,112,106,0.08)' : 'transparent',
                          }}
                          onMouseEnter={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                          onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
                        >
                          {opt.label}
                          {active && <Check className="h-3.5 w-3.5" style={{ color: S.rose }} />}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── MAIN GRID ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block" style={{ borderRight: S.borderFaint }}>
            <SidebarFilters />
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-3">
            {isPending ? (
              /* Skeleton loaders */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-3 animate-pulse">
                    <div className="h-[260px] rounded-sm" style={{ background: 'rgba(13,18,40,0.5)' }} />
                    <div className="h-3 w-1/3 rounded-sm" style={{ background: 'rgba(13,18,40,0.6)' }} />
                    <div className="h-4 w-2/3 rounded-sm" style={{ background: 'rgba(13,18,40,0.7)' }} />
                    <div className="h-3 w-1/2 rounded-sm" style={{ background: 'rgba(13,18,40,0.5)' }} />
                  </div>
                ))}
              </div>
            ) : initialProducts.length === 0 ? (
              /* Empty state */
              <div
                className="w-full text-center py-24 rounded-sm"
                style={{ border: '1px dashed rgba(212,112,106,0.15)' }}
              >
                <Gem className="h-10 w-10 mx-auto mb-4 opacity-30" style={{ color: S.rose }} />
                <p className="font-serif text-xl font-light mb-2" style={{ color: 'rgba(219,191,136,0.5)' }}>
                  No bespoke matches found.
                </p>
                <p className="font-sans text-xs mb-6 max-w-xs mx-auto" style={{ color: 'rgba(219,191,136,0.3)' }}>
                  Try adjusting your filters or reset to browse the full collection.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="px-6 py-3 rounded-sm font-sans text-[10px] uppercase tracking-widest font-bold transition-all duration-200"
                  style={{ background: 'rgba(212,112,106,0.08)', border: '1px solid rgba(212,112,106,0.2)', color: S.rose }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {initialProducts.map((prod, idx) => {
                  let displayImage = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop';
                  if (prod.variants?.length > 0) {
                    try {
                      const imgs = JSON.parse(prod.variants[0].imageUrls);
                      if (Array.isArray(imgs) && imgs.length > 0) displayImage = imgs[0];
                    } catch {}
                  }
                  const isWishlisted = wishlistedIds.has(prod.id);
                  const isHovered    = hoveredCard === prod.id;

                  return (
                    <motion.div
                      key={prod.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className="group relative flex flex-col"
                      onMouseEnter={() => setHoveredCard(prod.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      {/* Image frame */}
                      <div
                        className="relative h-[260px] overflow-hidden rounded-sm transition-all duration-300"
                        style={{
                          border: isHovered ? '1px solid rgba(212,112,106,0.3)' : '1px solid rgba(212,112,106,0.08)',
                          boxShadow: isHovered ? '0 12px 40px rgba(212,112,106,0.12)' : 'none',
                        }}
                      >
                        <Image
                          src={displayImage} alt={prod.name} fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          style={{ filter: 'brightness(0.75) saturate(0.8)' }}
                        />

                        {/* Customizable badge */}
                        {prod.isCustomizable && (
                          <span
                            className="absolute top-3 left-3 font-sans text-[8px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-sm"
                            style={{ background: '#D4706A', color: '#060812' }}
                          >
                            Bespoke
                          </span>
                        )}

                        {/* Wishlist button */}
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={e => handleToggleWishlist(e, prod, displayImage)}
                          className="absolute top-3 right-3 h-7 w-7 rounded-full flex items-center justify-center transition-all duration-200 z-10"
                          style={{
                            background: isWishlisted ? 'rgba(212,112,106,0.9)' : 'rgba(6,8,18,0.65)',
                            border: '1px solid rgba(212,112,106,0.3)',
                            backdropFilter: 'blur(8px)',
                          }}
                        >
                          <Heart
                            className="h-3 w-3"
                            style={{
                              color:  isWishlisted ? '#060812' : '#D4706A',
                              fill:   isWishlisted ? '#060812' : 'transparent',
                            }}
                          />
                        </motion.button>

                        {/* Quick-view slide-up */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 8 }}
                              transition={{ duration: 0.18 }}
                              className="absolute bottom-0 left-0 right-0 p-3 z-10"
                              style={{ background: 'linear-gradient(to top, rgba(6,8,18,0.95), transparent)' }}
                            >
                              <Link
                                href={`/catalog/products/${prod.slug}`}
                                className="block w-full text-center py-2.5 rounded-sm font-sans text-[10px] uppercase tracking-widest font-bold transition-all duration-200"
                                style={{
                                  background: 'rgba(212,112,106,0.12)',
                                  border: '1px solid rgba(212,112,106,0.35)',
                                  color: S.roseHover,
                                }}
                              >
                                View Details
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Metadata */}
                      <div className="mt-4 flex flex-col gap-1">
                        <span className="font-sans text-[9px] uppercase tracking-widest" style={{ color: 'rgba(212,112,106,0.65)' }}>
                          {prod.category.name}
                        </span>
                        <h3 className="font-serif text-sm font-light leading-snug transition-colors duration-200" style={{ color: isHovered ? S.roseHover : S.cream }}>
                          <Link href={`/catalog/products/${prod.slug}`}>{prod.name}</Link>
                        </h3>
                        <div
                          className="flex items-center justify-between pt-2 mt-1"
                          style={{ borderTop: S.borderFaint }}
                        >
                          <span className="font-sans text-sm font-semibold" style={{ color: '#DBBF88' }}>
                            ${Number(prod.basePrice).toFixed(2)}
                          </span>
                          {prod.rating > 0 && (
                            <span className="flex items-center gap-1 font-sans text-[10px]" style={{ color: S.rose }}>
                              <Star className="h-3 w-3" style={{ fill: S.rose }} />
                              <span style={{ color: S.cream }}>{prod.rating.toFixed(1)}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* ── PAGINATION ───────────────────────────── */}
            {initialPagination.totalPages > 1 && (
              <div
                className="flex items-center justify-between mt-16 pt-10 font-sans text-xs"
                style={{ borderTop: S.borderFaint }}
              >
                <button
                  disabled={initialPagination.page === 1 || isPending}
                  onClick={() => updateQuery({ page: String(initialPagination.page - 1) })}
                  className="px-5 py-2.5 rounded-sm uppercase tracking-widest font-bold transition-all duration-200 disabled:opacity-20 disabled:pointer-events-none"
                  style={{ border: '1px solid rgba(212,112,106,0.2)', color: S.creamFaint }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(212,112,106,0.5)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(212,112,106,0.2)')}
                >
                  ← Previous
                </button>

                <span className="uppercase tracking-widest" style={{ color: 'rgba(219,191,136,0.35)' }}>
                  Page{' '}
                  <span style={{ color: S.cream, fontWeight: 700 }}>{initialPagination.page}</span>
                  {' '}of {initialPagination.totalPages}
                </span>

                <button
                  disabled={initialPagination.page === initialPagination.totalPages || isPending}
                  onClick={() => updateQuery({ page: String(initialPagination.page + 1) })}
                  className="px-5 py-2.5 rounded-sm uppercase tracking-widest font-bold transition-all duration-200 disabled:opacity-20 disabled:pointer-events-none"
                  style={{ border: '1px solid rgba(212,112,106,0.2)', color: S.creamFaint }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(212,112,106,0.5)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(212,112,106,0.2)')}
                >
                  Next →
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
