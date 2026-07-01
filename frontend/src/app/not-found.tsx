'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HelpCircle, Sparkles, Compass } from 'lucide-react';

const S = {
  void: '#0b2626',
  rose: '#d4af37',
  cream: '#fef8f1',
  creamDim: 'rgba(219,191,136,0.6)',
  borderFaint: '1px solid rgba(212, 175, 55,0.1)',
};

export default function NotFound() {
  return (
    <div className="w-full min-h-screen relative flex items-center justify-center text-center px-4" style={{ backgroundColor: S.void, color: S.cream }}>
      {/* Background orbs */}
      <div className="orb orb-rose h-[400px] w-[400px] opacity-20" />
      <div className="orb orb-violet h-[500px] w-[500px] opacity-15" />

      <div className="max-w-md space-y-8 relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mx-auto h-16 w-16 rounded-sm flex items-center justify-center"
          style={{ background: 'rgba(212, 175, 55,0.06)', border: '1px solid rgba(212, 175, 55,0.15)' }}
        >
          <Compass className="h-6 w-6 animate-spin-slow" style={{ color: S.rose }} />
        </motion.div>

        <div className="space-y-3">
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold" style={{ color: S.rose }}>
            Salon Status 404
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-light tracking-wide leading-tight">
            Coordinates Missing
          </h1>
          <div className="divider-rose" />
          <p className="font-sans text-xs max-w-xs mx-auto leading-relaxed" style={{ color: S.creamDim }}>
            The gemstone configuration or salon showcase you are seeking resides outside our public vault catalog.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/catalog" className="btn-rose inline-block text-center text-xs">
            Return to Vault Catalog
          </Link>
          <Link href="/" className="px-6 py-4 font-sans text-xs uppercase tracking-widest font-semibold text-cream hover:text-white inline-block transition-colors duration-200">
            Back to Home Salon
          </Link>
        </div>
      </div>
    </div>
  );
}
