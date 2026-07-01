'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ShoppingBag, Menu, X, User, ShieldCheck, Gem } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigationLinks = [
  { name: 'Customizer',       href: '/customizer' },
  { name: 'Engagement',       href: '/engagement' },
  { name: 'Diamonds',         href: '/diamonds' },
  { name: 'High Jewelry',     href: '/high-jewelry' },
  { name: 'Consultation',     href: '/appointments' },
];

const marqueeItems = [
  '✦ Complimentary Insured Priority Shipping',
  '✦ GIA & IGI Certified Diamonds',
  '✦ Bespoke Craftsmanship',
  '✦ Lifetime Resize & Care',
  '✦ Private Gemologist Consultations',
  '✦ Complimentary Insured Priority Shipping',
  '✦ GIA & IGI Certified Diamonds',
  '✦ Bespoke Craftsmanship',
  '✦ Lifetime Resize & Care',
  '✦ Private Gemologist Consultations',
];

export default function Header() {
  const { user, logout } = useAuth();
  const [isScrolled,       setIsScrolled]       = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount,        setCartCount]        = useState(0);
  const [wishlistCount,    setWishlistCount]    = useState(0);
  const [searchOpen,       setSearchOpen]       = useState(false);
  const [searchQuery,      setSearchQuery]      = useState('');

  useEffect(() => {
    const updateCounts = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('luxury_cart') || '[]');
        const wish = JSON.parse(localStorage.getItem('luxury_wishlist') || '[]');
        setCartCount(cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0));
        setWishlistCount(wish.length);
      } catch { /* Fallback */ }
    };
    updateCounts();
    window.addEventListener('cartUpdate',    updateCounts);
    window.addEventListener('wishlistUpdate',updateCounts);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('cartUpdate',    updateCounts);
      window.removeEventListener('wishlistUpdate',updateCounts);
      window.removeEventListener('scroll',        handleScroll);
    };
  }, []);

  return (
    <>
      {/* ── MARQUEE ANNOUNCEMENT BAR ─────────────────────────────────── */}
      <div
        className="w-full overflow-hidden py-2.5 border-b"
        style={{
          background: 'linear-gradient(90deg, rgba(212, 175, 55,0.08) 0%, rgba(151,128,255,0.05) 100%)',
          borderColor: 'rgba(212, 175, 55,0.15)',
        }}
      >
        <div className="marquee-track">
          {marqueeItems.map((item, i) => (
            <span
              key={i}
              className="font-sans text-[10px] tracking-widest uppercase mx-10 whitespace-nowrap"
              style={{ color: 'rgba(219,191,136,0.75)' }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── STICKY MAIN HEADER ───────────────────────────────────────── */}
      <motion.header
        initial={false}
        animate={isScrolled ? 'scrolled' : 'top'}
        className="sticky top-0 z-50 w-full transition-all duration-500"
        style={
          isScrolled
            ? {
                background: 'rgba(11, 38, 38,0.85)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderBottom: '1px solid rgba(212, 175, 55,0.12)',
                boxShadow: '0 4px 40px rgba(0,0,0,0.6)',
                paddingTop: '14px',
                paddingBottom: '14px',
              }
            : {
                background: 'transparent',
                borderBottom: '1px solid transparent',
                paddingTop: '22px',
                paddingBottom: '22px',
              }
        }
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-sm transition-all duration-200"
              style={{ color: '#dfbe58' }}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop Left Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navigationLinks.slice(0, 3).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="relative py-1.5 font-sans text-[11px] uppercase tracking-widest font-medium group transition-colors duration-300"
                style={{ color: 'rgba(219,191,136,0.7)' }}
              >
                <span className="group-hover:opacity-100 transition-opacity duration-300" style={{ color: '#E5CCA0' }}>
                  {link.name}
                </span>
                <span
                  className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-400"
                  style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }}
                />
              </Link>
            ))}
          </nav>

          {/* Brand Logo */}
          <div className="flex-1 lg:flex-none text-center">
            <Link href="/" className="inline-flex flex-col items-center gap-0.5 group">
              <span
                className="font-serif text-2xl md:text-3xl tracking-[0.15em] uppercase font-light transition-all duration-300 group-hover:tracking-[0.2em]"
                style={{
                  background: 'linear-gradient(135deg, #DBBF88 0%, #fef8f1 45%, #d4af37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                BeyondCarat
              </span>
              <span
                className="font-sans text-[8px] tracking-[0.3em] uppercase opacity-50 group-hover:opacity-70 transition-opacity"
                style={{ color: '#DBBF88' }}
              >
                Fine Jewelry
              </span>
            </Link>
          </div>

          {/* Desktop Right Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navigationLinks.slice(3).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="relative py-1.5 font-sans text-[11px] uppercase tracking-widest font-medium group transition-colors duration-300"
                style={{ color: 'rgba(219,191,136,0.7)' }}
              >
                <span className="group-hover:opacity-100 transition-opacity duration-300" style={{ color: '#E5CCA0' }}>
                  {link.name}
                </span>
                <span
                  className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-400"
                  style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }}
                />
              </Link>
            ))}
          </nav>

          {/* Icon Tray */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-sm transition-all duration-200 hover:scale-110"
              style={{ color: 'rgba(219,191,136,0.65)' }}
              aria-label="Search"
            >
              <Search className="h-4.5 w-4.5" style={{ width: '18px', height: '18px' }} />
            </button>

            {/* User */}
            {user ? (
              <div className="relative group">
                <button
                  className="p-2 flex items-center gap-1.5 transition-all duration-200 hover:scale-110"
                  style={{ color: 'rgba(219,191,136,0.65)' }}
                  aria-label="User Menu"
                >
                  <User style={{ width: '18px', height: '18px' }} />
                  <span className="text-[10px] uppercase tracking-wider hidden md:block max-w-[70px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </button>
                <div
                  className="absolute right-0 mt-3 w-44 rounded-sm p-2 hidden group-hover:flex flex-col gap-0.5 z-30"
                  style={{
                    background: 'rgba(10,14,30,0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(212, 175, 55,0.15)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
                  }}
                >
                  <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest border-b mb-1" style={{ color: 'rgba(219,191,136,0.35)', borderColor: 'rgba(212, 175, 55,0.1)' }}>
                    {user.role}
                  </div>
                  <Link href="/dashboard" className="px-3 py-2 text-[10px] uppercase tracking-wider rounded-sm transition-all duration-200 hover:bg-white/5" style={{ color: 'rgba(219,191,136,0.75)' }}>
                    Dashboard
                  </Link>
                  <button onClick={logout} className="w-full px-3 py-2 text-left text-[10px] uppercase tracking-wider rounded-sm transition-all duration-200 hover:bg-white/5" style={{ color: 'rgba(212, 175, 55,0.8)' }}>
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="p-2 transition-all duration-200 hover:scale-110" style={{ color: 'rgba(219,191,136,0.65)' }} aria-label="Login">
                <User style={{ width: '18px', height: '18px' }} />
              </Link>
            )}

            {/* Wishlist */}
            <Link href="/wishlist" className="relative p-2 transition-all duration-200 hover:scale-110" style={{ color: 'rgba(219,191,136,0.65)' }} aria-label="Wishlist">
              <Heart style={{ width: '18px', height: '18px' }} />
              {wishlistCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 text-[8px] font-bold rounded-full h-4 w-4 flex items-center justify-center font-sans"
                  style={{ background: '#d4af37', color: '#0b2626' }}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 transition-all duration-200 hover:scale-110" style={{ color: 'rgba(219,191,136,0.65)' }} aria-label="Cart">
              <ShoppingBag style={{ width: '18px', height: '18px' }} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 text-[8px] font-bold rounded-full h-4 w-4 flex items-center justify-center font-sans"
                  style={{ background: '#d4af37', color: '#0b2626' }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ── SEARCH OVERLAY ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4"
            style={{ background: 'rgba(11, 38, 38,0.92)', backdropFilter: 'blur(20px)' }}
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-w-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="rounded-sm overflow-hidden"
                style={{
                  background: 'rgba(13,18,40,0.9)',
                  border: '1px solid rgba(212, 175, 55,0.2)',
                  boxShadow: '0 0 60px rgba(212, 175, 55,0.15)',
                }}
              >
                <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(212, 175, 55,0.1)' }}>
                  <Search className="h-4 w-4 shrink-0" style={{ color: '#d4af37' }} />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search rings, diamonds, collections…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none font-sans"
                    style={{ color: '#fef8f1' }}
                  />
                  <button onClick={() => setSearchOpen(false)} style={{ color: 'rgba(219,191,136,0.4)' }}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="px-5 py-3 flex gap-2 flex-wrap">
                  {['Solitaire Ring', 'GIA Diamond', 'Engagement', 'Sapphire'].map((q) => (
                    <button
                      key={q}
                      className="px-3 py-1.5 rounded-sm text-[10px] uppercase tracking-wider font-sans transition-all duration-200 hover:opacity-80"
                      style={{ background: 'rgba(212, 175, 55,0.1)', border: '1px solid rgba(212, 175, 55,0.15)', color: '#dfbe58' }}
                      onClick={() => setSearchQuery(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MOBILE DRAWER ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(11, 38, 38,0.7)', backdropFilter: 'blur(8px)' }}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 w-full max-w-xs flex flex-col justify-between p-7"
              style={{
                background: 'rgba(8,11,24,0.97)',
                backdropFilter: 'blur(30px)',
                borderRight: '1px solid rgba(212, 175, 55,0.12)',
                boxShadow: '8px 0 60px rgba(0,0,0,0.8)',
              }}
            >
              {/* Top */}
              <div>
                <div className="flex items-center justify-between pb-7 mb-8" style={{ borderBottom: '1px solid rgba(212, 175, 55,0.1)' }}>
                  <span
                    className="font-serif text-xl tracking-[0.12em] uppercase font-light"
                    style={{
                      background: 'linear-gradient(135deg, #DBBF88, #d4af37)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    BeyondCarat
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-sm transition-colors duration-200"
                    style={{ color: 'rgba(212, 175, 55,0.7)' }}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="flex flex-col gap-1">
                  {navigationLinks.map((link, i) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between py-3.5 px-3 rounded-sm text-sm font-sans uppercase tracking-widest font-medium transition-all duration-200 group"
                        style={{ color: 'rgba(219,191,136,0.7)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                      >
                        <span className="group-hover:text-cream-200 transition-colors" style={{ color: 'inherit' }}>
                          {link.name}
                        </span>
                        <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#d4af37' }}>→</span>
                      </Link>
                    </motion.div>
                  ))}
                  <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: navigationLinks.length * 0.06 }}>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-3.5 px-3 rounded-sm text-sm font-sans uppercase tracking-widest font-medium transition-all duration-200"
                      style={{ color: 'rgba(219,191,136,0.7)' }}
                    >
                      <User className="h-4 w-4" /> Account
                    </Link>
                  </motion.div>
                </nav>

                {/* Quick Icons */}
                <div className="flex gap-4 mt-8 pt-8" style={{ borderTop: '1px solid rgba(212, 175, 55,0.08)' }}>
                  <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-xs font-sans uppercase tracking-wider" style={{ color: 'rgba(219,191,136,0.5)' }}>
                    <Heart className="h-4 w-4" /> Wishlist {wishlistCount > 0 && <span className="text-rose-500">({wishlistCount})</span>}
                  </Link>
                  <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-xs font-sans uppercase tracking-wider" style={{ color: 'rgba(219,191,136,0.5)' }}>
                    <ShoppingBag className="h-4 w-4" /> Cart {cartCount > 0 && <span className="text-rose-500">({cartCount})</span>}
                  </Link>
                </div>
              </div>

              {/* Bottom */}
              <div className="pt-6" style={{ borderTop: '1px solid rgba(212, 175, 55,0.08)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Gem className="h-3 w-3" style={{ color: '#d4af37' }} />
                  <span className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(219,191,136,0.35)' }}>
                    GIA & IGI Certified Diamonds
                  </span>
                </div>
                <p className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(219,191,136,0.2)' }}>
                  © 2026 BeyondCarat Private Ltd.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
