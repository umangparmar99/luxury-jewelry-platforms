'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, Gem, Compass, Sparkles } from 'lucide-react';

const S = {
  void: '#0b2626',
  rose: '#d4af37',
  cream: '#fef8f1',
  creamDim: 'rgba(219,191,136,0.6)',
  borderFaint: '1px solid rgba(212, 175, 55,0.1)',
};

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen relative" style={{ backgroundColor: S.void, color: S.cream }}>
      {/* Background Orbs */}
      <div className="orb orb-rose h-[500px] w-[500px] top-[-100px] left-[-150px] opacity-30" />
      <div className="orb orb-violet h-[600px] w-[600px] bottom-[-200px] right-[-150px] opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10">
        {/* --- HERO SECTION --- */}
        <div className="text-center space-y-6 mb-20 max-w-3xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold"
            style={{ color: S.rose }}
          >
            Since 1887 ✦ Luxury Reimagined
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-4xl md:text-6xl font-light tracking-wide leading-tight"
          >
            A Heritage of Bespoke Elegance
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="divider-rose"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-sans text-xs md:text-sm leading-relaxed max-w-xl mx-auto uppercase tracking-wider"
            style={{ color: S.creamDim }}
          >
            Crafting fine diamond settings and luxury memories for generations with certified ethical precision.
          </motion.p>
        </div>

        {/* --- GRID SHOWCASE --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-28">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[480px] w-full rounded-sm overflow-hidden"
            style={{ border: S.borderFaint }}
          >
            <Image
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop"
              alt="Artisan crafting jewellery"
              fill
              className="object-cover brightness-75 saturate-[0.8]"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <span className="font-sans text-[10px] uppercase tracking-widest font-bold" style={{ color: S.rose }}>
              Our Story
            </span>
            <h2 className="font-serif text-3xl font-light leading-snug">
              Behind the Fire and Sparkle
            </h2>
            <div className="space-y-6 text-xs md:text-sm leading-relaxed" style={{ color: S.creamDim }}>
              <p>
                BeyondCarat was founded on Fifth Avenue with a clear, singular ambition: to bypass standard stock catalog models and place custom diamond designs directly in the hands of luxury collectors worldwide.
              </p>
              <p>
                Our signature system enables you to pair certified conflict-free loose diamonds with custom gold and platinum bands, bringing custom jewelry to life. We work only with GIA and IGI gemologists to verify the cut, fire, color, and clarity of every single stone in our vaults.
              </p>
              <p>
                From classic four-prong baskets to sapphire-halo statements, our pieces are individually custom-made under the watchful eye of master silversmiths.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/catalog" className="btn-outline-rose inline-block text-center">
                Browse Masterpieces
              </Link>
            </div>
          </motion.div>
        </div>

        {/* --- VALUE PROPOSITIONS --- */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-semibold" style={{ color: S.rose }}>
              Why Choose BeyondCarat
            </span>
            <h3 className="font-serif text-2xl md:text-3xl font-light mt-2">
              Uncompromising Standards
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Gem,
                title: 'GIA & IGI Sourced',
                body: 'Every single diamond is hand-inspected under gemological microscopes and verified against GIA or IGI certificates.'
              },
              {
                icon: ShieldCheck,
                title: 'Fully Insured Logistics',
                body: 'Shipped under strict armed custody to global sorting stations, then packaged in anonymous security wrappers.'
              },
              {
                icon: Compass,
                title: 'Bespoke Customizer',
                body: 'Interactive digital sizing, metal configurations, and center-stone alignments customized dynamically.'
              },
              {
                icon: Sparkles,
                title: 'Lifetime Appraisal Care',
                body: 'Complimentary annual inspection, ultrasonic cleaning, micro-claw tightens, and standard sizing fits.'
              }
            ].map((prop, idx) => (
              <motion.div
                key={prop.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="p-6 rounded-sm space-y-4"
                style={{
                  background: 'rgba(13,18,40,0.4)',
                  border: S.borderFaint
                }}
              >
                <div
                  className="h-10 w-10 rounded-sm flex items-center justify-center"
                  style={{ background: 'rgba(212, 175, 55,0.08)', border: '1px solid rgba(212, 175, 55,0.2)' }}
                >
                  <prop.icon className="h-4.5 w-4.5" style={{ color: S.rose }} />
                </div>
                <h4 className="font-serif text-sm font-semibold" style={{ color: '#E5CCA0' }}>
                  {prop.title}
                </h4>
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(219,191,136,0.45)' }}>
                  {prop.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* --- BRAND STORY STATEMENT --- */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="w-full text-center py-20 px-8 rounded-sm relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(13,18,40,0.8) 0%, rgba(11, 38, 38,0.95) 100%)',
            border: S.borderFaint
          }}
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <span className="font-sans text-[9px] uppercase tracking-widest" style={{ color: S.rose }}>
              Our Promise
            </span>
            <p className="font-serif text-lg md:text-2xl font-light italic leading-relaxed" style={{ color: '#E5CCA0' }}>
              "True luxury is not cataloged. It is configured, conceptualized, and custom crafted to capture absolute timelessness."
            </p>
            <p className="font-sans text-[10px] uppercase tracking-widest font-bold" style={{ color: S.rose }}>
              Elena Rostova, Lead Gemologist
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
