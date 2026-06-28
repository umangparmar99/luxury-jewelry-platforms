'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Mail, Calendar, MapPin, ExternalLink, Loader2, Home, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface OrderItem {
  id: string;
  productId: string;
  product: {
    name: string;
    sku: string;
  };
  quantity: number;
  price: number;
  selectedMetal: string | null;
  selectedSize: number | null;
  customEngraving: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  taxAmount: number;
  shippingAmount: number;
  shippingAddress: string;
  carrier: string | null;
  createdAt: string;
  items: OrderItem[];
  payment?: {
    gateway: string;
    transactionId: string;
    status: string;
  } | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function ConfirmationPageContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (orderId) {
      fetchOrderDetails();
    } else {
      setError('Missing order identifier parameters.');
      setIsLoading(false);
    }
  }, [orderId, user, authLoading]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/checkout/orders/${orderId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setOrder(data.data);
      } else {
        setError(data.message || 'Failed to retrieve order confirmation details.');
      }
    } catch {
      setError('Connection failure. Could not contact the concierge vault.');
    } finally {
      setIsLoading(false);
    }
  };

  const parseAddress = (addrStr: any) => {
    if (!addrStr) return null;
    if (typeof addrStr === 'string') {
      try {
        return JSON.parse(addrStr);
      } catch {
        return null;
      }
    }
    return addrStr;
  };

  const getEstimatedDelivery = (createdAtStr: string, carrierStr: string | null) => {
    const date = new Date(createdAtStr);
    const offset = carrierStr === "Brink's Armored Valuables Delivery" ? 2 : 5;
    date.setDate(date.getDate() + offset);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-luxury-slate-dark flex items-center justify-center flex-col gap-3">
        <Loader2 className="h-10 w-10 text-luxury-gold-500 animate-spin" />
        <p className="text-luxury-gold-200/50 uppercase tracking-widest text-[10px] font-mono">
          Assembling Appraisal Documents...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-luxury-slate-dark text-white pt-32 pb-24 flex items-center justify-center">
        <div className="max-w-md w-full text-center p-8 border border-red-500/20 bg-red-950/10 rounded-sm">
          <h2 className="font-serif text-2xl font-bold text-red-400 mb-2">Verification Failed</h2>
          <p className="text-xs text-luxury-gold-200/60 leading-relaxed mb-6">{error || 'Order record not found.'}</p>
          <Link href="/catalog" className="px-6 py-2.5 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-xs uppercase tracking-widest font-bold font-sans transition-colors rounded-sm inline-block">
            Return to Vault
          </Link>
        </div>
      </div>
    );
  }

  const shippingAddr = parseAddress(order.shippingAddress);
  const deliveryEst = getEstimatedDelivery(order.createdAt, order.carrier);

  return (
    <div className="min-h-screen bg-luxury-slate-dark text-white pt-28 pb-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Top Success Badge */}
        <div className="text-center space-y-4 mb-12">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="h-20 w-20 bg-luxury-gold-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-luxury-gold-900/10"
          >
            <Check className="h-10 w-10 text-luxury-slate-dark stroke-[3px]" />
          </motion.div>
          
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-sans tracking-[0.25em] font-bold text-luxury-gold-400">
              Acquisition Confirmed
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-wide">
              Thank You For Your Purchase
            </h1>
          </div>
          
          <p className="text-xs text-luxury-gold-200/60 max-w-md mx-auto leading-relaxed">
            Your design configurations have been sent to our master jewelers. A luxury concierge will email verification details shortly.
          </p>
        </div>

        {/* Primary Order Info Card */}
        <div className="bg-luxury-slate/15 border border-luxury-gold-900/10 p-6 rounded-sm space-y-6">
          
          {/* Grid summary fields */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-b border-luxury-gold-900/5 pb-6">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-luxury-gold-200/40 font-sans">Order Number</p>
              <p className="font-mono text-sm font-bold text-luxury-gold-300 mt-1 uppercase">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-luxury-gold-200/40 font-sans">Payment Method</p>
              <p className="font-serif text-sm font-bold text-white mt-1">
                {order.payment?.gateway === 'STRIPE' ? 'Credit Card' : 'Razorpay'}
              </p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-luxury-gold-200/40 font-sans">Order Status</p>
              <p className="font-sans text-[10px] font-bold px-2 py-0.5 rounded-full inline-block bg-luxury-gold-500/10 border border-luxury-gold-500/20 text-luxury-gold-400 mt-1 uppercase tracking-widest">
                {order.payment?.status === 'SUCCESS' ? 'PAID' : 'PROCESSING'}
              </p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-luxury-gold-200/40 font-sans">Acquisition Total</p>
              <p className="font-serif text-sm font-bold text-luxury-gold-500 mt-1">
                ${Number(order.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Delivery & Address Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-luxury-gold-900/5 pb-6">
            
            {/* Delivery Info */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold-200/50 flex items-center gap-1.5 font-sans">
                <Calendar className="h-4 w-4 text-luxury-gold-500" /> Delivery Estimation
              </h3>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white font-serif">{deliveryEst}</p>
                <p className="text-xs text-luxury-gold-200/40 font-sans">
                  Carrier: {order.carrier || 'FedEx Priority Insured'} (Signature Release Required)
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold-200/50 flex items-center gap-1.5 font-sans">
                <MapPin className="h-4 w-4 text-luxury-gold-500" /> Shipping Destination
              </h3>
              {shippingAddr ? (
                <div className="text-xs text-luxury-gold-200/70 leading-relaxed font-sans">
                  <p className="font-bold text-white">{shippingAddr.name} label</p>
                  <p>{shippingAddr.addressLine1}</p>
                  {shippingAddr.addressLine2 && <p>{shippingAddr.addressLine2}</p>}
                  <p>{shippingAddr.city}, {shippingAddr.state} {shippingAddr.postalCode}</p>
                  <p>{shippingAddr.country}</p>
                </div>
              ) : (
                <p className="text-xs text-luxury-gold-200/40">No destination logged.</p>
              )}
            </div>

          </div>

          {/* Items Purchased details */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold-200/50 font-sans">
              Configured Jewelry Itemizations
            </h3>
            
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-xs border-b border-luxury-gold-900/5 pb-3 last:border-b-0 last:pb-0">
                  <div>
                    <h4 className="font-serif font-bold text-white text-sm">{item.product.name}</h4>
                    <p className="text-[9px] font-mono text-luxury-gold-200/40 mt-0.5">SKU: {item.product.sku} | Qty: {item.quantity}</p>
                    
                    {/* Metal, Size, Engraving details */}
                    {(item.selectedMetal || item.selectedSize || item.customEngraving) && (
                      <div className="text-[9px] text-luxury-gold-200/40 mt-1 pl-2 border-l border-luxury-gold-500/20">
                        {item.selectedMetal && <p>Metal: {item.selectedMetal.replace(/_/g, ' ')}</p>}
                        {item.selectedSize && <p>Ring Size: {Number(item.selectedSize).toFixed(1)}</p>}
                        {item.customEngraving && <p className="italic">Engraving: "{item.customEngraving}"</p>}
                      </div>
                    )}
                  </div>
                  <span className="font-serif font-bold text-luxury-gold-200">
                    ${(Number(item.price) * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Assurance & Security */}
          <div className="p-4 bg-luxury-gold-900/5 border border-luxury-gold-500/10 rounded flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-luxury-gold-500 shrink-0 mt-0.5" />
            <div className="text-[10px] text-luxury-gold-200/50 leading-relaxed font-sans">
              <p className="font-bold text-white">Appraisal Document & GIA Vault Authentication</p>
              Your order is fully insured during shipment. The physical GIA/IGI solitaire certification cards, retail appraisal value certificates, and bespoke velvet display cases are packed in anonymous secure vault boxes.
            </div>
          </div>

        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12">
          <Link 
            href="/catalog" 
            className="w-full sm:w-auto px-8 py-3.5 bg-luxury-gold-500 hover:bg-luxury-gold-600 rounded-sm text-luxury-slate-dark text-xs uppercase tracking-widest font-bold transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-luxury-gold-900/10"
          >
            Continue Browsing Solitaires <ArrowRight className="h-4 w-4" />
          </Link>
          
          <Link 
            href="/orders" 
            className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-luxury-gold-500/20 hover:border-luxury-gold-500/40 rounded-sm text-luxury-gold-400 hover:text-white text-xs uppercase tracking-widest font-bold transition-all text-center"
          >
            View Orders In Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-luxury-slate-dark flex items-center justify-center flex-col gap-3">
        <Loader2 className="h-10 w-10 text-luxury-gold-500 animate-spin" />
        <p className="text-luxury-gold-200/50 uppercase tracking-widest text-[10px] font-mono">
          Assembling Appraisal Documents...
        </p>
      </div>
    }>
      <ConfirmationPageContent />
    </Suspense>
  );
}
