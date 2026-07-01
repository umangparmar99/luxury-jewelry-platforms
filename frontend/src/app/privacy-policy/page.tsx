'use client';

import React from 'react';

const S = {
  void: '#0b2626',
  rose: '#d4af37',
  cream: '#fef8f1',
  creamDim: 'rgba(219,191,136,0.6)',
  borderFaint: '1px solid rgba(212, 175, 55,0.1)',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full min-h-screen relative" style={{ backgroundColor: S.void, color: S.cream }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="text-center space-y-4 mb-16">
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] font-semibold" style={{ color: S.rose }}>
            Privacy Standards
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-light tracking-wide">
            Privacy Policy
          </h1>
          <div className="divider-rose" />
          <p className="font-sans text-[10px] uppercase tracking-widest" style={{ color: S.creamDim }}>
            Last updated: June 2026
          </p>
        </div>

        {/* --- CONTENT --- */}
        <div className="space-y-8 text-xs md:text-sm leading-relaxed" style={{ color: S.creamDim }}>
          <p>
            BeyondCarat values your trust above all else. This Privacy Policy details how we handle the collection, security, and usage of your personal profile credentials, shipping addresses, and transaction histories when you browse our boutique.
          </p>

          <div className="space-y-3">
            <h2 className="font-serif text-lg text-cream font-semibold">1. Collection of Valuation Data</h2>
            <p>
              We collect information you directly provide when customizing rings, booking appointments with our certified gemologists, or completing checkout order configurations. This includes contact details, billing/shipping locations, KYC documents, and sizing preferences.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg text-cream font-semibold">2. Transaction Shielding</h2>
            <p>
              All payment transactions are encrypted using secure sockets (SSL) and processed directly via Stripe or Razorpay. BeyondCarat does not store raw credit card numbers or banking secrets in our local database vault.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg text-cream font-semibold">3. Cookie Configuration</h2>
            <p>
              We use secure, HTTP-only cookie parameters to maintain your login session state and preserve items in your bespoke cart. These cookies prevent cross-site scripting (XSS) and cross-site request forgery (CSRF) attempts.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg text-cream font-semibold">4. Concierge Communications</h2>
            <p>
              If subscribed to our newsletter, you will receive notifications regarding diamond acquisitions and vault drops. You can opt out at any time by clicking the unsubscribe link or contacting our specialist line.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
