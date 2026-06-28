'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Gift, ShieldCheck, Heart, Clock, Award, FileSpreadsheet } from 'lucide-react';

export default function ReturnPolicyPage() {
  return (
    <div className="w-full bg-luxury-slate-dark text-luxury-gold-50 min-h-screen py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-luxury-slate/10 border border-luxury-gold-900/10 p-8 sm:p-12 rounded-sm shadow-xl">
        
        {/* Header */}
        <div className="border-b border-luxury-gold-900/10 pb-8 mb-8 text-center sm:text-left">
          <span className="text-xs uppercase tracking-widest text-luxury-gold-500 font-semibold mb-2 block">
            Guaranteed Satisfaction
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide text-white leading-tight">
            30-Day Return & Appraisal Policy
          </h1>
          <p className="text-xs sm:text-sm text-luxury-gold-100/60 mt-3 max-w-2xl leading-relaxed">
            Your confidence is our benchmark. BeyondCarat offers a 30-day risk-free return guarantee on all standard customizable setting packages and loose diamonds.
          </p>
        </div>

        {/* Details Grid */}
        <div className="flex flex-col gap-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 bg-luxury-gold-900/10 rounded border border-luxury-gold-500/25 flex items-center justify-center text-luxury-gold-500 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-semibold text-white">30-Day Appraisal Window</h3>
                <p className="text-xs text-luxury-gold-100/60 leading-relaxed mt-1.5">
                  Items can be returned for full refunds within 30 days of initial delivery. Returns must be registered via client accounts to generate secure insured return shipping labels.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 bg-luxury-gold-900/10 rounded border border-luxury-gold-500/25 flex items-center justify-center text-luxury-gold-500 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-semibold text-white">Refund Inspections</h3>
                <p className="text-xs text-luxury-gold-100/60 leading-relaxed mt-1.5">
                  All returned jewelry is subjected to microscope appraisal inspections by GIA gemologists to verify the diamonds laser inscription code and check for setting wear or resizing modifications.
                </p>
              </div>
            </div>
          </div>

          {/* Return guidelines */}
          <div className="border-t border-luxury-gold-900/10 pt-8 mt-4 flex flex-col gap-6">
            <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">Guidelines for Eligible Returns</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs leading-relaxed">
              <div className="p-4 bg-luxury-slate/20 border border-luxury-gold-900/5 rounded-sm">
                <Gift className="h-4 w-4 text-luxury-gold-500 mb-2" />
                <span className="font-bold text-white uppercase block mb-1">Unworn & Pristine</span>
                <p className="text-luxury-gold-100/55">
                  Items must be returned in brand-new, unworn condition with the original security tag intact. Any scratched metals or modified gemstone mountings are ineligible for refund.
                </p>
              </div>

              <div className="p-4 bg-luxury-slate/20 border border-luxury-gold-900/5 rounded-sm">
                <FileSpreadsheet className="h-4 w-4 text-luxury-gold-500 mb-2" />
                <span className="font-bold text-white uppercase block mb-1">GIA Original Reports</span>
                <p className="text-luxury-gold-100/55">
                  Original GIA/IGI hard-copy certificate reports must be returned inside the presentation folder. A replacement fee ($250) applies for lost or damaged physical certs.
                </p>
              </div>

              <div className="p-4 bg-luxury-slate/20 border border-luxury-gold-900/5 rounded-sm">
                <Heart className="h-4 w-4 text-luxury-gold-500 mb-2" />
                <span className="font-bold text-white uppercase block mb-1">Secure Return Pack</span>
                <p className="text-luxury-gold-100/55">
                  Use only prepaid high-security shipping labels provided by BeyondCarat. Handing packages to generic collection bins or unregistered carriers invalidates insurance coverage.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-luxury-slate-dark/50 border border-luxury-gold-900/15 p-4 rounded-sm flex gap-3.5 items-start">
            <ShieldCheck className="h-5 w-5 text-luxury-gold-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-luxury-gold-100/40 uppercase leading-relaxed">
              Bespoke, fully custom designed settings (not matching standard catalog options) are considered private sales and are eligible only for exchange or modification adjustments rather than cash refunds.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
