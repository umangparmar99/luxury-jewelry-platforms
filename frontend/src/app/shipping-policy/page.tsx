'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Truck, ShieldCheck, MapPin, Award, CheckCircle, Package } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="w-full bg-luxury-slate-dark text-luxury-gold-50 min-h-screen py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-luxury-slate/10 border border-luxury-gold-900/10 p-8 sm:p-12 rounded-sm shadow-xl">
        
        {/* Header */}
        <div className="border-b border-luxury-gold-900/10 pb-8 mb-8 text-center sm:text-left">
          <span className="text-xs uppercase tracking-widest text-luxury-gold-500 font-semibold mb-2 block">
            Delivery & Logistics
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide text-white leading-tight">
            Secure Insured Shipping Policy
          </h1>
          <p className="text-xs sm:text-sm text-luxury-gold-100/60 mt-3 max-w-2xl leading-relaxed">
            BeyondCarat provides complimentary, fully insured next-day delivery on all domestic orders, managed via high-security carriers.
          </p>
        </div>

        {/* Details Grid */}
        <div className="flex flex-col gap-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 bg-luxury-gold-900/10 rounded border border-luxury-gold-500/25 flex items-center justify-center text-luxury-gold-500 shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-semibold text-white">Priority Carriers</h3>
                <p className="text-xs text-luxury-gold-100/60 leading-relaxed mt-1.5">
                  Shipments are managed using FedEx Priority Overnight or Brink's Securmark courier networks. Tracking details are dispatched via encrypted emails upon transit registry.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 bg-luxury-gold-900/10 rounded border border-luxury-gold-500/25 flex items-center justify-center text-luxury-gold-500 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-semibold text-white">Full Value Insurance</h3>
                <p className="text-xs text-luxury-gold-100/60 leading-relaxed mt-1.5">
                  Packages are fully insured at 100% of their retail value from our manufacturing vault to your doorstep. Risk of loss transitions only upon certified recipient signature.
                </p>
              </div>
            </div>
          </div>

          {/* Logistics highlights */}
          <div className="border-t border-luxury-gold-900/10 pt-8 mt-4 flex flex-col gap-6">
            <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">High-Security Shipping Guidelines</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
              <div className="p-4 bg-luxury-slate/20 border border-luxury-gold-900/5 rounded-sm">
                <Package className="h-4 w-4 text-luxury-gold-500 mb-2" />
                <span className="font-bold text-white uppercase block mb-1">Discrete Packaging</span>
                <p className="text-luxury-gold-100/55">
                  Orders are shipped inside unbranded outer packaging containing secure double-box barriers. There is no mention of "jewelry" or "diamonds" on outer labels for security.
                </p>
              </div>

              <div className="p-4 bg-luxury-slate/20 border border-luxury-gold-900/5 rounded-sm">
                <Award className="h-4 w-4 text-luxury-gold-500 mb-2" />
                <span className="font-bold text-white uppercase block mb-1">Adult Signature Required</span>
                <p className="text-luxury-gold-100/55">
                  All deliveries require a physical signature by an adult (18+) showing valid government photo ID. Couriers are prohibited from leaving packages unattended or releasing without validation.
                </p>
              </div>

              <div className="p-4 bg-luxury-slate/20 border border-luxury-gold-900/5 rounded-sm">
                <MapPin className="h-4 w-4 text-luxury-gold-500 mb-2" />
                <span className="font-bold text-white uppercase block mb-1">Hold For Pickup</span>
                <p className="text-luxury-gold-100/55">
                  For enhanced security or surprise proposals, request "Hold for Pickup" at any verified FedEx Ship Center. The package will remain inside the secure facility vault until signature release.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-luxury-slate-dark/50 border border-luxury-gold-900/15 p-4 rounded-sm flex gap-3.5 items-start">
            <CheckCircle className="h-5 w-5 text-luxury-gold-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-luxury-gold-100/40 uppercase leading-relaxed">
              International orders are subject to local customs clearance, import tax duties, and specialized security routing checks depending on the delivery region. Concierges will coordinates customs paperwork.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
