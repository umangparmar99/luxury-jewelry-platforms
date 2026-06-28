'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Gem, Sparkles, Shield, Gift, ChevronRight,
  Star, Heart, ArrowRight, Play, Diamond,
  Zap, Award, CheckCircle,
} from 'lucide-react';

/* ─── DATA ──────────────────────────────────────────────────────────────── */
const collections = [
  {
    name: 'Classic Solitaires',
    slug: 'solitaires',
    tag: 'Signature',
    description: 'Impeccable round and oval solitaires set on 18k yellow gold and platinum.',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=700&auto=format&fit=crop',
  },
  {
    name: 'Ocean Emeralds & Sapphires',
    slug: 'gemstones',
    tag: 'Rare',
    description: 'Bespoke designs featuring Colombian emeralds and deep royal blue Ceylon sapphires.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=700&auto=format&fit=crop',
  },
  {
    name: 'Eternal Gold Bands',
    slug: 'wedding-bands',
    tag: 'Bestseller',
    description: 'Elegantly minimal band configurations in 18k white, yellow, and rose gold.',
    image: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?q=80&w=700&auto=format&fit=crop',
  },
];

const trendingProducts = [
  {
    name: 'The Eternal Solitaire Setting',
    sku: 'SET-SOL-001',
    price: 950,
    carat: '1.00 – 3.00 CT',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=500&auto=format&fit=crop',
    imageHover: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=500&auto=format&fit=crop',
    tag: 'Customizable',
    tagColor: '#9780FF',
  },
  {
    name: 'The Sapphire Halo Ring',
    sku: 'SET-SAP-002',
    price: 3200,
    carat: '1.50 CT Ceylon',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=500&auto=format&fit=crop',
    imageHover: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=500&auto=format&fit=crop',
    tag: 'Trending',
    tagColor: '#D4706A',
  },
  {
    name: 'Classic Pavé Diamond Band',
    sku: 'SET-PAV-003',
    price: 1850,
    carat: '0.75 CT Round',
    image: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?q=80&w=500&auto=format&fit=crop',
    imageHover: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=500&auto=format&fit=crop',
    tag: 'Best Seller',
    tagColor: '#D4A820',
  },
  {
    name: 'Emerald Cut Marquise Setting',
    sku: 'SET-EMR-004',
    price: 1450,
    carat: '2.00 CT Emerald',
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=500&auto=format&fit=crop',
    imageHover: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=500&auto=format&fit=crop',
    tag: 'Rare Cut',
    tagColor: '#D4706A',
  },
];

const testimonials = [
  {
    name: 'Eleanor Vance',
    location: 'London, UK',
    avatar: 'EV',
    text: 'BeyondCarat\'s configuration tools let me select my exact GIA round diamond and pair it with a platinum setting. The concierge verified my choice before manufacture — an experience unlike any jeweler.',
    rating: 5,
  },
  {
    name: 'Maximilian Chen',
    location: 'New York, US',
    avatar: 'MC',
    text: 'The loose diamond vault search filters are incredibly precise. Finding a D color, VVS1 clarity round diamond with excellent cut was seamless. Fully insured shipping arrived without a scratch.',
    rating: 5,
  },
];

const statsData = [
  { value: '12,000+', label: 'Certified Diamonds' },
  { value: '98%',     label: 'Client Satisfaction' },
  { value: '15 Yr',   label: 'Craftsmanship Legacy' },
  { value: '4.9★',    label: 'Avg. Review Score' },
];

const instagramPosts = [
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1598560917505-59a3ad559071?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=400&auto=format&fit=crop',
];

/* ─── COMPONENT ─────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [wishlistedItems, setWishlistedItems] = useState<Set<string>>(new Set());
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY      = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroOpacity= useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const toggleWishlist = (sku: string) => {
    setWishlistedItems(prev => {
      const next = new Set(prev);
      next.has(sku) ? next.delete(sku) : next.add(sku);
      return next;
    });
  };

  /* fade-up variant */
  const fadeUp = {
    hidden:  { opacity: 0, y: 30 },
    visible: (i = 0) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
    }),
  };

  return (
    <div className="w-full" style={{ backgroundColor: '#060812', color: '#F0DFC8' }}>

      {/* ════════════════════════════════════════════════════════════════
          1. HERO — cinematic parallax
      ════════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-screen min-h-[680px] w-full flex items-center justify-center overflow-hidden">

        {/* Parallax background */}
        <motion.div className="absolute inset-0 z-0" style={{ y: heroY }}>
          <Image
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1600&auto=format&fit=crop"
            alt="Luxury Jewelry Showcase"
            fill priority
            className="object-cover object-center"
            style={{ filter: 'brightness(0.35) saturate(0.7)' }}
          />
        </motion.div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 z-0"
          style={{ background: 'linear-gradient(to bottom, rgba(6,8,18,0.4) 0%, rgba(6,8,18,0.1) 40%, rgba(6,8,18,0.95) 100%)' }}
        />

        {/* Orb accents */}
        <div className="orb orb-rose absolute top-1/4 left-1/4 w-96 h-96 opacity-40" />
        <div className="orb orb-violet absolute bottom-1/3 right-1/4 w-80 h-80 opacity-30" />

        {/* Hero content */}
        <motion.div
          className="relative z-10 max-w-5xl mx-auto px-4 text-center"
          style={{ opacity: heroOpacity }}
        >
          {/* Tag pill */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: 'rgba(212,112,106,0.1)',
              border: '1px solid rgba(212,112,106,0.25)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Gem className="h-3 w-3" style={{ color: '#D4706A' }} />
            <span className="font-sans text-[10px] uppercase tracking-widest" style={{ color: '#E68C72' }}>
              Bespoke Customizer & Vault
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="font-serif text-5xl sm:text-7xl lg:text-8xl font-light leading-[1.05] mb-6"
            style={{ letterSpacing: '-0.01em' }}
          >
            <span style={{ color: '#F5E6D0' }}>Crafting</span>{' '}
            <span style={{ color: '#F5E6D0' }}>Forever,</span>
            <br />
            <span
              className="font-serif italic font-normal"
              style={{
                background: 'linear-gradient(135deg, #DBBF88 0%, #F5E6D0 40%, #D4706A 80%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Carat By Carat
            </span>
          </motion.h1>

          {/* Sub-text */}
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-10 font-sans"
            style={{ color: 'rgba(219,191,136,0.6)' }}
          >
            Explore our ethical loose certified diamond vault, select your fine setting, and configure custom
            engagement rings in platinum or 18k gold.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/customizer" className="btn-rose flex items-center gap-2 group z-10">
              <span className="relative z-10">Design Your Ring</span>
              <ArrowRight className="h-4 w-4 relative z-10 transform group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/diamonds" className="btn-outline-rose flex items-center gap-2">
              Search Loose Diamonds
            </Link>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
            className="flex flex-wrap items-center justify-center gap-6 mt-12"
          >
            {[
              { icon: CheckCircle, label: 'GIA Certified' },
              { icon: Shield,      label: 'Fully Insured' },
              { icon: Award,       label: 'Artisan Made' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" style={{ color: '#D4706A' }} />
                <span className="font-sans text-[10px] uppercase tracking-widest" style={{ color: 'rgba(219,191,136,0.5)' }}>
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        >
          <div className="h-10 w-px relative overflow-hidden" style={{ background: 'rgba(212,112,106,0.15)' }}>
            <motion.div
              className="absolute top-0 left-0 right-0 h-4"
              style={{ background: 'linear-gradient(to bottom, #D4706A, transparent)' }}
              animate={{ y: [0, 24, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            />
          </div>
          <span className="font-sans text-[8px] uppercase tracking-widest" style={{ color: 'rgba(219,191,136,0.3)' }}>Scroll</span>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          2. STATS BAND
      ════════════════════════════════════════════════════════════════ */}
      <section
        className="py-10 border-y"
        style={{
          background: 'rgba(13,18,40,0.5)',
          borderColor: 'rgba(212,112,106,0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {statsData.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="text-center"
            >
              <div
                className="font-serif text-3xl font-light mb-1"
                style={{
                  background: 'linear-gradient(135deg, #DBBF88, #D4706A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {s.value}
              </div>
              <div className="font-sans text-[10px] uppercase tracking-widest" style={{ color: 'rgba(219,191,136,0.4)' }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          3. FEATURED COLLECTIONS — tall cards with glow on hover
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="font-sans text-[10px] uppercase tracking-widest font-semibold"
            style={{ color: '#D4706A' }}
          >
            Curated Showcases
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl font-light mt-3"
            style={{ color: '#F5E6D0' }}
          >
            The Autumn Collections
          </motion.h2>
          <div className="divider-rose mt-5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map((col, index) => (
            <motion.div
              key={col.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: index * 0.15 }}
              whileHover={{ y: -6 }}
              className="group relative h-[480px] flex flex-col justify-end overflow-hidden rounded-sm cursor-pointer"
              style={{
                border: '1px solid rgba(212,112,106,0.1)',
                transition: 'border-color 0.4s, box-shadow 0.4s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,112,106,0.3)';
                (e.currentTarget as HTMLElement).style.boxShadow  = '0 20px 60px rgba(212,112,106,0.15)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,112,106,0.1)';
                (e.currentTarget as HTMLElement).style.boxShadow  = 'none';
              }}
            >
              <Image
                src={col.image} alt={col.name} fill
                className="object-cover transition-transform duration-700 group-hover:scale-107"
                style={{ filter: 'brightness(0.6) saturate(0.8)' }}
              />
              {/* Multi-layer gradient */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(6,8,18,0.97) 0%, rgba(6,8,18,0.4) 45%, transparent 100%)' }} />

              {/* Tag */}
              <span
                className="absolute top-4 left-4 font-sans text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-sm z-10"
                style={{ background: 'rgba(212,112,106,0.15)', border: '1px solid rgba(212,112,106,0.3)', color: '#E68C72' }}
              >
                {col.tag}
              </span>

              {/* Content */}
              <div className="relative z-10 p-6 flex flex-col gap-3">
                <h3 className="font-serif text-2xl font-light" style={{ color: '#F5E6D0' }}>{col.name}</h3>
                <p className="font-sans text-[11px] leading-relaxed" style={{ color: 'rgba(219,191,136,0.55)' }}>{col.description}</p>
                <Link
                  href={`/catalog?collection=${col.slug}`}
                  className="inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest font-semibold mt-1 group/link"
                  style={{ color: '#D4706A' }}
                >
                  <span>Explore Collection</span>
                  <ChevronRight className="h-3 w-3 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          4. TRENDING PRODUCTS — product cards with wishlist
      ════════════════════════════════════════════════════════════════ */}
      <section
        className="py-28"
        style={{
          background: 'linear-gradient(180deg, rgba(13,18,40,0.2) 0%, rgba(13,18,40,0.5) 100%)',
          borderTop: '1px solid rgba(212,112,106,0.06)',
          borderBottom: '1px solid rgba(212,112,106,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-16 gap-4">
            <div>
              <span className="font-sans text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#D4706A' }}>
                Most Desired
              </span>
              <h2 className="font-serif text-4xl font-light mt-2" style={{ color: '#F5E6D0' }}>
                Trending Bespoke Settings
              </h2>
            </div>
            <Link
              href="/catalog"
              className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest font-semibold group"
              style={{ color: '#D4706A' }}
            >
              View Full Catalog
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((prod, index) => (
              <motion.div
                key={prod.sku}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                className="group flex flex-col"
                onMouseEnter={() => setHoveredProduct(prod.sku)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Image container */}
                <div
                  className="relative h-[300px] overflow-hidden rounded-sm"
                  style={{
                    border: '1px solid rgba(212,112,106,0.08)',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                    ...(hoveredProduct === prod.sku && {
                      borderColor: 'rgba(212,112,106,0.25)',
                      boxShadow: '0 12px 40px rgba(212,112,106,0.12)',
                    }),
                  }}
                >
                  {/* Base image */}
                  <Image
                    src={prod.image} alt={prod.name} fill
                    className="object-cover transition-opacity duration-500"
                    style={{
                      opacity: hoveredProduct === prod.sku ? 0 : 1,
                      filter: 'brightness(0.75) saturate(0.85)',
                    }}
                  />
                  {/* Hover image */}
                  <Image
                    src={prod.imageHover} alt={`${prod.name} hover`} fill
                    className="object-cover absolute inset-0 transition-opacity duration-500"
                    style={{
                      opacity: hoveredProduct === prod.sku ? 1 : 0,
                      filter: 'brightness(0.75) saturate(0.85)',
                    }}
                  />

                  {/* Tag badge */}
                  <span
                    className="absolute top-3 left-3 font-sans text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-sm z-10"
                    style={{ background: prod.tagColor, color: '#060812', fontWeight: 700 }}
                  >
                    {prod.tag}
                  </span>

                  {/* Wishlist button */}
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => toggleWishlist(prod.sku)}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center z-10 transition-all duration-300"
                    style={{
                      background: wishlistedItems.has(prod.sku) ? 'rgba(212,112,106,0.9)' : 'rgba(6,8,18,0.65)',
                      border: '1px solid rgba(212,112,106,0.3)',
                      backdropFilter: 'blur(8px)',
                    }}
                    aria-label="Add to wishlist"
                  >
                    <Heart
                      className="h-3.5 w-3.5 transition-all duration-200"
                      style={{
                        color: wishlistedItems.has(prod.sku) ? '#060812' : '#D4706A',
                        fill: wishlistedItems.has(prod.sku) ? '#060812' : 'transparent',
                      }}
                    />
                  </motion.button>

                  {/* Quick add overlay */}
                  <AnimatePresence>
                    {hoveredProduct === prod.sku && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-0 left-0 right-0 p-3 z-10"
                        style={{ background: 'linear-gradient(to top, rgba(6,8,18,0.95), transparent)' }}
                      >
                        <Link
                          href={`/catalog/products/${prod.sku}`}
                          className="block w-full text-center py-2.5 font-sans text-[10px] uppercase tracking-widest font-bold rounded-sm transition-all duration-200"
                          style={{
                            background: 'rgba(212,112,106,0.15)',
                            border: '1px solid rgba(212,112,106,0.4)',
                            color: '#E68C72',
                          }}
                        >
                          View Details
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Product info */}
                <div className="mt-4 flex flex-col gap-1">
                  <span className="font-sans text-[9px] uppercase tracking-widest" style={{ color: 'rgba(212,112,106,0.7)' }}>
                    Setting · from
                  </span>
                  <h3 className="font-serif text-base font-light leading-snug" style={{ color: '#F0DFC8' }}>
                    <Link href={`/catalog/products/${prod.sku}`} className="hover:opacity-75 transition-opacity">
                      {prod.name}
                    </Link>
                  </h3>
                  <div
                    className="flex items-center justify-between pt-2 mt-1"
                    style={{ borderTop: '1px solid rgba(212,112,106,0.07)' }}
                  >
                    <span className="font-sans text-sm font-semibold" style={{ color: '#DBBF88' }}>
                      ${prod.price.toLocaleString()}
                    </span>
                    <span className="font-sans text-[10px]" style={{ color: 'rgba(219,191,136,0.4)' }}>
                      {prod.carat}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          5. FEATURE SHOWCASE — split screen
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Image side — with floating badge */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative h-[540px]"
          >
            <div
              className="relative h-full w-full rounded-sm overflow-hidden"
              style={{ border: '1px solid rgba(212,112,106,0.12)' }}
            >
              <Image
                src="https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=900&auto=format&fit=crop"
                alt="Bespoke Crafting Solitaire" fill
                className="object-cover"
                style={{ filter: 'brightness(0.65) saturate(0.7)' }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(6,8,18,0.3) 0%, rgba(6,8,18,0.05) 100%)' }} />
            </div>

            {/* Floating stats card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute -bottom-6 -right-4 glass-card rounded-sm p-5 max-w-[200px] shadow-deep"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: '#D4706A' }} />
                <span className="font-sans text-[9px] uppercase tracking-widest" style={{ color: 'rgba(212,112,106,0.7)' }}>Live Crafting</span>
              </div>
              <div className="font-serif text-2xl font-light mb-0.5" style={{ color: '#F5E6D0' }}>340+</div>
              <div className="font-sans text-[9px] uppercase tracking-widest" style={{ color: 'rgba(219,191,136,0.4)' }}>Rings Made This Month</div>
            </motion.div>

            {/* Floating cert badge */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.8 }}
              className="absolute top-6 -left-4 glass-card rounded-sm p-4"
            >
              <div className="flex items-center gap-2">
                <Diamond className="h-4 w-4" style={{ color: '#9780FF' }} />
                <div>
                  <div className="font-sans text-[9px] uppercase tracking-widest" style={{ color: 'rgba(219,191,136,0.4)' }}>Certified By</div>
                  <div className="font-serif text-sm font-semibold" style={{ color: '#F0DFC8' }}>GIA & IGI</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="flex flex-col gap-6"
          >
            <span className="font-sans text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#D4706A' }}>
              Signature Craftsmanship
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1]" style={{ color: '#F5E6D0' }}>
              Configure Your{' '}
              <span
                className="italic"
                style={{
                  background: 'linear-gradient(135deg, #DBBF88, #D4706A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Ideal Solitaire
              </span>
            </h2>
            <p className="font-sans text-sm leading-relaxed" style={{ color: 'rgba(219,191,136,0.55)' }}>
              Our signature solitaire customizer matches high-jeweler benchmarks. Choose 18k yellow, white or rose gold bands with 4-prong and 6-prong settings, inner-band engravings, and rare loose diamond matching.
            </p>

            {/* Feature bullets */}
            <div
              className="grid grid-cols-1 gap-4 py-6"
              style={{ borderTop: '1px solid rgba(212,112,106,0.08)', borderBottom: '1px solid rgba(212,112,106,0.08)' }}
            >
              {[
                { icon: Gem,      title: 'Ethical Sourcing',  body: 'Conflict-free GIA gemstones verified by our diamond concierges.' },
                { icon: Sparkles, title: 'Bespoke Fitting',   body: 'Complimentary resizing for a secure, comfortable match.' },
                { icon: Zap,      title: 'Express Turnaround',body: 'Ready-to-ship settings crafted in under 10 business days.' },
                { icon: Shield,   title: 'Lifetime Guarantee',body: 'Every setting carries a lifetime craftsmanship warranty.' },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex items-start gap-3">
                  <div
                    className="h-8 w-8 shrink-0 rounded-sm flex items-center justify-center mt-0.5"
                    style={{ background: 'rgba(212,112,106,0.08)', border: '1px solid rgba(212,112,106,0.15)' }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: '#D4706A' }} />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold mb-0.5" style={{ color: '#F0DFC8' }}>{title}</h4>
                    <p className="font-sans text-[11px] leading-relaxed" style={{ color: 'rgba(219,191,136,0.45)' }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/customizer" className="btn-rose self-start flex items-center gap-2 group">
              <span className="relative z-10">Build A Solitaire Ring</span>
              <ArrowRight className="h-4 w-4 relative z-10 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          6. TRUST MATRIX — 4-col grid
      ════════════════════════════════════════════════════════════════ */}
      <section
        className="py-20"
        style={{
          background: 'linear-gradient(135deg, rgba(151,128,255,0.03) 0%, rgba(212,112,106,0.04) 100%)',
          borderTop: '1px solid rgba(212,112,106,0.06)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl font-light" style={{ color: '#F5E6D0' }}>Why BeyondCarat</h2>
            <div className="divider-rose mt-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Shield,  title: 'GIA & IGI Verified',    body: 'We trade only diamonds with certified laser-inscribed reports.' },
              { icon: Sparkles,title: 'Artisan Handcrafting',  body: 'Every ring manufactured to order at our New York boutique.' },
              { icon: Gift,    title: 'Luxury Presentation',   body: 'Polished lacquered wooden boxes in protective outer packaging.' },
              { icon: Gem,     title: 'Private Consultation',  body: 'Schedule virtual meetings with resident GIA gemologists.' },
            ].map(({ icon: Icon, title, body }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="glass-card rounded-sm p-6 text-center flex flex-col items-center gap-4 cursor-default transition-all duration-300"
              >
                <div
                  className="h-12 w-12 rounded-sm flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(212,112,106,0.12), rgba(151,128,255,0.08))',
                    border: '1px solid rgba(212,112,106,0.2)',
                  }}
                >
                  <Icon className="h-5 w-5" style={{ color: '#D4706A' }} />
                </div>
                <h3 className="font-serif text-base font-semibold" style={{ color: '#F0DFC8' }}>{title}</h3>
                <p className="font-sans text-[11px] leading-relaxed" style={{ color: 'rgba(219,191,136,0.45)' }}>{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          7. TESTIMONIALS
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-28 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="font-sans text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#D4706A' }}>
            Client Memoirs
          </span>
          <h2 className="font-serif text-4xl font-light mt-3" style={{ color: '#F5E6D0' }}>Reviews From Beyond</h2>
          <div className="divider-rose mt-5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="glass-card rounded-sm p-8 flex flex-col justify-between gap-6"
            >
              <div className="flex flex-col gap-4">
                <div className="flex gap-1">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5" style={{ fill: '#D4706A', color: '#D4706A' }} />
                  ))}
                </div>
                <p className="font-serif text-base font-light leading-relaxed italic" style={{ color: 'rgba(219,191,136,0.7)' }}>
                  "{t.text}"
                </p>
              </div>
              <div
                className="flex items-center gap-3 pt-5"
                style={{ borderTop: '1px solid rgba(212,112,106,0.08)' }}
              >
                {/* Avatar */}
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-bold font-sans shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(212,112,106,0.3), rgba(151,128,255,0.2))',
                    border: '1px solid rgba(212,112,106,0.3)',
                    color: '#E68C72',
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="font-sans text-xs font-semibold" style={{ color: '#F0DFC8' }}>{t.name}</div>
                  <div className="font-sans text-[10px]" style={{ color: 'rgba(212,112,106,0.6)' }}>{t.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          8. INSTAGRAM / GALLERY GRID
      ════════════════════════════════════════════════════════════════ */}
      <section
        className="py-20"
        style={{ borderTop: '1px solid rgba(212,112,106,0.06)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="font-sans text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#D4706A' }}>
              Social Muse
            </span>
            <h2 className="font-serif text-4xl font-light mt-3" style={{ color: '#F5E6D0' }}>#BeyondCaratMoments</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {instagramPosts.map((url, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                whileHover={{ scale: 1.03 }}
                className="group relative h-[160px] overflow-hidden rounded-sm cursor-pointer"
                style={{ border: '1px solid rgba(212,112,106,0.08)' }}
              >
                <Image
                  src={url} alt={`Gallery ${i + 1}`} fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  style={{ filter: 'brightness(0.7) saturate(0.75)' }}
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  style={{ background: 'rgba(212,112,106,0.18)' }}
                >
                  <span
                    className="font-sans text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-sm"
                    style={{ background: 'rgba(6,8,18,0.7)', color: '#E68C72', border: '1px solid rgba(212,112,106,0.3)' }}
                  >
                    View
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          9. NEWSLETTER — glowing card CTA
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto relative rounded-sm overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(13,18,40,0.9) 0%, rgba(20,12,35,0.9) 100%)',
            border: '1px solid rgba(212,112,106,0.15)',
            boxShadow: '0 0 80px rgba(212,112,106,0.08), 0 40px 80px rgba(0,0,0,0.5)',
          }}
        >
          {/* Background orbs inside card */}
          <div className="orb orb-rose absolute -top-12 -right-12 w-64 h-64 opacity-25" />
          <div className="orb orb-violet absolute -bottom-12 -left-12 w-56 h-56 opacity-20" />

          {/* Decorative border top line */}
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,112,106,0.5), transparent)' }} />

          <div className="relative z-10 p-12 sm:p-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5" style={{ background: 'rgba(212,112,106,0.08)', border: '1px solid rgba(212,112,106,0.2)' }}>
              <Sparkles className="h-3 w-3" style={{ color: '#D4706A' }} />
              <span className="font-sans text-[10px] uppercase tracking-widest" style={{ color: '#E68C72' }}>Private Access</span>
            </div>

            <h2 className="font-serif text-4xl sm:text-5xl font-light mb-4" style={{ color: '#F5E6D0' }}>
              Become A{' '}
              <span
                className="italic"
                style={{
                  background: 'linear-gradient(135deg, #DBBF88, #D4706A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                BeyondCarat
              </span>{' '}
              Member
            </h2>
            <p className="max-w-md mx-auto font-sans text-sm leading-relaxed mb-10" style={{ color: 'rgba(219,191,136,0.5)' }}>
              VIP notifications on rare GIA loose diamond releases, private showcases, and exclusive annual concierge pricing opportunities.
            </p>

            <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-5 py-4 rounded-sm font-sans text-sm outline-none transition-all duration-300"
                style={{
                  background: 'rgba(6,8,18,0.7)',
                  border: '1px solid rgba(212,112,106,0.15)',
                  color: '#F0DFC8',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,112,106,0.45)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(212,112,106,0.15)')}
                required
              />
              <button
                type="submit"
                className="btn-rose shrink-0 flex items-center justify-center gap-2"
              >
                <span className="relative z-10">Request Invitation</span>
              </button>
            </form>

            <p className="font-sans text-[9px] uppercase tracking-widest mt-5" style={{ color: 'rgba(219,191,136,0.2)' }}>
              No spam · Unsubscribe anytime · Private vault access
            </p>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
