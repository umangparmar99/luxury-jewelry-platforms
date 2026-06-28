'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, ShoppingBag, Heart, MapPin, MessageSquare, Key, Settings,
  ShieldCheck, Loader2, Edit3, Plus, Trash2, CheckCircle2, AlertCircle,
  TrendingUp, Calendar, Truck, HelpCircle, ArrowRight, UploadCloud, LogOut, Check,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Image from 'next/image';

// Interfaces
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

interface OrderItem {
  id: string;
  productId: string;
  product: {
    name: string;
    sku: string;
    slug: string;
  };
  quantity: number;
  price: number;
  selectedMetal: string | null;
  selectedSize: number | null;
  customEngraving: string | null;
  selectedGemstoneId?: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  taxAmount: number;
  shippingAmount: number;
  shippingAddress: string;
  billingAddress: string;
  carrier: string | null;
  trackingNumber: string | null;
  createdAt: string;
  items: OrderItem[];
  payment?: {
    gateway: string;
    transactionId: string;
    status: string;
  } | null;
}

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    basePrice: number;
  };
  selectedMetal: string | null;
  selectedSize: number | null;
  createdAt: string;
}

interface Review {
  id: string;
  productId: string;
  product: {
    name: string;
    sku: string;
    slug: string;
  };
  rating: number;
  comment: string | null;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const tabIcons = {
  overview: TrendingUp,
  profile: User,
  orders: ShoppingBag,
  wishlist: Heart,
  addresses: MapPin,
  reviews: MessageSquare,
  security: Key,
};

const metalLabels: Record<string, string> = {
  YELLOW_GOLD_18K: '18k Yellow Gold',
  WHITE_GOLD_18K: '18k White Gold',
  ROSE_GOLD_18K: '18k Rose Gold',
  PLATINUM: 'Platinum',
};

const kycStatusStyles = {
  APPROVED: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  PENDING: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  REJECTED: 'bg-red-500/10 border-red-500/20 text-red-400',
  NONE: 'bg-luxury-gold-900/10 border-luxury-gold-500/20 text-luxury-gold-300',
};

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  // Active sub-view tab
  const [activeTab, setActiveTab] = useState<string>('overview');

  // API Lists
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profileDetails, setProfileDetails] = useState<any>(null);

  // Statuses
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add/Edit Address Form Modal
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
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

  // Profile Edit fields
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editAvatarUrl, setEditAvatarUrl] = useState<string>('');
  const [kycDocUrl, setKycDocUrl] = useState<string>('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);

  // Password fields
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);

  // Review Submissions modal (inside orders tab)
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [reviewForm, setReviewForm] = useState({
    productId: '',
    productName: '',
    rating: 5,
    comment: ''
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  // Tracking details modal
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/dashboard');
      return;
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 5000);
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchProfile(),
        fetchOrders(),
        fetchWishlist(),
        fetchAddresses(),
        fetchReviews(),
      ]);
    } catch (err) {
      console.error(err);
      showMessage('error', 'Error loading account data.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async () => {
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      const profile = data.data;
      setProfileDetails(profile);
      setEditName(profile.name || '');
      setEditPhone(profile.phone || '');
      setEditAvatarUrl(profile.profile?.avatarUrl || '');
    }
  };

  const fetchOrders = async () => {
    const res = await fetch(`${API_URL}/checkout/orders`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      setOrders(data.data || []);
    }
  };

  const fetchWishlist = async () => {
    const res = await fetch(`${API_URL}/checkout/wishlist`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      setWishlist(data.data || []);
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
      setAddresses(data.data || []);
    }
  };

  const fetchReviews = async () => {
    const res = await fetch(`${API_URL}/checkout/reviews/personal`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      setReviews(data.data || []);
    }
  };

  // Profile operations
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          phone: editPhone || null,
          avatarUrl: editAvatarUrl || null
        }),
        credentials: 'include',
      });
      if (res.ok) {
        showMessage('success', 'Profile settings updated successfully.');
        await fetchProfile();
      } else {
        const data = await res.json();
        showMessage('error', data.message || 'Failed to update profile.');
      }
    } catch {
      showMessage('error', 'Network error. Profile update failed.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycDocUrl) return;
    setIsUpdatingProfile(true);
    try {
      const res = await fetch(`${API_URL}/auth/profile/kyc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentUrl: kycDocUrl }),
        credentials: 'include',
      });
      if (res.ok) {
        showMessage('success', 'KYC Document submitted. Verification is now pending.');
        setKycDocUrl('');
        await fetchProfile();
      } else {
        const data = await res.json();
        showMessage('error', data.message || 'KYC submission failed.');
      }
    } catch {
      showMessage('error', 'Network error. KYC submission failed.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Password operations
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
        credentials: 'include',
      });
      if (res.ok) {
        showMessage('success', 'Your password has been changed.');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await res.json();
        showMessage('error', data.message || 'Failed to change password.');
      }
    } catch {
      showMessage('error', 'Network error. Password change failed.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Address CRUD
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAddress(true);
    try {
      const url = editingAddressId
        ? `${API_URL}/auth/addresses/${editingAddressId}`
        : `${API_URL}/auth/addresses`;
      const method = editingAddressId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
        credentials: 'include',
      });

      if (res.ok) {
        showMessage('success', editingAddressId ? 'Address updated.' : 'Address created.');
        setShowAddressModal(false);
        setEditingAddressId(null);
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
        await fetchAddresses();
      } else {
        const data = await res.json();
        showMessage('error', data.message || 'Failed to save address.');
      }
    } catch {
      showMessage('error', 'Failed to submit address.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleEditAddressClick = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      name: addr.name,
      type: addr.type as any,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault
    });
    setShowAddressModal(true);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(`${API_URL}/auth/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        showMessage('success', 'Address deleted successfully.');
        await fetchAddresses();
      }
    } catch {
      showMessage('error', 'Error deleting address.');
    }
  };

  // Wishlist actions
  const handleRemoveFromWishlist = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/checkout/wishlist/items/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        showMessage('success', 'Removed from wishlist.');
        await fetchWishlist();
      }
    } catch {
      showMessage('error', 'Error removing item.');
    }
  };

  const handleMoveToBag = async (item: WishlistItem) => {
    try {
      const res = await fetch(`${API_URL}/checkout/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.productId,
          quantity: 1,
          selectedMetal: item.selectedMetal,
          selectedSize: item.selectedSize
        }),
        credentials: 'include',
      });

      if (res.ok) {
        showMessage('success', 'Design moved to secure shopping bag.');
        await handleRemoveFromWishlist(item.id);
      }
    } catch {
      showMessage('error', 'Error moving item to bag.');
    }
  };

  // Review creation
  const handleOpenReviewModal = (productId: string, productName: string) => {
    setReviewForm({
      productId,
      productName,
      rating: 5,
      comment: ''
    });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`${API_URL}/checkout/products/${reviewForm.productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewForm.rating,
          comment: reviewForm.comment || null
        }),
        credentials: 'include',
      });

      if (res.ok) {
        showMessage('success', 'Your review feedback has been posted.');
        setShowReviewModal(false);
        await fetchReviews();
      } else {
        const data = await res.json();
        showMessage('error', data.message || 'Failed to submit review.');
      }
    } catch {
      showMessage('error', 'Network error. Review failed.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Helper parsers
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

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-luxury-slate-dark flex items-center justify-center flex-col gap-3">
        <Loader2 className="h-10 w-10 text-luxury-gold-500 animate-spin" />
        <p className="text-luxury-gold-200/50 uppercase tracking-widest text-[10px] font-mono">
          Authenticating Vault Access...
        </p>
      </div>
    );
  }

  const defaultShippingAddress = addresses.find(a => a.isDefault && a.type === 'SHIPPING');
  const kycStatus = profileDetails?.profile?.kycStatus || 'NONE';

  return (
    <div className="min-h-screen bg-luxury-slate-dark text-white pt-24 pb-32 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Toast alerts */}
        {actionMessage && (
          <div className={`fixed bottom-5 right-5 z-50 p-4 border rounded shadow-xl flex items-center gap-3 transition-all duration-300 max-w-sm font-sans text-xs ${actionMessage.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300' : 'bg-red-950/90 border-red-500/40 text-red-300'}`}>
            {actionMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" /> : <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />}
            <p>{actionMessage.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-4">
          
          {/* SIDEBAR TABS MENU */}
          <div className="lg:col-span-3 bg-luxury-slate/15 border border-luxury-gold-900/10 p-6 rounded-sm space-y-6">
            
            {/* User Profile summary block */}
            <div className="text-center space-y-3 pb-6 border-b border-luxury-gold-900/10">
              <div className="relative h-20 w-20 rounded-full bg-luxury-slate border border-luxury-gold-500/30 overflow-hidden mx-auto">
                <Image
                  src={profileDetails?.profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop'}
                  alt={profileDetails?.name || 'User Avatar'}
                  width={80}
                  height={80}
                  className="object-cover h-full w-full"
                  priority
                />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-white">{profileDetails?.name}</h3>
                <p className="text-[10px] text-luxury-gold-200/40 truncate mt-0.5">{profileDetails?.email}</p>
              </div>

              {/* KYC Status badge */}
              <div className={`border rounded py-1 px-3 inline-block text-[9px] uppercase tracking-widest font-bold ${kycStatusStyles[kycStatus as keyof typeof kycStatusStyles]}`}>
                KYC Status: {kycStatus}
              </div>
            </div>

            {/* Sidebar navigation list */}
            <nav className="flex flex-col gap-1">
              {Object.keys(tabIcons).map((tab) => {
                const IconComponent = tabIcons[tab as keyof typeof tabIcons];
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setEditingAddressId(null);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-sm text-left transition-all ${isActive ? 'bg-luxury-gold-500 text-luxury-slate-dark font-semibold' : 'text-luxury-gold-200/60 hover:text-white hover:bg-white/5'}`}
                  >
                    <IconComponent className="h-4 w-4 shrink-0" />
                    <span className="text-xs uppercase tracking-widest font-sans font-medium">{tab}</span>
                  </button>
                );
              })}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-sm text-left text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-all mt-4 border-t border-luxury-gold-900/10 pt-4"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span className="text-xs uppercase tracking-widest font-sans font-medium">Log out</span>
              </button>
            </nav>

          </div>

          {/* MAIN PANELS AREA */}
          <div className="lg:col-span-9 bg-luxury-slate/15 border border-luxury-gold-900/10 p-6 rounded-sm min-h-[500px]">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                
                {/* --- 1. OVERVIEW VIEW --- */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="font-serif text-2xl font-bold tracking-wide">Dashboard Overview</h2>
                      <p className="text-xs text-luxury-gold-200/50 uppercase tracking-widest mt-1">
                        Select tabs to manage secure credentials and solitaire orders
                      </p>
                    </div>

                    {/* Overview stat grid cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-luxury-slate/10 border border-luxury-gold-900/5 p-5 rounded-sm">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase font-sans tracking-wider text-luxury-gold-200/40">Total Acquisitions</span>
                          <ShoppingBag className="h-5 w-5 text-luxury-gold-500" />
                        </div>
                        <p className="font-serif text-2xl font-bold text-white mt-2">{orders.length} orders</p>
                        <button onClick={() => setActiveTab('orders')} className="text-[10px] text-luxury-gold-400 hover:text-white uppercase tracking-wider font-bold mt-4 inline-flex items-center gap-1">
                          View details <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="bg-luxury-slate/10 border border-luxury-gold-900/5 p-5 rounded-sm">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase font-sans tracking-wider text-luxury-gold-200/40">Wishlisted Items</span>
                          <Heart className="h-5 w-5 text-luxury-gold-500" />
                        </div>
                        <p className="font-serif text-2xl font-bold text-white mt-2">{wishlist.length} designs</p>
                        <button onClick={() => setActiveTab('wishlist')} className="text-[10px] text-luxury-gold-400 hover:text-white uppercase tracking-wider font-bold mt-4 inline-flex items-center gap-1">
                          View wishlist <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="bg-luxury-slate/10 border border-luxury-gold-900/5 p-5 rounded-sm">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase font-sans tracking-wider text-luxury-gold-200/40">Default Destination</span>
                          <MapPin className="h-5 w-5 text-luxury-gold-500" />
                        </div>
                        <p className="font-serif text-sm font-bold text-white mt-2 truncate">
                          {defaultShippingAddress ? `${defaultShippingAddress.city}, ${defaultShippingAddress.state}` : 'None Set'}
                        </p>
                        <button onClick={() => setActiveTab('addresses')} className="text-[10px] text-luxury-gold-400 hover:text-white uppercase tracking-wider font-bold mt-4 inline-flex items-center gap-1">
                          Manage addresses <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Recent Order Preview */}
                    <div className="bg-luxury-slate/10 border border-luxury-gold-900/5 p-6 rounded-sm">
                      <h3 className="font-serif font-bold text-sm text-white mb-4">Latest Secure Transaction</h3>
                      {orders.length === 0 ? (
                        <p className="text-xs text-luxury-gold-200/40">No orders placed yet.</p>
                      ) : (
                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <p className="font-mono text-luxury-gold-400 uppercase font-bold">{orders[0].orderNumber}</p>
                            <p className="text-luxury-gold-200/50 mt-1">Date: {new Date(orders[0].createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="font-serif font-bold text-white">${Number(orders[0].totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            <p className="text-luxury-gold-400 uppercase tracking-widest font-bold mt-1 text-[9px]">{orders[0].status}</p>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* --- 2. PROFILE EDIT VIEW --- */}
                {activeTab === 'profile' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="font-serif text-2xl font-bold tracking-wide">Profile & Account Settings</h2>
                      <p className="text-xs text-luxury-gold-200/50 uppercase tracking-widest mt-1">
                        Update verification KYC details and profile information
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                      {/* Personal Info Form */}
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold-200/60 font-sans border-b border-luxury-gold-900/5 pb-2 mb-2">
                          Personal Information
                        </h3>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white placeholder-luxury-gold-200/20 focus:border-luxury-gold-500/40 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                            Registered Email
                          </label>
                          <input
                            type="email"
                            disabled
                            value={profileDetails?.email || ''}
                            className="w-full bg-luxury-slate/30 border border-luxury-gold-900/5 rounded-sm py-2 px-3 text-xs text-white/50 outline-none cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                            Contact Phone
                          </label>
                          <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white placeholder-luxury-gold-200/20 focus:border-luxury-gold-500/40 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                            Profile Avatar URL
                          </label>
                          <input
                            type="text"
                            value={editAvatarUrl}
                            onChange={(e) => setEditAvatarUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white placeholder-luxury-gold-200/20 focus:border-luxury-gold-500/40 outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isUpdatingProfile}
                          className="px-6 py-2.5 bg-luxury-gold-500 hover:bg-luxury-gold-600 disabled:opacity-25 text-luxury-slate-dark text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm"
                        >
                          {isUpdatingProfile ? 'Saving...' : 'Save Settings'}
                        </button>
                      </form>

                      {/* KYC Document Submission */}
                      <div className="space-y-4 bg-luxury-slate/5 border border-luxury-gold-900/5 p-6 rounded-sm">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold-200/60 font-sans border-b border-luxury-gold-900/5 pb-2 mb-2">
                          Identity Verification (KYC)
                        </h3>
                        <p className="text-xs text-luxury-gold-200/60 leading-relaxed font-sans">
                          To complete high-value loose gemstone deliveries, luxury safety checks require verified passports or government-issued IDs.
                        </p>

                        {kycStatus === 'APPROVED' ? (
                          <div className="p-4 border border-emerald-500/20 bg-emerald-500/5 rounded flex items-start gap-3">
                            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-sans">
                              Your account is fully verified. Insured high-value releases authorized.
                            </div>
                          </div>
                        ) : kycStatus === 'PENDING' ? (
                          <div className="p-4 border border-yellow-500/20 bg-yellow-500/5 rounded flex items-start gap-3">
                            <Loader2 className="h-5 w-5 text-yellow-400 shrink-0 animate-spin mt-0.5" />
                            <div className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider font-sans">
                              Document check pending. Verification concierge review in progress.
                            </div>
                          </div>
                        ) : (
                          <form onSubmit={handleSubmitKyc} className="space-y-4">
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                                Verification ID Document URL
                              </label>
                              <input
                                type="text"
                                required
                                value={kycDocUrl}
                                onChange={(e) => setKycDocUrl(e.target.value)}
                                placeholder="https://secure-vault/passport.jpg"
                                className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white placeholder-luxury-gold-200/20 focus:border-luxury-gold-500/40 outline-none"
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={isUpdatingProfile || !kycDocUrl}
                              className="w-full py-2.5 bg-transparent border border-luxury-gold-500/20 hover:bg-luxury-gold-500/5 hover:border-luxury-gold-500/40 text-luxury-gold-400 text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm flex items-center justify-center gap-2"
                            >
                              <UploadCloud className="h-4 w-4" /> Submit For Verification
                            </button>
                          </form>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* --- 3. ORDERS VIEW --- */}
                {activeTab === 'orders' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="font-serif text-2xl font-bold tracking-wide">Transaction History</h2>
                      <p className="text-xs text-luxury-gold-200/50 uppercase tracking-widest mt-1">
                        Track bespoke manufacturing updates and secure carrier delivery lines
                      </p>
                    </div>

                    {orders.length === 0 ? (
                      <div className="border border-dashed border-luxury-gold-900/10 p-12 text-center rounded bg-luxury-slate/5">
                        <ShoppingBag className="h-10 w-10 text-luxury-gold-200/20 mx-auto mb-2" />
                        <p className="text-xs text-luxury-gold-200/40 font-sans">You have not completed any purchases yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => {
                          const isExpanded = expandedOrderId === order.id;
                          const shippingAddr = parseAddress(order.shippingAddress);
                          return (
                            <div key={order.id} className="border border-luxury-gold-900/10 rounded-sm overflow-hidden bg-luxury-slate/5 font-sans">
                              {/* Order Header bar */}
                              <div
                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-luxury-slate/10 transition-colors border-b border-luxury-gold-900/5"
                              >
                                <div className="space-y-1">
                                  <p className="font-mono text-sm font-bold text-luxury-gold-400 uppercase">{order.orderNumber}</p>
                                  <p className="text-[10px] text-luxury-gold-200/40">Placed: {new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-6 self-stretch md:self-auto justify-between">
                                  <div className="text-right">
                                    <p className="font-serif font-bold text-white text-sm">
                                      ${Number(order.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                    <span className="text-[9px] uppercase tracking-widest font-bold text-luxury-gold-400/70">
                                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-sans font-bold px-2 py-0.5 rounded-full bg-luxury-gold-500/10 border border-luxury-gold-500/20 text-luxury-gold-400 tracking-widest uppercase">
                                      {order.status}
                                    </span>
                                    <ChevronRight className={`h-4 w-4 text-luxury-gold-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                  </div>
                                </div>
                              </div>

                              {/* Order Expand Details */}
                              <AnimatePresence initial={false}>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="p-6 space-y-6 bg-luxury-slate/10">
                                      
                                      {/* Sub-grid of tracking vs delivery address */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-luxury-gold-900/5">
                                        <div>
                                          <h4 className="text-[10px] uppercase font-bold tracking-wider text-luxury-gold-200/50 mb-2">
                                            Secured Logistics Summary
                                          </h4>
                                          <div className="text-xs space-y-1">
                                            <p className="text-white font-serif">Carrier: {order.carrier || 'FedEx Priority'}</p>
                                            {order.trackingNumber ? (
                                              <p className="text-luxury-gold-400 font-mono">
                                                Tracking: {order.trackingNumber}
                                              </p>
                                            ) : (
                                              <p className="text-luxury-gold-200/30">No active tracking number yet.</p>
                                            )}
                                          </div>
                                        </div>

                                        <div>
                                          <h4 className="text-[10px] uppercase font-bold tracking-wider text-luxury-gold-200/50 mb-2">
                                            Shipping Destination
                                          </h4>
                                          {shippingAddr ? (
                                            <p className="text-xs text-luxury-gold-200/70 leading-relaxed font-sans">
                                              {shippingAddr.addressLine1}
                                              {shippingAddr.addressLine2 && `, ${shippingAddr.addressLine2}`}
                                              <br />
                                              {shippingAddr.city}, {shippingAddr.state} {shippingAddr.postalCode}
                                              <br />
                                              {shippingAddr.country}
                                            </p>
                                          ) : (
                                            <p className="text-xs text-luxury-gold-200/30">Address details missing.</p>
                                          )}
                                        </div>
                                      </div>

                                      {/* Item breakdown list */}
                                      <div className="space-y-4">
                                        <h4 className="text-[10px] uppercase font-bold tracking-wider text-luxury-gold-200/50">
                                          Configured Jewelry Items
                                        </h4>
                                        {order.items.map((item) => (
                                          <div key={item.id} className="flex justify-between items-start text-xs border-b border-luxury-gold-900/5 pb-3 last:border-0 last:pb-0">
                                            <div>
                                              <p className="font-serif font-bold text-white text-sm">{item.product.name}</p>
                                              <p className="text-[9px] font-mono text-luxury-gold-200/40">SKU: {item.product.sku} | Qty: {item.quantity}</p>
                                              
                                              {/* Metals sizes config */}
                                              {(item.selectedMetal || item.selectedSize || item.customEngraving) && (
                                                <div className="text-[9px] text-luxury-gold-200/40 mt-1 pl-2 border-l border-luxury-gold-500/20">
                                                  {item.selectedMetal && <p>Metal: {metalLabels[item.selectedMetal]}</p>}
                                                  {item.selectedSize && <p>Ring Size: {Number(item.selectedSize).toFixed(1)}</p>}
                                                  {item.customEngraving && <p className="italic">Engraving: "{item.customEngraving}"</p>}
                                                </div>
                                              )}
                                            </div>

                                            <div className="flex flex-col items-end gap-3 shrink-0">
                                              <span className="font-serif font-bold text-luxury-gold-200">
                                                ${(Number(item.price) * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                              </span>
                                              {order.status === 'DELIVERED' && (
                                                <button
                                                  onClick={() => handleOpenReviewModal(item.productId, item.product.name)}
                                                  className="text-[9px] text-luxury-gold-400 hover:text-white uppercase tracking-wider font-bold underline transition-colors"
                                                >
                                                  Write Review
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* --- 4. WISHLIST VIEW --- */}
                {activeTab === 'wishlist' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="font-serif text-2xl font-bold tracking-wide">Bespoke Wishlist</h2>
                      <p className="text-xs text-luxury-gold-200/50 uppercase tracking-widest mt-1">
                        Review saved solitaire rings and diamond customizer configurations
                      </p>
                    </div>

                    {wishlist.length === 0 ? (
                      <div className="border border-dashed border-luxury-gold-900/10 p-12 text-center rounded bg-luxury-slate/5">
                        <Heart className="h-10 w-10 text-luxury-gold-200/20 mx-auto mb-2" />
                        <p className="text-xs text-luxury-gold-200/40 font-sans">Your wishlist vault is empty.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {wishlist.map((item) => (
                          <div key={item.id} className="border border-luxury-gold-900/10 p-5 rounded-sm bg-luxury-slate/5 relative flex justify-between gap-4 font-sans text-xs">
                            <div className="space-y-2 flex-grow min-w-0">
                              <h3 className="font-serif font-bold text-white text-base truncate">
                                {item.product.name}
                              </h3>
                              <p className="text-[9px] text-luxury-gold-200/40 uppercase font-mono">SKU: {item.product.sku}</p>
                              
                              {/* Configuration checks */}
                              {(item.selectedMetal || item.selectedSize) && (
                                <div className="text-[9px] text-luxury-gold-200/50 space-y-0.5 border-l border-luxury-gold-500/20 pl-2">
                                  {item.selectedMetal && <p>Metal: {metalLabels[item.selectedMetal]}</p>}
                                  {item.selectedSize && <p>Size: {Number(item.selectedSize).toFixed(1)}</p>}
                                </div>
                              )}
                              
                              <p className="font-serif font-semibold text-luxury-gold-300 mt-2 text-sm">
                                ${Number(item.product.basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </p>

                              <div className="flex gap-4 pt-3 border-t border-luxury-gold-900/5 mt-4">
                                <button
                                  onClick={() => handleMoveToBag(item)}
                                  className="px-4 py-2 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-[10px] uppercase tracking-widest font-bold rounded-sm transition-all flex items-center gap-1.5"
                                >
                                  Move To Bag <ArrowRight className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleRemoveFromWishlist(item.id)}
                                  className="px-3 py-2 bg-transparent border border-red-500/10 hover:border-red-500/30 text-red-400 rounded-sm text-[10px] font-bold transition-all uppercase tracking-wider"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* --- 5. ADDRESSES CRUD VIEW --- */}
                {activeTab === 'addresses' && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="font-serif text-2xl font-bold tracking-wide">Saved Addresses</h2>
                        <p className="text-xs text-luxury-gold-200/50 uppercase tracking-widest mt-1">
                          Manage secure billing and shipping destination cards
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingAddressId(null);
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
                          setShowAddressModal(true);
                        }}
                        className="px-4 py-2 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Address
                      </button>
                    </div>

                    {addresses.length === 0 ? (
                      <div className="border border-dashed border-luxury-gold-900/10 p-12 text-center rounded bg-luxury-slate/5">
                        <MapPin className="h-10 w-10 text-luxury-gold-200/20 mx-auto mb-2" />
                        <p className="text-xs text-luxury-gold-200/40 font-sans">No saved addresses found.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs">
                        {addresses.map((addr) => (
                          <div
                            key={addr.id}
                            className={`p-5 border rounded-sm bg-luxury-slate/5 flex flex-col justify-between transition-all ${addr.isDefault ? 'border-luxury-gold-500 ring-1 ring-luxury-gold-500/10' : 'border-luxury-gold-900/10'}`}
                          >
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-[9px] uppercase font-bold tracking-widest font-mono text-luxury-gold-400 px-2 py-0.5 bg-luxury-gold-900/20 border border-luxury-gold-500/20 rounded-sm">
                                  {addr.name} ({addr.type})
                                </span>
                                {addr.isDefault && (
                                  <span className="text-[9px] uppercase font-bold tracking-widest text-luxury-gold-500">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-bold text-white font-serif">{user?.name}</p>
                              <p className="text-xs text-luxury-gold-200/70 mt-2 leading-relaxed">
                                {addr.addressLine1}
                                {addr.addressLine2 && `, ${addr.addressLine2}`}
                                <br />
                                {addr.city}, {addr.state} {addr.postalCode}
                                <br />
                                {addr.country}
                              </p>
                              <p className="text-xs text-luxury-gold-200/50 mt-3 font-mono">
                                Phone: {addr.phone}
                              </p>
                            </div>

                            <div className="mt-6 pt-3 border-t border-luxury-gold-900/5 flex justify-end gap-3">
                              <button
                                onClick={() => handleEditAddressClick(addr)}
                                className="p-1 text-luxury-gold-400 hover:text-white transition-colors"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="p-1 text-luxury-gold-300 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* --- 6. REVIEWS VIEW --- */}
                {activeTab === 'reviews' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="font-serif text-2xl font-bold tracking-wide">My Reviews & Appraisals</h2>
                      <p className="text-xs text-luxury-gold-200/50 uppercase tracking-widest mt-1">
                        Check grading feedback left on certified solitaires and designs
                      </p>
                    </div>

                    {reviews.length === 0 ? (
                      <div className="border border-dashed border-luxury-gold-900/10 p-12 text-center rounded bg-luxury-slate/5">
                        <MessageSquare className="h-10 w-10 text-luxury-gold-200/20 mx-auto mb-2" />
                        <p className="text-xs text-luxury-gold-200/40 font-sans">You have not submitted any product reviews.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 font-sans text-xs">
                        {reviews.map((rev) => (
                          <div key={rev.id} className="border border-luxury-gold-900/10 p-5 bg-luxury-slate/5 rounded-sm">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-serif font-bold text-white text-sm">
                                {rev.product.name}
                              </h3>
                              <span className="text-[9px] uppercase tracking-wider text-luxury-gold-200/40 font-mono">
                                SKU: {rev.product.sku}
                              </span>
                            </div>

                            {/* Stars rating */}
                            <div className="flex items-center gap-0.5 text-luxury-gold-500 mb-3">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className="text-base">
                                  {i < rev.rating ? '★' : '☆'}
                                </span>
                              ))}
                              {rev.isVerifiedPurchase && (
                                <span className="text-[9px] font-sans uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded-sm ml-3">
                                  Verified Acquisition
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-luxury-gold-200/70 leading-relaxed italic">
                              "{rev.comment || 'No comment provided.'}"
                            </p>
                            <p className="text-[9px] text-luxury-gold-200/30 mt-3 font-mono">
                              Posted: {new Date(rev.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* --- 7. SECURITY & PASSWORD CHANGE --- */}
                {activeTab === 'security' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="font-serif text-2xl font-bold tracking-wide">Security Credentials</h2>
                      <p className="text-xs text-luxury-gold-200/50 uppercase tracking-widest mt-1">
                        Modify encrypted account passwords and security parameters
                      </p>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md font-sans text-xs">
                      <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold-200/60 font-sans border-b border-luxury-gold-900/5 pb-2 mb-2">
                        Change Password
                      </h3>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white placeholder-luxury-gold-200/20 focus:border-luxury-gold-500/40 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                          New Secure Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white placeholder-luxury-gold-200/20 focus:border-luxury-gold-500/40 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white placeholder-luxury-gold-200/20 focus:border-luxury-gold-500/40 outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="px-6 py-2.5 bg-luxury-gold-500 hover:bg-luxury-gold-600 disabled:opacity-25 text-luxury-slate-dark text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm flex items-center gap-1.5"
                      >
                        {isChangingPassword ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Modifying Vault...
                          </>
                        ) : (
                          <>
                            Update Passphrase
                          </>
                        )}
                      </button>
                    </form>

                  </div>
                )}

              </motion.div>
            </AnimatePresence>

          </div>

        </div>

      </div>

      {/* ADDRESS MODAL FORM */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in font-sans text-xs">
          <div className="bg-luxury-slate-dark border border-luxury-gold-500/30 p-6 rounded-sm w-full max-w-lg relative">
            <h3 className="font-serif text-xl font-bold tracking-wide text-white border-b border-luxury-gold-900/10 pb-3 mb-6">
              {editingAddressId ? 'Edit Address Card' : 'Add New Saved Address'}
            </h3>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                    Label (e.g. Home, Office)
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.name}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Home"
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
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
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
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
                  className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
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
                  className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
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
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
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
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
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
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
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
                  {isSavingAddress ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW FEEDBACK POPUP FORM */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in font-sans text-xs">
          <div className="bg-luxury-slate-dark border border-luxury-gold-500/30 p-6 rounded-sm w-full max-w-lg relative">
            <h3 className="font-serif text-xl font-bold tracking-wide text-white border-b border-luxury-gold-900/10 pb-3 mb-4">
              Write Solitaire Feedback
            </h3>
            <p className="text-[10px] text-luxury-gold-200/40 uppercase font-sans mb-6">
              Reviewing: {reviewForm.productName}
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-2">
                  Grading Score Rating (1 to 5 Stars)
                </label>
                <div className="flex gap-2 text-2xl text-luxury-gold-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: i + 1 }))}
                      className="hover:scale-115 transition-transform"
                    >
                      {i < reviewForm.rating ? '★' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                  Appraisal Comment / Review Text
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Describe your bespoke sizing precision, diamond clarity under loupe, or transit escorts satisfaction..."
                  className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white placeholder-luxury-gold-200/20 focus:border-luxury-gold-500/40 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-luxury-gold-900/10">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 border border-luxury-gold-500/10 hover:border-luxury-gold-500/20 text-luxury-gold-400 text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2 bg-luxury-gold-500 hover:bg-luxury-gold-600 disabled:opacity-25 text-luxury-slate-dark text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
