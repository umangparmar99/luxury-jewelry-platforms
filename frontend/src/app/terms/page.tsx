'use client';

import React from 'react';

const S = {
  void: '#060812',
  rose: '#D4706A',
  cream: '#F0DFC8',
  creamDim: 'rgba(219,191,136,0.6)',
  borderFaint: '1px solid rgba(212,112,106,0.1)',
};

export default function TermsPage() {
  return (
    <div className="w-full min-h-screen relative" style={{ backgroundColor: S.void, color: S.cream }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="text-center space-y-4 mb-16">
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold" style={{ color: S.rose }}>
            Client Agreement
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-light tracking-wide">
            Terms of Service
          </h1>
          <div className="divider-rose" />
          <p className="font-sans text-[10px] uppercase tracking-widest" style={{ color: S.creamDim }}>
            Last updated: June 2026
          </p>
        </div>

        {/* --- CONTENT --- */}
        <div className="space-y-8 text-xs md:text-sm leading-relaxed" style={{ color: S.creamDim }}>
          <p>
            By entering the BeyondCarat online salon, configuring customizable settings, or placing orders, you agree to comply with and be bound by the following terms and conditions.
          </p>

          <div className="space-y-3">
            <h2 className="font-serif text-lg text-cream font-semibold">1. Bespoke Customization Limits</h2>
            <p>
              Custom settings assembled via our interactive customizer (e.g. choice of metal and specific certified diamond parameters) are individually made to order. Once construction has begun in our studio, these orders cannot be cancelled or altered.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg text-cream font-semibold">2. Pricing & Valuations</h2>
            <p>
              Due to daily market fluctuations in fine gold, platinum, and loose certified diamonds, prices display live valuation data and are subject to change without notice. An order is only locked once transaction success has been verified.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg text-cream font-semibold">3. Insured Transit and Handover</h2>
            <p>
              We guarantee secure, insured transit for all shipments. Liability for the jewelry transfers to the buyer immediately upon receipt of a signature at the designated shipping address.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg text-cream font-semibold">4. Lifetime Resizing & Cleanings</h2>
            <p>
              Lifetime resize benefits apply only to resizing ranges supported by the specific model variant (generally within +/- 2 standard US sizes). Certain micro-pavé or eternity ring shoulders cannot be resized and may require setting remakes.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
