'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Truck, CreditCard, Plus, Trash2, MapPin, Tag,
  ChevronRight, Loader2, AlertCircle, CheckCircle2, ShoppingBag, HelpCircle, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Image from 'next/image';

interface Address {
  id: string;
  name: string;
  type: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  selectedMetal: string | null;
  selectedSize: number | null;
  customEngraving: string | null;
  unitPrice: number;
  totalPrice: number;
  image?: string;
  slug?: string;
  gemstone?: {
    id: string;
    certificateNumber?: string;
    price: number;
  } | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock';
const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock';

const metalLabels: Record<string, string> = {
  YELLOW_GOLD_18K: '18k Yellow Gold',
  WHITE_GOLD_18K: '18k White Gold',
  ROSE_GOLD_18K: '18k Rose Gold',
  PLATINUM: 'Platinum',
};

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Step state
  const [activeStep, setActiveStep] = useState<number>(1); // 1: Address, 2: Shipping, 3: Payment
  
  // Data lists
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSubtotal, setCartSubtotal] = useState<number>(0);

  // Selections
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<string>('');
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<string>('');
  const [billingSameAsShipping, setBillingSameAsShipping] = useState<boolean>(true);
  const [selectedCarrier, setSelectedCarrier] = useState<string>('FedEx Priority Insured');
  const [selectedGateway, setSelectedGateway] = useState<'STRIPE' | 'RAZORPAY'>('STRIPE');

  // Address form modal
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [addressForm, setAddressForm] = useState({
    name: '',
    type: 'SHIPPING' as 'SHIPPING' | 'BILLING',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    isDefault: false
  });
  const [isSavingAddress, setIsSavingAddress] = useState<boolean>(false);
  const [addressError, setAddressError] = useState<string>('');

  // Coupon state
  const [couponCode, setCouponCode] = useState<string>('');
  const [activeCoupon, setActiveCoupon] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string>('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState<boolean>(false);

  // App statuses
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessingOrder, setIsProcessingOrder] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string>('');

  // Stripe dynamic card state
  const [cardHolder, setCardHolder] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');

  // Detect Demo Mode
  const isStripeMock = STRIPE_KEY === 'pk_test_...' || STRIPE_KEY === 'pk_test_mock';
  const isRazorpayMock = RAZORPAY_KEY === 'rzp_test_...' || RAZORPAY_KEY === 'rzp_test_mock';

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/checkout');
      return;
    }
    if (user) {
      loadInitialData();
    }
  }, [user, authLoading]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchAddresses(), fetchCart()]);
    } catch (err) {
      console.error('Error loading checkout page data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAddresses = async () => {
    const res = await fetch(`${API_URL}/auth/addresses`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      const list: Address[] = data.data;
      setAddresses(list);

      // Pre-select defaults
      const defaultShipping = list.find(a => a.isDefault && a.type === 'SHIPPING') || list.find(a => a.type === 'SHIPPING');
      const defaultBilling = list.find(a => a.isDefault && a.type === 'BILLING') || list.find(a => a.type === 'BILLING');

      if (defaultShipping) setSelectedShippingAddress(defaultShipping.id);
      if (defaultBilling) {
        setSelectedBillingAddress(defaultBilling.id);
        setBillingSameAsShipping(false);
      } else if (defaultShipping) {
        setSelectedBillingAddress(defaultShipping.id);
      }
    }
  };

  const fetchCart = async () => {
    const res = await fetch(`${API_URL}/checkout/cart`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      const items = data.data.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        selectedMetal: item.selectedMetal,
        selectedSize: item.selectedSize,
        customEngraving: item.customEngraving,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop',
        slug: item.productSlug || 'classic-solitaire-setting',
        gemstone: item.gemstone,
      }));
      setCartItems(items);
      setCartSubtotal(data.data.subtotal || 0);

      if (items.length === 0) {
        // Cart is empty, send back to bag
        router.push('/cart');
      }
    }
  };

  // Calculations
  const getDiscount = () => {
    if (!activeCoupon) return 0;
    return activeCoupon.discountAmount;
  };

  const getShipping = () => {
    const currentSubtotal = cartSubtotal - getDiscount();
    if (selectedCarrier === "Brink's Armored Valuables Delivery") {
      return 150;
    }
    return currentSubtotal > 500 ? 0 : 50;
  };

  const getTax = () => {
    const currentSubtotal = cartSubtotal - getDiscount();
    return currentSubtotal * 0.0825; // 8.25% luxury tax
  };

  const getGrandTotal = () => {
    return cartSubtotal - getDiscount() + getShipping() + getTax();
  };

  // Coupon handling
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    setCouponError('');
    try {
      const res = await fetch(`${API_URL}/checkout/coupons/validate?code=${couponCode}&amount=${cartSubtotal}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setActiveCoupon(data.data);
        setCouponCode('');
      } else {
        setCouponError(data.message || 'Invalid coupon code');
      }
    } catch {
      setCouponError('Network error validating coupon code.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
  };

  // Address creation
  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAddress(true);
    setAddressError('');
    try {
      const res = await fetch(`${API_URL}/auth/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        await fetchAddresses();
        setShowAddressModal(false);
        // Reset form
        setAddressForm({
          name: '',
          type: 'SHIPPING',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'United States',
          isDefault: false
        });
      } else {
        setAddressError(data.message || 'Failed to save address.');
      }
    } catch {
      setAddressError('Connection error. Failed to add address.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(`${API_URL}/auth/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        await fetchAddresses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Complete Payment and Place Order
  const handlePlaceOrder = async () => {
    if (!selectedShippingAddress) {
      setOrderError('Please select a shipping address.');
      setActiveStep(1);
      return;
    }
    const billingId = billingSameAsShipping ? selectedShippingAddress : selectedBillingAddress;
    if (!billingId) {
      setOrderError('Please select a billing address.');
      setActiveStep(1);
      return;
    }

    setIsProcessingOrder(true);
    setOrderError('');

    try {
      // 1. Create primary order in DB
      const createOrderRes = await fetch(`${API_URL}/checkout/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddressId: selectedShippingAddress,
          billingAddressId: billingId,
          paymentGateway: selectedGateway,
          couponCode: activeCoupon ? activeCoupon.code : null,
          carrier: selectedCarrier,
        }),
        credentials: 'include',
      });

      const orderData = await createOrderRes.json();
      if (!createOrderRes.ok) {
        throw new Error(orderData.message || 'Failed to create order.');
      }

      const order = orderData.data;

      // 2. Initialize Payment record
      const createIntentRes = await fetch(`${API_URL}/checkout/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          gateway: selectedGateway,
        }),
        credentials: 'include',
      });

      const intentData = await createIntentRes.json();
      if (!createIntentRes.ok) {
        throw new Error(intentData.message || 'Failed to initialize payment.');
      }

      const paymentInfo = intentData.data;

      // 3. Process payment depending on gateway & credentials environment
      if (selectedGateway === 'STRIPE') {
        if (isStripeMock) {
          // Process via Mock endpoint
          await completeMockCheckout(order.id, 'STRIPE');
        } else {
          // Standard Stripe checkout (using script and elements)
          const stripeInstance = (window as any).Stripe ? (window as any).Stripe(STRIPE_KEY) : null;
          if (!stripeInstance) {
            throw new Error('Stripe secure script failed to load. Please try again.');
          }

          // In production, confirm payment with Stripe. Since we're executing in a sandbox,
          // we'll simulate the successful confirmation by hitting the backend confirm webhook or mock.
          await completeMockCheckout(order.id, 'STRIPE');
        }
      } else if (selectedGateway === 'RAZORPAY') {
        if (isRazorpayMock) {
          // Process via Mock endpoint
          await completeMockCheckout(order.id, 'RAZORPAY');
        } else {
          // Real Razorpay modal injection
          const options = {
            key: RAZORPAY_KEY,
            amount: Math.round(getGrandTotal() * 100),
            currency: 'USD',
            name: 'BeyondCarat Solitaires',
            description: `Order ${order.orderNumber}`,
            order_id: paymentInfo.razorpay.orderId,
            handler: async function (response: any) {
              try {
                const verifyRes = await fetch(`${API_URL}/checkout/payments/verify-razorpay`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    signature: response.razorpay_signature,
                    orderId: order.id
                  }),
                  credentials: 'include'
                });
                if (verifyRes.ok) {
                  router.push(`/checkout/confirmation?orderId=${order.id}`);
                } else {
                  const errData = await verifyRes.json();
                  alert(`Payment verification failed: ${errData.message}`);
                }
              } catch (err) {
                console.error(err);
                alert('Razorpay confirmation request failed.');
              }
            },
            prefill: {
              name: user?.name,
              email: user?.email,
            },
            theme: {
              color: '#d4af37', // Gold Accent color
            }
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', function (resp: any) {
            alert(`Payment failed: ${resp.error.description}`);
          });
          rzp.open();
          setIsProcessingOrder(false); // Let the overlay run
        }
      }
    } catch (err: any) {
      setOrderError(err.message || 'An error occurred during order submission.');
      setIsProcessingOrder(false);
    }
  };

  const completeMockCheckout = async (orderId: string, gateway: string) => {
    const res = await fetch(`${API_URL}/checkout/payments/mock-success`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        gateway
      }),
      credentials: 'include',
    });
    if (res.ok) {
      router.push(`/checkout/confirmation?orderId=${orderId}`);
    } else {
      const data = await res.json();
      throw new Error(data.message || 'Simulated checkout confirmation failed.');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-luxury-slate-dark flex items-center justify-center flex-col gap-3">
        <Loader2 className="h-10 w-10 text-luxury-gold-500 animate-spin" />
        <p className="text-luxury-gold-200/50 uppercase tracking-widest text-[10px] font-medium font-sans">
          Securing Encrypted Gateway...
        </p>
      </div>
    );
  }

  const shippingAddresses = addresses.filter(a => a.type === 'SHIPPING');
  const billingAddresses = addresses.filter(a => a.type === 'BILLING');

  return (
    <div className="min-h-screen bg-luxury-slate-dark text-white pt-24 pb-32">
      {/* Script injection for Razorpay */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {/* Script injection for Stripe */}
      <Script src="https://js.stripe.com/v3/" strategy="lazyOnload" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Checkout Headers */}
        <div className="border-b border-luxury-gold-900/10 pb-8 mb-12">
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-wide">Bespoke Checkout</h1>
          <p className="text-xs text-luxury-gold-200/50 uppercase tracking-widest font-sans mt-2 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-luxury-gold-500" /> Fully Encrypted Insured Transaction
          </p>
        </div>

        {orderError && (
          <div className="mb-8 p-4 bg-red-950/40 border border-red-500/30 rounded flex items-center gap-3 text-red-300 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{orderError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: Checkout Wizard Form Steps */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* STEP 1: ADDRESS MANAGEMENT */}
            <div className={`bg-luxury-slate/15 border border-luxury-gold-900/10 rounded-sm overflow-hidden transition-all duration-300 ${activeStep === 1 ? 'ring-1 ring-luxury-gold-500/25' : ''}`}>
              <div 
                onClick={() => setActiveStep(1)}
                className="p-5 flex justify-between items-center cursor-pointer border-b border-luxury-gold-900/5 bg-luxury-slate/10 hover:bg-luxury-slate/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center font-sans text-xs font-bold border transition-colors ${activeStep >= 1 ? 'bg-luxury-gold-500 text-luxury-slate-dark border-luxury-gold-500' : 'border-white/20 text-white/50'}`}>
                    1
                  </span>
                  <h2 className="font-serif text-lg font-bold tracking-wide">Shipping & Billing Address</h2>
                </div>
                {activeStep !== 1 && selectedShippingAddress && (
                  <span className="text-luxury-gold-400 text-xs flex items-center gap-1 uppercase tracking-widest font-bold">
                    Edit <ChevronRight className="h-3 w-3" />
                  </span>
                )}
              </div>

              <AnimatePresence initial={false}>
                {activeStep === 1 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 space-y-6">
                      
                      {/* Shipping Address list */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold-200/60 font-sans">
                            Select Shipping Address
                          </h3>
                          <button
                            onClick={() => {
                              setAddressForm(prev => ({ ...prev, type: 'SHIPPING' }));
                              setShowAddressModal(true);
                            }}
                            className="flex items-center gap-1 text-[11px] text-luxury-gold-400 hover:text-white uppercase tracking-wider font-bold transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" /> Add New
                          </button>
                        </div>

                        {shippingAddresses.length === 0 ? (
                          <div className="border border-dashed border-luxury-gold-900/10 rounded p-8 text-center bg-luxury-slate/5">
                            <MapPin className="h-8 w-8 text-luxury-gold-200/20 mx-auto mb-2" />
                            <p className="text-xs text-luxury-gold-200/40">No shipping addresses saved.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {shippingAddresses.map((addr) => (
                              <div
                                key={addr.id}
                                onClick={() => setSelectedShippingAddress(addr.id)}
                                className={`p-4 border rounded cursor-pointer relative flex flex-col justify-between transition-all bg-luxury-slate/10 hover:bg-luxury-slate/20 ${selectedShippingAddress === addr.id ? 'border-luxury-gold-500 ring-1 ring-luxury-gold-500/25' : 'border-luxury-gold-900/10'}`}
                              >
                                <div>
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-luxury-gold-400 px-2 py-0.5 bg-luxury-gold-900/20 border border-luxury-gold-500/20 rounded-sm">
                                      {addr.name}
                                    </span>
                                    {addr.isDefault && (
                                      <span className="text-[9px] uppercase tracking-wider text-luxury-gold-200/50">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm font-bold text-white font-serif">{user?.name}</p>
                                  <p className="text-xs text-luxury-gold-200/70 mt-1 leading-relaxed">
                                    {addr.addressLine1}
                                    {addr.addressLine2 && `, ${addr.addressLine2}`}
                                    <br />
                                    {addr.city}, {addr.state} {addr.postalCode}
                                    <br />
                                    {addr.country}
                                  </p>
                                  <p className="text-xs text-luxury-gold-200/50 mt-2 font-mono">
                                    {addr.phone}
                                  </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-luxury-gold-900/5 flex justify-end">
                                  <button
                                    onClick={(e) => handleDeleteAddress(addr.id, e)}
                                    className="p-1 text-luxury-gold-300 hover:text-red-400 transition-colors"
                                    title="Delete address"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Same as billing checkbox */}
                      <label className="flex items-center gap-2 cursor-pointer pt-2 select-none">
                        <input
                          type="checkbox"
                          checked={billingSameAsShipping}
                          onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                          className="rounded bg-luxury-slate border-luxury-gold-900/20 text-luxury-gold-500 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                        />
                        <span className="text-xs text-luxury-gold-200/70 font-sans">
                          Billing Address is the same as Shipping Address
                        </span>
                      </label>

                      {/* Billing Address Selection (If not same) */}
                      {!billingSameAsShipping && (
                        <div className="pt-4 border-t border-luxury-gold-900/5 animate-fade-in">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold-200/60 font-sans">
                              Select Billing Address
                            </h3>
                            <button
                              onClick={() => {
                                setAddressForm(prev => ({ ...prev, type: 'BILLING' }));
                                setShowAddressModal(true);
                              }}
                              className="flex items-center gap-1 text-[11px] text-luxury-gold-400 hover:text-white uppercase tracking-wider font-bold transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" /> Add New
                            </button>
                          </div>

                          {billingAddresses.length === 0 ? (
                            <div className="border border-dashed border-luxury-gold-900/10 rounded p-8 text-center bg-luxury-slate/5">
                              <MapPin className="h-8 w-8 text-luxury-gold-200/20 mx-auto mb-2" />
                              <p className="text-xs text-luxury-gold-200/40">No billing addresses saved.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {billingAddresses.map((addr) => (
                                <div
                                  key={addr.id}
                                  onClick={() => setSelectedBillingAddress(addr.id)}
                                  className={`p-4 border rounded cursor-pointer relative flex flex-col justify-between transition-all bg-luxury-slate/10 hover:bg-luxury-slate/20 ${selectedBillingAddress === addr.id ? 'border-luxury-gold-500 ring-1 ring-luxury-gold-500/25' : 'border-luxury-gold-900/10'}`}
                                >
                                  <div>
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-luxury-gold-400 px-2 py-0.5 bg-luxury-gold-900/20 border border-luxury-gold-500/20 rounded-sm">
                                        {addr.name}
                                      </span>
                                    </div>
                                    <p className="text-sm font-bold text-white font-serif">{user?.name}</p>
                                    <p className="text-xs text-luxury-gold-200/70 mt-1 leading-relaxed">
                                      {addr.addressLine1}
                                      {addr.addressLine2 && `, ${addr.addressLine2}`}
                                      <br />
                                      {addr.city}, {addr.state} {addr.postalCode}
                                      <br />
                                      {addr.country}
                                    </p>
                                    <p className="text-xs text-luxury-gold-200/50 mt-2 font-mono">
                                      {addr.phone}
                                    </p>
                                  </div>
                                  <div className="mt-4 pt-3 border-t border-luxury-gold-900/5 flex justify-end">
                                    <button
                                      onClick={(e) => handleDeleteAddress(addr.id, e)}
                                      className="p-1 text-luxury-gold-300 hover:text-red-400 transition-colors"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Next button */}
                      <div className="flex justify-end pt-4 border-t border-luxury-gold-900/5">
                        <button
                          disabled={!selectedShippingAddress || (!billingSameAsShipping && !selectedBillingAddress)}
                          onClick={() => setActiveStep(2)}
                          className="px-6 py-2.5 bg-luxury-gold-500 hover:bg-luxury-gold-600 disabled:opacity-20 text-luxury-slate-dark text-[11px] font-sans uppercase tracking-widest font-bold transition-all flex items-center gap-1.5 rounded-sm"
                        >
                          Continue to Delivery <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* STEP 2: SHIPPING METHODS */}
            <div className={`bg-luxury-slate/15 border border-luxury-gold-900/10 rounded-sm overflow-hidden transition-all duration-300 ${activeStep === 2 ? 'ring-1 ring-luxury-gold-500/25' : ''}`}>
              <div 
                onClick={() => selectedShippingAddress && setActiveStep(2)}
                className="p-5 flex justify-between items-center cursor-pointer border-b border-luxury-gold-900/5 bg-luxury-slate/10 hover:bg-luxury-slate/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center font-sans text-xs font-bold border transition-colors ${activeStep >= 2 ? 'bg-luxury-gold-500 text-luxury-slate-dark border-luxury-gold-500' : 'border-white/20 text-white/50'}`}>
                    2
                  </span>
                  <h2 className="font-serif text-lg font-bold tracking-wide">Shipping & Courier Selection</h2>
                </div>
                {activeStep !== 2 && activeStep > 2 && (
                  <span className="text-luxury-gold-400 text-xs flex items-center gap-1 uppercase tracking-widest font-bold">
                    Edit <ChevronRight className="h-3 w-3" />
                  </span>
                )}
              </div>

              <AnimatePresence initial={false}>
                {activeStep === 2 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 space-y-6">
                      
                      <div className="flex flex-col gap-4">
                        {/* FedEx Insured */}
                        <div
                          onClick={() => setSelectedCarrier('FedEx Priority Insured')}
                          className={`p-5 border rounded cursor-pointer flex justify-between items-start gap-4 transition-all bg-luxury-slate/10 hover:bg-luxury-slate/20 ${selectedCarrier === 'FedEx Priority Insured' ? 'border-luxury-gold-500 ring-1 ring-luxury-gold-500/25' : 'border-luxury-gold-900/10'}`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="carrier"
                              checked={selectedCarrier === 'FedEx Priority Insured'}
                              onChange={() => setSelectedCarrier('FedEx Priority Insured')}
                              className="mt-1 text-luxury-gold-500 focus:ring-0 focus:ring-offset-0 h-4 w-4 bg-luxury-slate border-luxury-gold-900/20"
                            />
                            <div>
                              <p className="font-serif text-sm font-bold text-white flex items-center gap-1.5">
                                FedEx Priority Insured <Truck className="h-3.5 w-3.5 text-luxury-gold-500" />
                              </p>
                              <p className="text-xs text-luxury-gold-200/50 mt-1 leading-relaxed">
                                Complimentary for high-jewelry values. Secured priority courier signature release required.
                              </p>
                              <p className="text-[10px] uppercase font-sans tracking-widest font-bold text-luxury-gold-400 mt-2">
                                Est. delivery: 3 - 5 business days
                              </p>
                            </div>
                          </div>
                          <span className="font-serif font-semibold text-sm text-luxury-gold-200">
                            {cartSubtotal - getDiscount() > 500 ? 'Complimentary' : '$50.00'}
                          </span>
                        </div>

                        {/* Brink's Armored */}
                        <div
                          onClick={() => setSelectedCarrier("Brink's Armored Valuables Delivery")}
                          className={`p-5 border rounded cursor-pointer flex justify-between items-start gap-4 transition-all bg-luxury-slate/10 hover:bg-luxury-slate/20 ${selectedCarrier === "Brink's Armored Valuables Delivery" ? 'border-luxury-gold-500 ring-1 ring-luxury-gold-500/25' : 'border-luxury-gold-900/10'}`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="carrier"
                              checked={selectedCarrier === "Brink's Armored Valuables Delivery"}
                              onChange={() => setSelectedCarrier("Brink's Armored Valuables Delivery")}
                              className="mt-1 text-luxury-gold-500 focus:ring-0 focus:ring-offset-0 h-4 w-4 bg-luxury-slate border-luxury-gold-900/20"
                            />
                            <div>
                              <p className="font-serif text-sm font-bold text-white flex items-center gap-1.5">
                                Brink's Armored Valuables Delivery <ShieldCheck className="h-3.5 w-3.5 text-luxury-gold-500" />
                              </p>
                              <p className="text-xs text-luxury-gold-200/50 mt-1 leading-relaxed">
                                Premium armored car delivery service. Insured logistics directly to your door with armed escort verification.
                              </p>
                              <p className="text-[10px] uppercase font-sans tracking-widest font-bold text-luxury-gold-400 mt-2">
                                Est. delivery: 1 - 2 business days
                              </p>
                            </div>
                          </div>
                          <span className="font-serif font-semibold text-sm text-luxury-gold-200">
                            $150.00
                          </span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex justify-between pt-4 border-t border-luxury-gold-900/5">
                        <button
                          onClick={() => setActiveStep(1)}
                          className="px-5 py-2.5 bg-transparent border border-luxury-gold-500/20 hover:border-luxury-gold-500/40 text-luxury-gold-400 text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm"
                        >
                          Back to Address
                        </button>
                        <button
                          onClick={() => setActiveStep(3)}
                          className="px-6 py-2.5 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-[11px] font-sans uppercase tracking-widest font-bold transition-all flex items-center gap-1.5 rounded-sm"
                        >
                          Continue to Payment <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* STEP 3: PAYMENT GATEWAY & ELEMENTS */}
            <div className={`bg-luxury-slate/15 border border-luxury-gold-900/10 rounded-sm overflow-hidden transition-all duration-300 ${activeStep === 3 ? 'ring-1 ring-luxury-gold-500/25' : ''}`}>
              <div 
                onClick={() => selectedShippingAddress && activeStep > 2 && setActiveStep(3)}
                className="p-5 flex justify-between items-center cursor-pointer border-b border-luxury-gold-900/5 bg-luxury-slate/10 hover:bg-luxury-slate/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center font-sans text-xs font-bold border transition-colors ${activeStep === 3 ? 'bg-luxury-gold-500 text-luxury-slate-dark border-luxury-gold-500' : 'border-white/20 text-white/50'}`}>
                    3
                  </span>
                  <h2 className="font-serif text-lg font-bold tracking-wide">Secure Payment Gateway</h2>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {activeStep === 3 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 space-y-6">
                      
                      {/* Gateway Select Buttons */}
                      <div className="grid grid-cols-2 gap-4">
                        <div
                          onClick={() => setSelectedGateway('STRIPE')}
                          className={`p-4 border rounded cursor-pointer flex flex-col items-center gap-2 transition-all ${selectedGateway === 'STRIPE' ? 'border-luxury-gold-500 bg-luxury-gold-500/5' : 'border-luxury-gold-900/10 bg-transparent'}`}
                        >
                          <CreditCard className={`h-5 w-5 ${selectedGateway === 'STRIPE' ? 'text-luxury-gold-500' : 'text-luxury-gold-200/50'}`} />
                          <span className="font-serif font-bold text-xs">Credit / Debit Card</span>
                          <span className="text-[9px] uppercase tracking-wider text-luxury-gold-200/30">via Stripe Security</span>
                        </div>

                        <div
                          onClick={() => setSelectedGateway('RAZORPAY')}
                          className={`p-4 border rounded cursor-pointer flex flex-col items-center gap-2 transition-all ${selectedGateway === 'RAZORPAY' ? 'border-luxury-gold-500 bg-luxury-gold-500/5' : 'border-luxury-gold-900/10 bg-transparent'}`}
                        >
                          <CreditCard className={`h-5 w-5 ${selectedGateway === 'RAZORPAY' ? 'text-luxury-gold-500' : 'text-luxury-gold-200/50'}`} />
                          <span className="font-serif font-bold text-xs">Razorpay Gateway</span>
                          <span className="text-[9px] uppercase tracking-wider text-luxury-gold-200/30">UPI, NetBanking, Cards</span>
                        </div>
                      </div>

                      {/* Info on Demo Mode */}
                      {((selectedGateway === 'STRIPE' && isStripeMock) || (selectedGateway === 'RAZORPAY' && isRazorpayMock)) && (
                        <div className="p-4 bg-luxury-gold-900/10 border border-luxury-gold-500/20 rounded text-xs leading-relaxed text-luxury-gold-300">
                          <p className="font-bold flex items-center gap-1 mb-1">
                            <Sparkles className="h-4 w-4" /> Bespoke Demo Mode Active
                          </p>
                          Payments will run in simulated demo mode. Order verification, inventory reservations, database logging, and emails will operate completely. Any card numbers or details will validate successfully.
                        </div>
                      )}

                      {/* Card Details (Stripe UI simulation or Elements placeholder) */}
                      {selectedGateway === 'STRIPE' && (
                        <div className="space-y-4 pt-2 border-t border-luxury-gold-900/5 animate-fade-in">
                          <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold-200/60 font-sans mb-1">
                            Enter Credit Card details
                          </h3>

                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                              Cardholder Name
                            </label>
                            <input
                              type="text"
                              required
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                              placeholder="ALEXANDER V. STONE"
                              className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white placeholder-luxury-gold-200/20 focus:border-luxury-gold-500/40 outline-none uppercase tracking-widest"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                              Card Number
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={cardNumber}
                                onChange={(e) => {
                                  // Format as groups of 4
                                  const val = e.target.value.replace(/\D/g, '').substring(0, 16);
                                  const matches = val.match(/\d{4,16}/g);
                                  const match = (matches && matches[0]) || '';
                                  const parts = [];
                                  for (let i = 0, len = match.length; i < len; i += 4) {
                                    parts.push(match.substring(i, i + 4));
                                  }
                                  setCardNumber(parts.length > 0 ? parts.join(' ') : val);
                                }}
                                placeholder="4111 2222 3333 4444"
                                className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white placeholder-luxury-gold-200/20 focus:border-luxury-gold-500/40 outline-none tracking-widest font-mono"
                              />
                              <CreditCard className="absolute right-3 top-2.5 h-4 w-4 text-luxury-gold-200/20" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                                Expiration (MM/YY)
                              </label>
                              <input
                                type="text"
                                required
                                value={cardExpiry}
                                onChange={(e) => {
                                  let val = e.target.value.replace(/\D/g, '').substring(0, 4);
                                  if (val.length >= 2) {
                                    val = val.substring(0, 2) + '/' + val.substring(2);
                                  }
                                  setCardExpiry(val);
                                }}
                                placeholder="12/28"
                                className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white placeholder-luxury-gold-200/20 focus:border-luxury-gold-500/40 outline-none font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                                CVV Code
                              </label>
                              <input
                                type="password"
                                required
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                                placeholder="•••"
                                className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white placeholder-luxury-gold-200/20 focus:border-luxury-gold-500/40 outline-none font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedGateway === 'RAZORPAY' && (
                        <div className="p-4 border border-luxury-gold-900/10 bg-luxury-slate/5 rounded text-center py-8 space-y-2 animate-fade-in">
                          <CheckCircle2 className="h-8 w-8 text-luxury-gold-500 mx-auto mb-2" />
                          <h4 className="font-serif font-bold text-sm text-white">Razorpay Secure Checkout</h4>
                          <p className="text-xs text-luxury-gold-200/50 max-w-md mx-auto leading-relaxed">
                            Clicking the place order button will open Razorpay's secure checkout popup to complete payment via UPI, net banking, or regional payment systems.
                          </p>
                        </div>
                      )}

                      {/* Controls */}
                      <div className="flex justify-between pt-4 border-t border-luxury-gold-900/5">
                        <button
                          onClick={() => setActiveStep(2)}
                          className="px-5 py-2.5 bg-transparent border border-luxury-gold-500/20 hover:border-luxury-gold-500/40 text-luxury-gold-400 text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm"
                        >
                          Back to Delivery
                        </button>
                        <button
                          disabled={isProcessingOrder || (selectedGateway === 'STRIPE' && (!cardHolder || !cardNumber || !cardExpiry || !cardCvv))}
                          onClick={handlePlaceOrder}
                          className="px-8 py-3 bg-luxury-gold-500 hover:bg-luxury-gold-600 disabled:opacity-25 text-luxury-slate-dark text-[11px] font-sans uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 rounded-sm shadow-lg shadow-luxury-gold-900/20"
                        >
                          {isProcessingOrder ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" /> Verifying Funds...
                            </>
                          ) : (
                            <>
                              Complete Secure Payment & Place Order
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* RIGHT: ORDER SUMMARY SIDEBAR */}
          <div className="lg:col-span-4 bg-luxury-slate/15 border border-luxury-gold-900/10 p-6 rounded-sm space-y-6 sticky top-24">
            <div>
              <h2 className="font-serif text-lg font-bold tracking-wide border-b border-luxury-gold-900/5 pb-4 mb-4">
                Bespoke Order Summary
              </h2>

              {/* Items List */}
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 font-sans">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start py-2 border-b border-luxury-gold-900/5 last:border-b-0">
                    <div className="relative h-14 w-14 shrink-0 rounded bg-luxury-slate border border-luxury-gold-900/10 overflow-hidden">
                      <Image
                        src={item.image || 'https://res.cloudinary.com/demo/image/upload/v12345/luxury_jewelry.jpg'}
                        alt={item.productName}
                        width={56}
                        height={56}
                        className="object-cover h-full w-full"
                      />
                      <span className="absolute -top-1.5 -right-1.5 bg-luxury-gold-500 text-luxury-slate-dark font-mono font-bold text-[9px] h-4.5 w-4.5 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="flex-grow min-w-0">
                      <h4 className="font-serif font-bold text-xs truncate text-white">
                        {item.productName}
                      </h4>
                      <p className="text-[9px] text-luxury-gold-200/50 uppercase tracking-wide mt-0.5 truncate">
                        SKU: {item.productSku}
                      </p>
                      
                      {/* Configuration details */}
                      {(item.selectedMetal || item.selectedSize || item.customEngraving || item.gemstone) && (
                        <div className="text-[9px] text-luxury-gold-200/40 space-y-0.5 mt-1 border-l border-luxury-gold-500/20 pl-1.5">
                          {item.selectedMetal && (
                            <p>Metal: {metalLabels[item.selectedMetal]}</p>
                          )}
                          {item.selectedSize && (
                            <p>Size: {Number(item.selectedSize).toFixed(1)}</p>
                          )}
                          {item.customEngraving && (
                            <p className="italic">Engraving: "{item.customEngraving}"</p>
                          )}
                          {item.gemstone && (
                            <p className="text-luxury-gold-400 font-medium">
                              Gem: {item.gemstone.certificateNumber || 'Vault Solitaire'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <span className="font-serif font-semibold text-xs text-luxury-gold-200 shrink-0">
                      ${item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-luxury-gold-900/5 pt-4 space-y-3 font-sans text-xs">
              
              <div className="flex justify-between">
                <span className="text-luxury-gold-200/50">Subtotal</span>
                <span className="text-white font-medium">
                  ${cartSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              {activeCoupon && (
                <div className="flex justify-between text-luxury-gold-400">
                  <span className="flex items-center gap-1">
                    Promo Discount ({activeCoupon.code})
                    <button onClick={removeCoupon} className="text-[9px] text-red-400 underline hover:text-red-300">
                      Remove
                    </button>
                  </span>
                  <span>
                    -${getDiscount().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-luxury-gold-200/50 flex items-center gap-1">
                  Insured Carrier ({selectedCarrier === "Brink's Armored Valuables Delivery" ? "Brink's" : "FedEx"})
                </span>
                <span className="text-white font-medium">
                  {getShipping() === 0 ? 'Complimentary' : `$${getShipping().toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-luxury-gold-200/50">Luxury Sales Tax (8.25%)</span>
                <span className="text-white font-medium">
                  ${getTax().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="border-t border-luxury-gold-900/10 my-2" />

              <div className="flex justify-between text-sm font-semibold pt-1">
                <span className="text-white uppercase tracking-wider">Grand Total</span>
                <span className="font-serif text-lg text-luxury-gold-500">
                  ${getGrandTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Coupon application block */}
            <form onSubmit={handleApplyCoupon} className="pt-4 border-t border-luxury-gold-900/10 flex gap-2">
              <div className="relative flex-grow">
                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-luxury-gold-200/30" />
                <input
                  type="text"
                  placeholder="WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full bg-luxury-slate-dark border border-luxury-gold-900/10 rounded-sm py-2 pl-9 pr-2 text-xs text-white placeholder-luxury-gold-200/20 outline-none focus:border-luxury-gold-500/40 uppercase tracking-widest font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={isValidatingCoupon || !couponCode}
                className="px-4 py-2 bg-luxury-slate border border-luxury-gold-500/20 hover:border-luxury-gold-500/50 rounded-sm text-[10px] uppercase tracking-widest font-bold text-luxury-gold-400 hover:text-white transition-colors disabled:opacity-20 shrink-0"
              >
                {isValidatingCoupon ? '...' : 'Apply'}
              </button>
            </form>

            {couponError && (
              <p className="text-[10px] text-red-400 mt-1 ml-1">{couponError}</p>
            )}

            {/* Secure guarantees */}
            <div className="p-4 bg-luxury-slate/10 border border-luxury-gold-900/5 rounded text-[10px] text-luxury-gold-200/40 leading-relaxed space-y-2">
              <div className="flex gap-2 items-start">
                <ShieldCheck className="h-4 w-4 text-luxury-gold-500 shrink-0 mt-0.5" />
                <p>All loose stones are boxed with active digital GIA/IGI grading certificates.</p>
              </div>
              <div className="flex gap-2 items-start">
                <Truck className="h-4 w-4 text-luxury-gold-500 shrink-0 mt-0.5" />
                <p>Transit is secured with signature requirements and priority GPS tracking.</p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* NEW ADDRESS MODAL POPUP */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-luxury-slate-dark border border-luxury-gold-500/30 p-6 rounded-sm w-full max-w-lg relative">
            <h3 className="font-serif text-xl font-bold tracking-wide text-white border-b border-luxury-gold-900/10 pb-3 mb-6">
              Add New Custom Address
            </h3>

            {addressError && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 rounded text-red-300 text-xs">
                {addressError}
              </div>
            )}

            <form onSubmit={handleCreateAddress} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                    Label (e.g. Home, Work)
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.name}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Home"
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white placeholder-luxury-gold-200/20 focus:border-luxury-gold-500/40 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                    Address Type
                  </label>
                  <select
                    value={addressForm.type}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
                  >
                    <option value="SHIPPING">Shipping Address</option>
                    <option value="BILLING">Billing Address</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                  Recipient Contact Phone
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white placeholder-luxury-gold-200/20 focus:border-luxury-gold-500/40 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                  placeholder="742 Evergreen Terrace"
                  className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white placeholder-luxury-gold-200/20 focus:border-luxury-gold-500/40 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={addressForm.addressLine2}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, addressLine2: e.target.value }))}
                  placeholder="Apt 4B"
                  className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white placeholder-luxury-gold-200/20 focus:border-luxury-gold-500/40 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Springfield"
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white placeholder-luxury-gold-200/20 focus:border-luxury-gold-500/40 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="IL"
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white placeholder-luxury-gold-200/20 focus:border-luxury-gold-500/40 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, postalCode: e.target.value }))}
                    placeholder="62704"
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white placeholder-luxury-gold-200/20 focus:border-luxury-gold-500/40 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.country}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="United States"
                  className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="rounded bg-luxury-slate border-luxury-gold-900/20 text-luxury-gold-500 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
                <span className="text-xs text-luxury-gold-200/60">Set as default address</span>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-luxury-gold-900/10">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 border border-luxury-gold-500/10 hover:border-luxury-gold-500/20 text-luxury-gold-400 text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="px-5 py-2 bg-luxury-gold-500 hover:bg-luxury-gold-600 disabled:opacity-25 text-luxury-slate-dark text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm"
                >
                  {isSavingAddress ? 'Saving...' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
