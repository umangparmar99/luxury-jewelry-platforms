'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Gem, ShieldCheck, Sparkles, Clock, PhoneCall, Ruler } from 'lucide-react';

export default function ResizingPolicyPage() {
  return (
    <div className="w-full bg-luxury-slate-dark text-luxury-gold-50 min-h-screen py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-luxury-slate/10 border border-luxury-gold-900/10 p-8 sm:p-12 rounded-sm shadow-xl">
        
        {/* Header */}
        <div className="border-b border-luxury-gold-900/10 pb-8 mb-8 text-center sm:text-left">
          <span className="text-xs uppercase tracking-widest text-luxury-gold-500 font-semibold mb-2 block">
            Client Care Services
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide text-white leading-tight">
            Complimentary Ring Resizing Policy
          </h1>
          <p className="text-xs sm:text-sm text-luxury-gold-100/60 mt-3 max-w-2xl leading-relaxed">
            Ensure your bespoke jewelry matches you flawlessly. BeyondCarat provides complimentary sizing updates within 60 days of purchase.
          </p>
        </div>

        {/* Core Policy Details */}
        <div className="flex flex-col gap-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 bg-luxury-gold-900/10 rounded border border-luxury-gold-500/25 flex items-center justify-center text-luxury-gold-500 shrink-0">
                <Ruler className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-semibold text-white">Sizing Framework</h3>
                <p className="text-xs text-luxury-gold-100/60 leading-relaxed mt-1.5">
                  We custom size all platinum, 18k yellow, rose, and white gold bands between US sizes 4 to 9 (including half-sizes). Alternative custom parameters are evaluated by request.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 bg-luxury-gold-900/10 rounded border border-luxury-gold-500/25 flex items-center justify-center text-luxury-gold-500 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-semibold text-white">Processing Timeline</h3>
                <p className="text-xs text-luxury-gold-100/60 leading-relaxed mt-1.5">
                  Resizing tasks are completed in our NY jeweler boutiques by master goldsmiths. Standard resizing updates take 5-7 working days plus insured delivery transit.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-luxury-gold-900/10 pt-8 mt-4 flex flex-col gap-6">
            <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">How the Resizing Process Works</h3>
            
            <div className="flex flex-col gap-4 text-xs">
              <div className="flex gap-3 items-start border-l-2 border-luxury-gold-500 pl-4 py-1">
                <div>
                  <span className="font-bold text-white uppercase">1. Initiate Resizing Request</span>
                  <p className="text-luxury-gold-100/60 leading-relaxed mt-1">
                    Contact our concierge support team or schedule a Private Consultation. Our gemologists will guide you on identifying the precise US size modification.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start border-l-2 border-luxury-gold-500 pl-4 py-1">
                <div>
                  <span className="font-bold text-white uppercase">2. Secure Package Dispatch</span>
                  <p className="text-luxury-gold-100/60 leading-relaxed mt-1">
                    We will email you a prepaid, fully insured FedEx priority shipping label. Wrap your jewelry securely within the original wooden presentation boxes prior to courier dispatch.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start border-l-2 border-luxury-gold-500 pl-4 py-1">
                <div>
                  <span className="font-bold text-white uppercase">3. Goldsmith Resizing & Polish</span>
                  <p className="text-luxury-gold-100/60 leading-relaxed mt-1">
                    Our goldsmiths modify the ring diameter and restore its mirror-like metallic polish. The diamond mounting prongs are inspected under microscope to verify security settings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning/Alert box */}
          <div className="mt-6 bg-luxury-slate-dark/50 border border-luxury-gold-900/15 p-4 rounded-sm flex gap-3.5 items-start">
            <ShieldCheck className="h-5 w-5 text-luxury-gold-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-luxury-gold-100/40 uppercase leading-relaxed">
              Certain custom engraved settings or complex eternity pavé diamond bands cannot be resized and require band remanufacture. Concierges will evaluate eternity settings on a case-by-case basis.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
