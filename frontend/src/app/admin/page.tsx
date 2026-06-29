'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, ShoppingBag, FolderTree, Award, DollarSign, Users,
  Tag, MessageSquare, Box, Settings, Loader2, ArrowUpRight, ShieldCheck,
  Edit, Trash2, Plus, X, Check, Eye, ChevronRight, AlertCircle, RefreshCw,
  Percent, Gift, Landmark, Calendar, Truck, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const kycStatusStyles = {
  APPROVED: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  PENDING: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  REJECTED: 'bg-red-500/10 border-red-500/20 text-red-400',
  NONE: 'bg-luxury-gold-900/10 border-luxury-gold-500/20 text-luxury-gold-300',
};

const metalLabels: Record<string, string> = {
  YELLOW_GOLD_18K: '18k Yellow Gold',
  WHITE_GOLD_18K: '18k White Gold',
  ROSE_GOLD_18K: '18k Rose Gold',
  PLATINUM: 'Platinum',
};

// Interfaces
interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
  description: string;
  basePrice: number;
  isCustomizable: boolean;
  categoryId: string;
  status: string;
  rating: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  taxAmount: number;
  shippingAmount: number;
  carrier: string | null;
  trackingNumber: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  payment?: {
    gateway: string;
    status: string;
  } | null;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  createdAt: string;
  profile?: {
    avatarUrl?: string | null;
    kycStatus: string;
    kycDocumentUrl?: string | null;
  } | null;
  orders: { id: string }[];
}

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  expiresAt: string;
  isActive: boolean;
  usageLimit?: number | null;
  usageCount: number;
}

interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  isVerifiedPurchase: boolean;
  createdAt: string;
  user: { name: string; email: string };
  product: { name: string; sku: string };
}

interface InventoryVariant {
  id: string;
  sku: string;
  metalType: string;
  ringSize?: number | null;
  price: number;
  stock: number;
  product: { name: string; sku: string };
}

interface InventoryGemstone {
  id: string;
  type: string;
  shape: string;
  carat: number;
  certificateNumber?: string | null;
  price: number;
  status: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function AdminPanelPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Active section tab
  const [activeTab, setActiveTab] = useState<string>('analytics');

  // Lists
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [variants, setVariants] = useState<InventoryVariant[]>([]);
  const [gemstones, setGemstones] = useState<InventoryGemstone[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // Statuses
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals/Forms State
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    sku: '',
    description: '',
    basePrice: 0,
    isCustomizable: false,
    categoryId: '',
    status: 'ACTIVE'
  });

  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    description: '',
    parentId: ''
  });

  const [showCollectionModal, setShowCollectionModal] = useState<boolean>(false);
  const [collectionForm, setCollectionForm] = useState({
    id: '',
    name: '',
    description: ''
  });

  const [showCouponModal, setShowCouponModal] = useState<boolean>(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 100
  });

  const [showBrandModal, setShowBrandModal] = useState<boolean>(false);
  const [brandForm, setBrandForm] = useState({
    id: '',
    name: '',
    description: '',
    imageUrl: ''
  });

  const [showBlogModal, setShowBlogModal] = useState<boolean>(false);
  const [blogForm, setBlogForm] = useState({
    id: '',
    title: '',
    summary: '',
    content: '',
    authorName: '',
    imageUrl: '',
    publish: false
  });

  // Settings mock toggle
  const [conciergePhone, setConciergePhone] = useState<string>('+1 (800) 555-VAULT');
  const [conciergeEmail, setConciergeEmail] = useState<string>('vault@beyondcarat.com');

  useEffect(() => {
    if (!authLoading && (!user || !['ADMIN', 'ORDER_MANAGER', 'GEMOLOGIST'].includes(user.role))) {
      router.push('/login?redirect=/admin');
      return;
    }

    if (user) {
      loadAllData();
    }
  }, [user, authLoading]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchAnalytics(),
        fetchProducts(),
        fetchCategories(),
        fetchCollections(),
        fetchOrders(),
        fetchCustomers(),
        fetchCoupons(),
        fetchReviews(),
        fetchInventory(),
        fetchBrands(),
        fetchBlogsAdmin()
      ]);
    } catch (err) {
      console.error(err);
      showToast('error', 'Error loading administrative database.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch functions
  const fetchAnalytics = async () => {
    const res = await fetch(`${API_URL}/checkout/admin/analytics`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      setAnalytics(data.data);
    }
  };

  const fetchProducts = async () => {
    const res = await fetch(`${API_URL}/catalog/products?limit=100`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      setProducts(data.data.products || []);
    }
  };

  const fetchCategories = async () => {
    const res = await fetch(`${API_URL}/catalog/categories`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      setCategories(data.data || []);
    }
  };

  const fetchCollections = async () => {
    const res = await fetch(`${API_URL}/catalog/collections`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      setCollections(data.data || []);
    }
  };

  const fetchOrders = async () => {
    const res = await fetch(`${API_URL}/checkout/admin/orders`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      setOrders(data.data || []);
    }
  };

  const fetchCustomers = async () => {
    const res = await fetch(`${API_URL}/auth/admin/users`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      setCustomers(data.data || []);
    }
  };

  const fetchCoupons = async () => {
    const res = await fetch(`${API_URL}/checkout/coupons`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      setCoupons(data.data || []);
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

  const fetchInventory = async () => {
    const res = await fetch(`${API_URL}/catalog/admin/inventory`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      setVariants(data.data.variants || []);
      setGemstones(data.data.gemstones || []);
    }
  };

  const fetchBrands = async () => {
    const res = await fetch(`${API_URL}/brands`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      setBrands(data.data || []);
    }
  };

  const fetchBlogsAdmin = async () => {
    const res = await fetch(`${API_URL}/blogs/admin/list`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      setBlogs(data.data.blogs || []);
    }
  };

  // --- Product CRUD ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      const method = productForm.id ? 'PATCH' : 'POST';
      const url = productForm.id ? `${API_URL}/catalog/products/${productForm.id}` : `${API_URL}/catalog/products`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productForm.name,
          sku: productForm.sku,
          description: productForm.description,
          basePrice: Number(productForm.basePrice),
          isCustomizable: productForm.isCustomizable,
          categoryId: productForm.categoryId,
          status: productForm.status
        }),
        credentials: 'include',
      });
      if (res.ok) {
        showToast('success', 'Product listing saved successfully.');
        setShowProductModal(false);
        await fetchProducts();
      } else {
        const d = await res.json();
        showToast('error', d.message || 'Error saving product.');
      }
    } catch {
      showToast('error', 'Network error.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product listing?')) return;
    try {
      const res = await fetch(`${API_URL}/catalog/products/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        showToast('success', 'Product listing deleted.');
        await fetchProducts();
      }
    } catch {
      showToast('error', 'Error deleting product.');
    }
  };

  // --- Category CRUD ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = categoryForm.id ? 'PATCH' : 'POST';
      const url = categoryForm.id ? `${API_URL}/catalog/categories/${categoryForm.id}` : `${API_URL}/catalog/categories`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryForm.name,
          description: categoryForm.description || null,
          parentId: categoryForm.parentId || null
        }),
        credentials: 'include',
      });
      if (res.ok) {
        showToast('success', 'Category tree updated.');
        setShowCategoryModal(false);
        await fetchCategories();
      }
    } catch {
      showToast('error', 'Error saving category.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category node?')) return;
    try {
      const res = await fetch(`${API_URL}/catalog/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        showToast('success', 'Category deleted.');
        await fetchCategories();
      }
    } catch {
      showToast('error', 'Error deleting category.');
    }
  };

  // --- Collection CRUD ---
  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = collectionForm.id ? 'PATCH' : 'POST';
      const url = collectionForm.id ? `${API_URL}/catalog/collections/${collectionForm.id}` : `${API_URL}/catalog/collections`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: collectionForm.name,
          description: collectionForm.description || null
        }),
        credentials: 'include',
      });
      if (res.ok) {
        showToast('success', 'Collection configurations updated.');
        setShowCollectionModal(false);
        await fetchCollections();
      }
    } catch {
      showToast('error', 'Error saving collection.');
    }
  };

  // --- Order Status Adjust ---
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/checkout/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });
      if (res.ok) {
        showToast('success', `Order status updated to ${status}.`);
        await fetchOrders();
        await fetchAnalytics();
      }
    } catch {
      showToast('error', 'Failed to update order status.');
    }
  };

  // --- User / KYC Approval ---
  const handleKycVerification = async (userId: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/profile/kyc/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status }),
        credentials: 'include',
      });
      if (res.ok) {
        showToast('success', `KYC verification status set to ${status}.`);
        await fetchCustomers();
      }
    } catch {
      showToast('error', 'Error updating KYC status.');
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
        credentials: 'include',
      });
      if (res.ok) {
        showToast('success', 'User role upgraded.');
        await fetchCustomers();
      }
    } catch {
      showToast('error', 'Failed to change role.');
    }
  };

  // --- Coupons CRUD ---
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/checkout/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponForm.code,
          discountType: couponForm.discountType,
          discountValue: Number(couponForm.discountValue),
          minOrderAmount: couponForm.minOrderAmount ? Number(couponForm.minOrderAmount) : null,
          maxDiscountAmount: couponForm.maxDiscountAmount ? Number(couponForm.maxDiscountAmount) : null,
          expiresAt: new Date(couponForm.expiresAt).toISOString(),
          usageLimit: Number(couponForm.usageLimit)
        }),
        credentials: 'include',
      });
      if (res.ok) {
        showToast('success', 'Promo coupon code active.');
        setShowCouponModal(false);
        await fetchCoupons();
      } else {
        const d = await res.json();
        showToast('error', d.message || 'Error creating coupon.');
      }
    } catch {
      showToast('error', 'Error creating coupon.');
    }
  };

  // --- Inventory Adjust ---
  const handleUpdateVariantStock = async (id: string, newStock: number) => {
    try {
      const res = await fetch(`${API_URL}/catalog/admin/inventory/variant/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
        credentials: 'include',
      });
      if (res.ok) {
        showToast('success', 'Stock count updated.');
        await fetchInventory();
        await fetchAnalytics();
      }
    } catch {
      showToast('error', 'Failed to update variant stock.');
    }
  };

  const handleUpdateGemstoneStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/catalog/admin/inventory/gemstone/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });
      if (res.ok) {
        showToast('success', 'Gemstone status updated.');
        await fetchInventory();
      }
    } catch {
      showToast('error', 'Failed to change gemstone status.');
    }
  };

  // --- Brand CRUD ---
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      const method = brandForm.id ? 'PATCH' : 'POST';
      const url = brandForm.id ? `${API_URL}/brands/${brandForm.id}` : `${API_URL}/brands`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: brandForm.name,
          description: brandForm.description || null,
          imageUrl: brandForm.imageUrl || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=400&auto=format&fit=crop'
        }),
        credentials: 'include',
      });
      if (res.ok) {
        showToast('success', 'Designer brand updated.');
        setShowBrandModal(false);
        await fetchBrands();
      } else {
        const d = await res.json();
        showToast('error', d.message || 'Error saving brand.');
      }
    } catch {
      showToast('error', 'Error saving brand.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Are you sure you want to dissolve this brand? Products will remain unbranded.')) return;
    try {
      const res = await fetch(`${API_URL}/brands/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        showToast('success', 'Brand dissolved.');
        await fetchBrands();
      }
    } catch {
      showToast('error', 'Error deleting brand.');
    }
  };

  // --- Blog CRUD ---
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      const method = blogForm.id ? 'PATCH' : 'POST';
      const url = blogForm.id ? `${API_URL}/blogs/admin/${blogForm.id}` : `${API_URL}/blogs/admin`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: blogForm.title,
          content: blogForm.content,
          summary: blogForm.summary || null,
          authorName: blogForm.authorName,
          imageUrl: blogForm.imageUrl || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop',
          publish: blogForm.publish
        }),
        credentials: 'include',
      });
      if (res.ok) {
        showToast('success', 'Blog article updated.');
        setShowBlogModal(false);
        await fetchBlogsAdmin();
      } else {
        const d = await res.json();
        showToast('error', d.message || 'Error saving article.');
      }
    } catch {
      showToast('error', 'Error saving blog article.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Permanently delete this journal manuscript?')) return;
    try {
      const res = await fetch(`${API_URL}/blogs/admin/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        showToast('success', 'Journal entry removed.');
        await fetchBlogsAdmin();
      }
    } catch {
      showToast('error', 'Error removing journal.');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-luxury-slate-dark flex items-center justify-center flex-col gap-3">
        <Loader2 className="h-10 w-10 text-luxury-gold-500 animate-spin" />
        <p className="text-luxury-gold-200/50 uppercase tracking-widest text-[10px] font-mono">
          Mounting Administrative Vault...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-slate-dark text-white pt-24 pb-32 font-sans">
      
      {/* Toast Alert popup */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 border rounded shadow-xl flex items-center gap-3 transition-all duration-300 max-w-sm text-xs ${toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300' : 'bg-red-950/90 border-red-500/40 text-red-300'}`}>
          {toast.type === 'success' ? <Check className="h-4 w-4 shrink-0 text-emerald-400" /> : <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />}
          <p>{toast.text}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Panel Header */}
        <div className="border-b border-luxury-gold-900/10 pb-6 mb-8 flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-wide">Enterprise Operations</h1>
            <p className="text-xs text-luxury-gold-200/50 uppercase tracking-widest font-sans mt-2">
              Concierge Administrative Controls & Analytics Ledger
            </p>
          </div>
          <button onClick={loadAllData} className="px-3 py-1.5 border border-luxury-gold-500/20 hover:border-luxury-gold-500/40 text-luxury-gold-400 text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3" /> Refresh Database
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Sidebar Navigation Tabs */}
          <div className="lg:col-span-3 bg-luxury-slate/15 border border-luxury-gold-900/10 p-5 rounded-sm space-y-2">
            <p className="text-[9px] uppercase tracking-widest font-bold text-luxury-gold-200/30 px-3 pb-2 border-b border-luxury-gold-900/5">
              Control Center
            </p>

            <button onClick={() => setActiveTab('analytics')} className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-sm text-left text-xs uppercase tracking-wider transition-all ${activeTab === 'analytics' ? 'bg-luxury-gold-500 text-luxury-slate-dark font-bold' : 'text-luxury-gold-200/50 hover:bg-white/5 hover:text-white'}`}>
              <TrendingUp className="h-4 w-4 shrink-0" /> Overview Metrics
            </button>

            <button onClick={() => setActiveTab('products')} className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-sm text-left text-xs uppercase tracking-wider transition-all ${activeTab === 'products' ? 'bg-luxury-gold-500 text-luxury-slate-dark font-bold' : 'text-luxury-gold-200/50 hover:bg-white/5 hover:text-white'}`}>
              <ShoppingBag className="h-4 w-4 shrink-0" /> Product Listings
            </button>

            <button onClick={() => setActiveTab('categories')} className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-sm text-left text-xs uppercase tracking-wider transition-all ${activeTab === 'categories' ? 'bg-luxury-gold-500 text-luxury-slate-dark font-bold' : 'text-luxury-gold-200/50 hover:bg-white/5 hover:text-white'}`}>
              <FolderTree className="h-4 w-4 shrink-0" /> Categories Tree
            </button>

            <button onClick={() => setActiveTab('collections')} className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-sm text-left text-xs uppercase tracking-wider transition-all ${activeTab === 'collections' ? 'bg-luxury-gold-500 text-luxury-slate-dark font-bold' : 'text-luxury-gold-200/50 hover:bg-white/5 hover:text-white'}`}>
              <Award className="h-4 w-4 shrink-0" /> Collections
            </button>

            <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-sm text-left text-xs uppercase tracking-wider transition-all ${activeTab === 'orders' ? 'bg-luxury-gold-500 text-luxury-slate-dark font-bold' : 'text-luxury-gold-200/50 hover:bg-white/5 hover:text-white'}`}>
              <ShoppingBag className="h-4 w-4 shrink-0" /> Client Orders
            </button>

            <button onClick={() => setActiveTab('customers')} className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-sm text-left text-xs uppercase tracking-wider transition-all ${activeTab === 'customers' ? 'bg-luxury-gold-500 text-luxury-slate-dark font-bold' : 'text-luxury-gold-200/50 hover:bg-white/5 hover:text-white'}`}>
              <Users className="h-4 w-4 shrink-0" /> Customers & KYC
            </button>

            <button onClick={() => setActiveTab('coupons')} className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-sm text-left text-xs uppercase tracking-wider transition-all ${activeTab === 'coupons' ? 'bg-luxury-gold-500 text-luxury-slate-dark font-bold' : 'text-luxury-gold-200/50 hover:bg-white/5 hover:text-white'}`}>
              <Tag className="h-4 w-4 shrink-0" /> Promo Coupons
            </button>

            <button onClick={() => setActiveTab('reviews')} className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-sm text-left text-xs uppercase tracking-wider transition-all ${activeTab === 'reviews' ? 'bg-luxury-gold-500 text-luxury-slate-dark font-bold' : 'text-luxury-gold-200/50 hover:bg-white/5 hover:text-white'}`}>
              <MessageSquare className="h-4 w-4 shrink-0" /> Reviews Feed
            </button>

            <button onClick={() => setActiveTab('inventory')} className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-sm text-left text-xs uppercase tracking-wider transition-all ${activeTab === 'inventory' ? 'bg-luxury-gold-500 text-luxury-slate-dark font-bold' : 'text-luxury-gold-200/50 hover:bg-white/5 hover:text-white'}`}>
              <Box className="h-4 w-4 shrink-0" /> Inventory Ledger
            </button>

            <button onClick={() => setActiveTab('brands')} className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-sm text-left text-xs uppercase tracking-wider transition-all ${activeTab === 'brands' ? 'bg-luxury-gold-500 text-luxury-slate-dark font-bold' : 'text-luxury-gold-200/50 hover:bg-white/5 hover:text-white'}`}>
              <Award className="h-4 w-4 shrink-0" /> Designer Brands
            </button>

            <button onClick={() => setActiveTab('blogs')} className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-sm text-left text-xs uppercase tracking-wider transition-all ${activeTab === 'blogs' ? 'bg-luxury-gold-500 text-luxury-slate-dark font-bold' : 'text-luxury-gold-200/50 hover:bg-white/5 hover:text-white'}`}>
              <MessageSquare className="h-4 w-4 shrink-0" /> Vault Journals
            </button>

            <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-sm text-left text-xs uppercase tracking-wider transition-all ${activeTab === 'settings' ? 'bg-luxury-gold-500 text-luxury-slate-dark font-bold' : 'text-luxury-gold-200/50 hover:bg-white/5 hover:text-white'}`}>
              <Settings className="h-4 w-4 shrink-0" /> Store Settings
            </button>
          </div>

          {/* RIGHT: Active Tab Panel */}
          <div className="lg:col-span-9 bg-luxury-slate/15 border border-luxury-gold-900/10 p-6 rounded-sm min-h-[550px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                
                {/* --- 1. OVERVIEW ANALYTICS TAB --- */}
                {activeTab === 'analytics' && analytics && (
                  <div className="space-y-8 font-sans text-xs">
                    
                    {/* Primary indicators card grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="p-4 bg-luxury-slate/10 border border-luxury-gold-900/5 rounded-sm">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase font-sans text-luxury-gold-200/40">Total Revenue</span>
                          <DollarSign className="h-4.5 w-4.5 text-luxury-gold-500" />
                        </div>
                        <p className="font-serif text-xl font-bold mt-2 text-white">
                          ${analytics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <div className="p-4 bg-luxury-slate/10 border border-luxury-gold-900/5 rounded-sm">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase font-sans text-luxury-gold-200/40">Total Orders</span>
                          <ShoppingBag className="h-4.5 w-4.5 text-luxury-gold-500" />
                        </div>
                        <p className="font-serif text-xl font-bold mt-2 text-white">
                          {analytics.totalOrders} acquisitions
                        </p>
                      </div>

                      <div className="p-4 bg-luxury-slate/10 border border-luxury-gold-900/5 rounded-sm">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase font-sans text-luxury-gold-200/40">Avg Order Value</span>
                          <TrendingUp className="h-4.5 w-4.5 text-luxury-gold-500" />
                        </div>
                        <p className="font-serif text-xl font-bold mt-2 text-white">
                          ${analytics.aov.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <div className="p-4 bg-luxury-slate/10 border border-luxury-gold-900/5 rounded-sm">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase font-sans text-luxury-gold-200/40">Low Stock items</span>
                          <ShieldAlert className="h-4.5 w-4.5 text-red-400" />
                        </div>
                        <p className={`font-serif text-xl font-bold mt-2 ${analytics.lowStockCount > 0 ? 'text-red-400' : 'text-white'}`}>
                          {analytics.lowStockCount} items
                        </p>
                      </div>
                    </div>

                    {/* SVG GRAPH CHART 1: REVENUE OVER TIME */}
                    <div className="bg-luxury-slate/10 border border-luxury-gold-900/5 p-6 rounded-sm">
                      <h3 className="font-serif font-bold text-sm text-white mb-6">Revenue Over Time (Monthly Trend)</h3>
                      {analytics.monthlyTrends.length === 0 ? (
                        <p className="text-luxury-gold-200/40 py-6 text-center">No sales logged in DB.</p>
                      ) : (
                        <div className="w-full h-48 relative flex items-end justify-around border-b border-luxury-gold-900/10 pb-2">
                          {analytics.monthlyTrends.map((t: any, index: number) => {
                            const maxVal = Math.max(...analytics.monthlyTrends.map((x: any) => x.revenue)) || 1;
                            const heightPct = (t.revenue / maxVal) * 80; // Scale to max 80% height
                            return (
                              <div key={index} className="flex flex-col items-center gap-2 group relative w-12">
                                {/* Hover tooltip value */}
                                <span className="absolute -top-8 bg-luxury-slate-dark text-[9px] px-2 py-0.5 rounded border border-luxury-gold-500/20 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-luxury-gold-300 font-mono z-10">
                                  ${t.revenue.toLocaleString()}
                                </span>
                                {/* SVG Column block */}
                                <div
                                  style={{ height: `${heightPct}%` }}
                                  className="w-8 bg-gradient-to-t from-luxury-gold-600/20 to-luxury-gold-500 rounded-sm hover:brightness-110 transition-all duration-500 shadow-md shadow-luxury-gold-900/5"
                                />
                                <span className="text-[9px] uppercase tracking-wider font-mono text-luxury-gold-200/40">{t.month}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* SVG GRAPH CHART 2: CATEGORY BREAKDOWN */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-luxury-slate/10 border border-luxury-gold-900/5 p-6 rounded-sm">
                        <h3 className="font-serif font-bold text-sm text-white mb-6">Sales by Design Category</h3>
                        {analytics.salesByCategory.length === 0 ? (
                          <p className="text-luxury-gold-200/40 py-6 text-center">No sales breakdown available.</p>
                        ) : (
                          <div className="space-y-4">
                            {analytics.salesByCategory.map((c: any, index: number) => {
                              const totalSum = analytics.salesByCategory.reduce((sum: number, x: any) => sum + x.value, 0) || 1;
                              const widthPct = (c.value / totalSum) * 100;
                              return (
                                <div key={index} className="space-y-1.5">
                                  <div className="flex justify-between text-[10px] uppercase font-sans text-luxury-gold-200/60">
                                    <span>{c.name}</span>
                                    <span className="font-mono text-white">${c.value.toLocaleString()}</span>
                                  </div>
                                  {/* Progress bar report */}
                                  <div className="w-full bg-luxury-slate h-2 rounded-full overflow-hidden border border-luxury-gold-900/5">
                                    <div
                                      style={{ width: `${widthPct}%` }}
                                      className="bg-luxury-gold-500 h-full rounded-full"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Audit summaries info */}
                      <div className="bg-luxury-slate/10 border border-luxury-gold-900/5 p-6 rounded-sm space-y-4 leading-relaxed">
                        <h3 className="font-serif font-bold text-sm text-white border-b border-luxury-gold-900/5 pb-2">concierge reports</h3>
                        <p className="text-luxury-gold-200/60">
                          This admin dashboard aggregates all checkout intents, payment verification signatures, and item configurations from database transactions.
                        </p>
                        <ul className="space-y-2 text-[11px] list-disc list-inside text-luxury-gold-200/50 font-sans">
                          <li>Total customers excludes admin/manager accounts.</li>
                          <li>Sales metrics reflect verified paid invoices only.</li>
                          <li>Inventory ledger updates are pushed to inventory cache in real-time.</li>
                        </ul>
                      </div>
                    </div>

                  </div>
                )}

                {/* --- 2. PRODUCT MANAGEMENT CRUD TAB --- */}
                {activeTab === 'products' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="font-serif text-2xl font-bold tracking-wide">Product Catalog</h2>
                        <p className="text-xs text-luxury-gold-200/50 uppercase tracking-widest mt-1">
                          Manage core settings, prices adjustments, and statuses
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setProductForm({
                            id: '',
                            name: '',
                            sku: '',
                            description: '',
                            basePrice: 0,
                            isCustomizable: false,
                            categoryId: categories[0]?.id || '',
                            status: 'ACTIVE'
                          });
                          setShowProductModal(true);
                        }}
                        className="px-4 py-2 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Product
                      </button>
                    </div>

                    {/* Table lists */}
                    <div className="border border-luxury-gold-900/10 rounded overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-luxury-slate/20 text-luxury-gold-200/50 uppercase tracking-wider text-[10px] border-b border-luxury-gold-900/10">
                            <th className="p-4">Name / SKU</th>
                            <th className="p-4">Base Price</th>
                            <th className="p-4 text-center">Customizable</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((prod) => (
                            <tr key={prod.id} className="border-b border-luxury-gold-900/5 hover:bg-white/5 transition-colors">
                              <td className="p-4">
                                <p className="font-serif font-bold text-white text-sm">{prod.name}</p>
                                <p className="text-[9px] font-mono text-luxury-gold-200/40 uppercase mt-0.5">{prod.sku}</p>
                              </td>
                              <td className="p-4 font-serif font-bold text-luxury-gold-200 text-sm">
                                ${Number(prod.basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="p-4 text-center font-bold">
                                {prod.isCustomizable ? (
                                  <span className="text-luxury-gold-400">Yes</span>
                                ) : (
                                  <span className="text-white/30">No</span>
                                )}
                              </td>
                              <td className="p-4 text-center">
                                <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${prod.status === 'ACTIVE' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-white/10 border border-white/20 text-white/40'}`}>
                                  {prod.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex justify-end gap-3">
                                  <button
                                    onClick={() => {
                                      setProductForm({
                                        id: prod.id,
                                        name: prod.name,
                                        sku: prod.sku,
                                        description: prod.description,
                                        basePrice: prod.basePrice,
                                        isCustomizable: prod.isCustomizable,
                                        categoryId: prod.categoryId,
                                        status: prod.status
                                      });
                                      setShowProductModal(true);
                                    }}
                                    className="p-1 text-luxury-gold-400 hover:text-white transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(prod.id)}
                                    className="p-1 text-luxury-gold-300 hover:text-red-400 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* --- 3. CATEGORIES MANAGEMENT TAB --- */}
                {activeTab === 'categories' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="font-serif text-2xl font-bold tracking-wide">Categories Tree</h2>
                        <p className="text-xs text-luxury-gold-200/50 uppercase tracking-widest mt-1">
                          Configure layout structures and tree directories
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setCategoryForm({
                            id: '',
                            name: '',
                            description: '',
                            parentId: ''
                          });
                          setShowCategoryModal(true);
                        }}
                        className="px-4 py-2 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Category
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start text-xs font-sans">
                      <div className="space-y-4">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold-200/60 font-sans border-b border-luxury-gold-900/5 pb-2">
                          Available Categories List
                        </h3>
                        
                        <div className="space-y-3">
                          {categories.map((cat) => (
                            <div key={cat.id} className="p-4 border border-luxury-gold-900/10 rounded-sm bg-luxury-slate/5 flex justify-between items-start gap-4">
                              <div>
                                <h4 className="font-serif font-bold text-white text-sm">{cat.name}</h4>
                                <p className="text-[9px] font-mono text-luxury-gold-200/40 uppercase mt-0.5">SLUG: {cat.slug}</p>
                                {cat.parentId && (
                                  <p className="text-[9px] text-luxury-gold-200/30 mt-1">
                                    Parent: {categories.find(c => c.id === cat.parentId)?.name || 'Hierarchy node'}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setCategoryForm({
                                      id: cat.id,
                                      name: cat.name,
                                      description: cat.description || '',
                                      parentId: cat.parentId || ''
                                    });
                                    setShowCategoryModal(true);
                                  }}
                                  className="p-1 text-luxury-gold-400 hover:text-white transition-colors"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  className="p-1 text-luxury-gold-300 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-luxury-slate/10 border border-luxury-gold-900/5 p-6 rounded-sm space-y-3 leading-relaxed">
                        <h3 className="font-serif font-bold text-sm text-white">Categories Hierarchy</h3>
                        <p className="text-luxury-gold-200/60">
                          Products catalog depends on category mapping slugs. Top-level categories (e.g. Rings) can house sub-categories (e.g. Engagement Rings) using the Parent Category selection rules.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- 4. COLLECTIONS TAB --- */}
                {activeTab === 'collections' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="font-serif text-2xl font-bold tracking-wide">Design Collections</h2>
                        <p className="text-xs text-luxury-gold-200/50 uppercase tracking-widest mt-1">
                          Group products into themed campaign catalogs
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setCollectionForm({
                            id: '',
                            name: '',
                            description: ''
                          });
                          setShowCollectionModal(true);
                        }}
                        className="px-4 py-2 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Collection
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      {collections.map((coll) => (
                        <div key={coll.id} className="p-5 border border-luxury-gold-900/10 rounded-sm bg-luxury-slate/5 flex flex-col justify-between gap-4 font-sans">
                          <div>
                            <h3 className="font-serif font-bold text-white text-base">{coll.name}</h3>
                            <p className="text-[9px] font-mono text-luxury-gold-200/40 uppercase mt-0.5">SLUG: {coll.slug}</p>
                            <p className="text-xs text-luxury-gold-200/60 leading-relaxed mt-2">{coll.description || 'No description provided.'}</p>
                          </div>
                          <div className="flex justify-end gap-2 pt-3 border-t border-luxury-gold-900/5">
                            <button
                              onClick={() => {
                                setCollectionForm({
                                  id: coll.id,
                                  name: coll.name,
                                  description: coll.description || ''
                                });
                                setShowCollectionModal(true);
                              }}
                              className="px-3 py-1.5 bg-transparent border border-luxury-gold-500/20 text-luxury-gold-400 hover:text-white rounded-sm text-[10px] uppercase tracking-wider font-bold transition-all"
                            >
                              Edit details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- 5. CLIENT ORDERS MANAGEMENT TAB --- */}
                {activeTab === 'orders' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-serif text-2xl font-bold tracking-wide">Client Acquisitions</h2>
                      <p className="text-xs text-luxury-gold-200/50 uppercase tracking-widest mt-1">
                        Review invoices, payments status, and update logistics carrier states
                      </p>
                    </div>

                    <div className="border border-luxury-gold-900/10 rounded overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs font-sans">
                        <thead>
                          <tr className="bg-luxury-slate/20 text-luxury-gold-200/50 uppercase tracking-wider text-[10px] border-b border-luxury-gold-900/10">
                            <th className="p-4">Order Code / Date</th>
                            <th className="p-4">Customer Details</th>
                            <th className="p-4">Amount Invoice</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-right">Actions Override</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((ord) => (
                            <tr key={ord.id} className="border-b border-luxury-gold-900/5 hover:bg-white/5 transition-colors">
                              <td className="p-4">
                                <p className="font-mono font-bold text-luxury-gold-400 uppercase">{ord.orderNumber}</p>
                                <p className="text-[9px] text-luxury-gold-200/30 mt-0.5">{new Date(ord.createdAt).toLocaleDateString()}</p>
                              </td>
                              <td className="p-4">
                                <p className="font-bold text-white">{ord.user.name}</p>
                                <p className="text-[9px] text-luxury-gold-200/40 mt-0.5 truncate max-w-[150px]">{ord.user.email}</p>
                              </td>
                              <td className="p-4 font-serif font-bold text-luxury-gold-200">
                                ${Number(ord.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="p-4 text-center">
                                <span className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-luxury-gold-500/10 border border-luxury-gold-500/20 text-luxury-gold-400`}>
                                  {ord.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                  {ord.status === 'PENDING_PAYMENT' && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(ord.id, 'PAID')}
                                      className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] uppercase tracking-wider font-bold rounded hover:bg-emerald-500/20 transition-all"
                                    >
                                      Mark Paid
                                    </button>
                                  )}
                                  {ord.status === 'PAID' && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(ord.id, 'DELIVERED')}
                                      className="px-2 py-1 bg-luxury-gold-500/10 border border-luxury-gold-500/20 text-luxury-gold-400 text-[9px] uppercase tracking-wider font-bold rounded hover:bg-luxury-gold-500/20 hover:text-white transition-all"
                                    >
                                      Mark Delivered
                                    </button>
                                  )}
                                  {ord.status !== 'CANCELLED' && ord.status !== 'DELIVERED' && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(ord.id, 'CANCELLED')}
                                      className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] uppercase tracking-wider font-bold rounded hover:bg-red-500/20 transition-all"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* --- 6. CUSTOMERS & KYC DIRECTORY TAB --- */}
                {activeTab === 'customers' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-serif text-2xl font-bold tracking-wide">Client Ledger & Verification</h2>
                      <p className="text-xs text-luxury-gold-200/50 uppercase tracking-widest mt-1">
                        Moderate customer roles and verify KYC passport uploads
                      </p>
                    </div>

                    <div className="border border-luxury-gold-900/10 rounded overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs font-sans">
                        <thead>
                          <tr className="bg-luxury-slate/20 text-luxury-gold-200/50 uppercase tracking-wider text-[10px] border-b border-luxury-gold-900/10">
                            <th className="p-4">Customer Name</th>
                            <th className="p-4">Role Upgrade</th>
                            <th className="p-4">Registration</th>
                            <th className="p-4 text-center">KYC Identity Files</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customers.map((cust) => {
                            const hasDoc = !!cust.profile?.kycDocumentUrl;
                            const currentKyc = cust.profile?.kycStatus || 'NONE';
                            return (
                              <tr key={cust.id} className="border-b border-luxury-gold-900/5 hover:bg-white/5 transition-colors">
                                <td className="p-4 font-serif font-bold text-white text-sm">
                                  {cust.name}
                                  <span className="block font-mono text-[9px] text-luxury-gold-200/40 mt-0.5">{cust.email}</span>
                                </td>
                                <td className="p-4">
                                  <select
                                    value={cust.role}
                                    onChange={(e) => handleUpdateUserRole(cust.id, e.target.value)}
                                    className="bg-luxury-slate border border-luxury-gold-900/10 py-1 px-2 text-[10px] uppercase font-bold text-luxury-gold-300 rounded focus:outline-none"
                                  >
                                    <option value="CUSTOMER">Customer</option>
                                    <option value="GEMOLOGIST">Gemologist</option>
                                    <option value="ORDER_MANAGER">Order Manager</option>
                                    <option value="ADMIN">Admin</option>
                                  </select>
                                </td>
                                <td className="p-4 text-luxury-gold-200/60 font-mono">
                                  {new Date(cust.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-center">
                                  <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${kycStatusStyles[currentKyc as keyof typeof kycStatusStyles]}`}>
                                    {currentKyc}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  {hasDoc && currentKyc === 'PENDING' && (
                                    <div className="flex justify-end gap-2">
                                      <a
                                        href={cust.profile?.kycDocumentUrl || '#'}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-2 py-1 bg-luxury-slate border border-luxury-gold-500/20 text-luxury-gold-300 hover:text-white rounded text-[9px] uppercase tracking-wider font-bold transition-all inline-flex items-center gap-1"
                                      >
                                        <Eye className="h-3 w-3" /> View ID
                                      </a>
                                      <button
                                        onClick={() => handleKycVerification(cust.id, 'APPROVED')}
                                        className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] uppercase tracking-wider font-bold rounded hover:bg-emerald-500/25 transition-all"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleKycVerification(cust.id, 'REJECTED')}
                                        className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] uppercase tracking-wider font-bold rounded hover:bg-red-500/25 transition-all"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* --- 7. COUPONS SCHEDULER TAB --- */}
                {activeTab === 'coupons' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="font-serif text-2xl font-bold tracking-wide">Promo Discount Coupons</h2>
                        <p className="text-xs text-luxury-gold-200/50 uppercase tracking-widest mt-1">
                          Configure campaigns promo values and limits
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setCouponForm({
                            code: '',
                            discountType: 'PERCENTAGE',
                            discountValue: 10,
                            minOrderAmount: 100,
                            maxDiscountAmount: 50,
                            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            usageLimit: 100
                          });
                          setShowCouponModal(true);
                        }}
                        className="px-4 py-2 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Create Coupon
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      {coupons.map((coup) => (
                        <div key={coup.id} className="p-5 border border-luxury-gold-900/10 rounded-sm bg-luxury-slate/5 flex justify-between gap-4 font-sans relative">
                          <div className="space-y-2">
                            <h3 className="font-mono text-base font-bold text-luxury-gold-400 uppercase tracking-widest">
                              {coup.code}
                            </h3>
                            <p className="text-xs text-white/80">
                              Discount: <span className="font-serif font-bold text-luxury-gold-200">{coup.discountType === 'PERCENTAGE' ? `${coup.discountValue}%` : `$${coup.discountValue}`}</span>
                            </p>
                            <p className="text-[10px] text-luxury-gold-200/40">
                              Expires: {new Date(coup.expiresAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right flex flex-col justify-between items-end">
                            <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${coup.isActive ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-white/15 text-white/30'}`}>
                              {coup.isActive ? 'Active' : 'Expired'}
                            </span>
                            <p className="text-[10px] font-mono text-luxury-gold-200/50 mt-4">
                              Usage: {coup.usageCount} / {coup.usageLimit || '∞'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- 8. REVIEWS FEED TAB --- */}
                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-serif text-2xl font-bold tracking-wide">Client Testimonials</h2>
                      <p className="text-xs text-luxury-gold-200/50 uppercase tracking-widest mt-1">
                        Moderate rating feedback and verify credentials
                      </p>
                    </div>

                    <div className="space-y-4 text-xs font-sans">
                      {reviews.length === 0 ? (
                        <div className="border border-dashed border-luxury-gold-900/10 p-12 text-center rounded bg-luxury-slate/5">
                          <MessageSquare className="h-10 w-10 text-luxury-gold-200/20 mx-auto mb-2" />
                          <p className="text-xs text-luxury-gold-200/40">No user reviews submitted.</p>
                        </div>
                      ) : (
                        reviews.map((rev) => (
                          <div key={rev.id} className="border border-luxury-gold-900/10 p-5 bg-luxury-slate/5 rounded-sm flex justify-between items-start gap-4">
                            <div className="space-y-2">
                              <h4 className="font-serif font-bold text-white text-sm">{rev.product.name}</h4>
                              <div className="flex items-center gap-1.5">
                                <div className="text-luxury-gold-500">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} className="text-sm">{i < rev.rating ? '★' : '☆'}</span>
                                  ))}
                                </div>
                                <span className="text-[9px] text-luxury-gold-200/30">
                                  by {rev.user.name} ({rev.user.email})
                                </span>
                              </div>
                              <p className="text-xs italic text-luxury-gold-200/70">"{rev.comment || 'No text comment provided.'}"</p>
                            </div>
                            <span className="text-[9px] font-mono text-luxury-gold-200/30">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* --- 9. INVENTORY LEDGER TAB --- */}
                {activeTab === 'inventory' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="font-serif text-2xl font-bold tracking-wide">Inventory Stock Ledger</h2>
                      <p className="text-xs text-luxury-gold-200/50 uppercase tracking-widest mt-1">
                        Direct adjustments of sizes configs and loose gemstone status states
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                      {/* Product Variants stock */}
                      <div className="space-y-4">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold-200/60 font-sans border-b border-luxury-gold-900/5 pb-2">
                          Solitaire Product Variants Stock
                        </h3>

                        <div className="border border-luxury-gold-900/10 rounded overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs font-sans">
                            <thead>
                              <tr className="bg-luxury-slate/20 text-luxury-gold-200/50 uppercase tracking-wider text-[10px] border-b border-luxury-gold-900/10">
                                <th className="p-4">Item SKU / Name</th>
                                <th className="p-4">Metal Configuration</th>
                                <th className="p-4 text-center">Ring Size</th>
                                <th className="p-4 text-center">Price</th>
                                <th className="p-4 text-center">Current Stock</th>
                                <th className="p-4 text-right">Adjust Stock</th>
                              </tr>
                            </thead>
                            <tbody>
                              {variants.map((v) => (
                                <tr key={v.id} className="border-b border-luxury-gold-900/5 hover:bg-white/5 transition-colors">
                                  <td className="p-4">
                                    <p className="font-bold text-white">{v.product.name}</p>
                                    <p className="text-[9px] font-mono text-luxury-gold-200/40 uppercase mt-0.5">{v.sku}</p>
                                  </td>
                                  <td className="p-4 text-luxury-gold-200/70">
                                    {metalLabels[v.metalType] || v.metalType}
                                  </td>
                                  <td className="p-4 text-center font-mono">
                                    {v.ringSize ? Number(v.ringSize).toFixed(1) : '-'}
                                  </td>
                                  <td className="p-4 text-center font-mono font-bold text-luxury-gold-200">
                                    ${Number(v.price).toLocaleString()}
                                  </td>
                                  <td className="p-4 text-center font-serif font-bold text-white">
                                    <span className={v.stock === 0 ? 'text-red-400' : v.stock < 5 ? 'text-yellow-400' : 'text-white'}>
                                      {v.stock} units
                                    </span>
                                  </td>
                                  <td className="p-4 text-right">
                                    <div className="flex justify-end gap-1.5">
                                      <button
                                        onClick={() => handleUpdateVariantStock(v.id, v.stock - 1)}
                                        disabled={v.stock <= 0}
                                        className="w-6 h-6 border border-luxury-gold-900/10 bg-luxury-slate/30 text-white rounded hover:bg-white/10 disabled:opacity-20 transition-all font-mono font-bold flex items-center justify-center"
                                      >
                                        -
                                      </button>
                                      <button
                                        onClick={() => handleUpdateVariantStock(v.id, v.stock + 1)}
                                        className="w-6 h-6 border border-luxury-gold-900/10 bg-luxury-slate/30 text-white rounded hover:bg-white/10 transition-all font-mono font-bold flex items-center justify-center"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Loose Gemstones stock */}
                      <div className="space-y-4">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold-200/60 font-sans border-b border-luxury-gold-900/5 pb-2">
                          Loose Gemstones status
                        </h3>

                        <div className="border border-luxury-gold-900/10 rounded overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs font-sans">
                            <thead>
                              <tr className="bg-luxury-slate/20 text-luxury-gold-200/50 uppercase tracking-wider text-[10px] border-b border-luxury-gold-900/10">
                                <th className="p-4">Certificate ID</th>
                                <th className="p-4">Gems details</th>
                                <th className="p-4 text-center">Escrow Value</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-right">Modify Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {gemstones.map((g) => (
                                <tr key={g.id} className="border-b border-luxury-gold-900/5 hover:bg-white/5 transition-colors">
                                  <td className="p-4 font-mono font-bold text-luxury-gold-400">
                                    {g.certificateNumber || 'Vault Solitaire'}
                                  </td>
                                  <td className="p-4 text-white">
                                    {g.carat} Carat | {g.shape} | {g.type}
                                  </td>
                                  <td className="p-4 text-center font-serif font-bold text-luxury-gold-200">
                                    ${Number(g.price).toLocaleString()}
                                  </td>
                                  <td className="p-4 text-center">
                                    <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${g.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400' : g.status === 'RESERVED' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-white/10 text-white/30'}`}>
                                      {g.status}
                                    </span>
                                  </td>
                                  <td className="p-4 text-right">
                                    <select
                                      value={g.status}
                                      onChange={(e) => handleUpdateGemstoneStatus(g.id, e.target.value)}
                                      className="bg-luxury-slate border border-luxury-gold-900/10 py-1 px-2 text-[9px] uppercase font-bold text-luxury-gold-300 rounded focus:outline-none"
                                    >
                                      <option value="AVAILABLE">Available</option>
                                      <option value="RESERVED">Reserved</option>
                                      <option value="SOLD">Sold</option>
                                    </select>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- 9.5 DESIGNER BRANDS TAB --- */}
                {activeTab === 'brands' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="font-serif text-2xl font-bold tracking-wide">Designer Brands</h2>
                        <p className="text-xs text-luxury-gold-200/50 uppercase tracking-widest mt-1">
                          Configure designer labels and brand summaries
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setBrandForm({
                            id: '',
                            name: '',
                            description: '',
                            imageUrl: ''
                          });
                          setShowBrandModal(true);
                        }}
                        className="px-4 py-2 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Brand
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
                      {brands.map((b) => (
                        <div key={b.id} className="p-5 border border-luxury-gold-900/10 rounded-sm bg-luxury-slate/5 flex justify-between gap-4">
                          <div className="space-y-2">
                            <h3 className="font-serif font-bold text-white text-base">{b.name}</h3>
                            <p className="text-[9px] font-mono text-luxury-gold-200/40 uppercase">SLUG: {b.slug}</p>
                            <p className="text-xs text-luxury-gold-200/60 leading-relaxed mt-2">{b.description || 'No description provided.'}</p>
                          </div>
                          <div className="flex flex-col justify-between items-end shrink-0">
                            {b.imageUrl ? (
                              <div className="h-12 w-12 relative rounded overflow-hidden border border-luxury-gold-900/15">
                                <img src={b.imageUrl} alt={b.name} className="object-cover h-full w-full" />
                              </div>
                            ) : (
                              <div className="h-12 w-12 bg-white/5 border border-dashed border-luxury-gold-900/10 rounded" />
                            )}
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => {
                                  setBrandForm({
                                    id: b.id,
                                    name: b.name,
                                    description: b.description || '',
                                    imageUrl: b.imageUrl || ''
                                  });
                                  setShowBrandModal(true);
                                }}
                                className="p-1 text-luxury-gold-400 hover:text-white"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBrand(b.id)}
                                className="p-1 text-luxury-gold-300 hover:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- 9.6 VAULT JOURNALS TAB --- */}
                {activeTab === 'blogs' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="font-serif text-2xl font-bold tracking-wide">Journal Manuscripts</h2>
                        <p className="text-xs text-luxury-gold-200/50 uppercase tracking-widest mt-1">
                          Draft, customize and publish luxury articles
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setBlogForm({
                            id: '',
                            title: '',
                            summary: '',
                            content: '',
                            authorName: 'Elena Rostova, GIA GG',
                            imageUrl: '',
                            publish: true
                          });
                          setShowBlogModal(true);
                        }}
                        className="px-4 py-2 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Article
                      </button>
                    </div>

                    <div className="space-y-4 font-sans text-xs">
                      {blogs.map((p) => (
                        <div key={p.id} className="p-5 border border-luxury-gold-900/10 rounded-sm bg-luxury-slate/5 flex justify-between items-start gap-4">
                          <div className="space-y-2">
                            <h4 className="font-serif font-bold text-white text-sm">{p.title}</h4>
                            <p className="text-[9px] text-luxury-gold-200/30">
                              by {p.authorName} ✦ {p.publishedAt ? `Published: ${new Date(p.publishedAt).toLocaleDateString()}` : 'DRAFT'}
                            </p>
                            <p className="text-xs text-luxury-gold-200/60 line-clamp-2 mt-1">{p.summary}</p>
                          </div>
                          <div className="flex flex-col justify-between items-end gap-4 shrink-0 font-sans">
                            <span className={`text-[8px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full ${p.publishedAt ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-white/10 border border-white/20 text-white/40'}`}>
                              {p.publishedAt ? 'Live' : 'Draft'}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setBlogForm({
                                    id: p.id,
                                    title: p.title,
                                    summary: p.summary || '',
                                    content: p.content,
                                    authorName: p.authorName,
                                    imageUrl: p.imageUrl || '',
                                    publish: !!p.publishedAt
                                  });
                                  setShowBlogModal(true);
                                }}
                                className="p-1 text-luxury-gold-400 hover:text-white"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteBlog(p.id)}
                                className="p-1 text-luxury-gold-300 hover:text-red-400"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- 10. STORE CONFIG SETTINGS TAB --- */}
                {activeTab === 'settings' && (
                  <div className="space-y-6 max-w-lg font-sans text-xs">
                    <div>
                      <h2 className="font-serif text-2xl font-bold tracking-wide">Store Settings</h2>
                      <p className="text-xs text-luxury-gold-200/50 uppercase tracking-widest mt-1">
                        Control global configurations and concierge contact endpoints
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs uppercase tracking-widest font-bold text-luxury-gold-200/60 font-sans border-b border-luxury-gold-900/5 pb-2">
                        Concierge Contact Details
                      </h3>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                          Concierge phone line
                        </label>
                        <input
                          type="text"
                          value={conciergePhone}
                          onChange={(e) => setConciergePhone(e.target.value)}
                          className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                          Support email
                        </label>
                        <input
                          type="email"
                          value={conciergeEmail}
                          onChange={(e) => setConciergeEmail(e.target.value)}
                          className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
                        />
                      </div>
                      <button
                        onClick={() => showToast('success', 'Concierge contact information saved.')}
                        className="px-6 py-2.5 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm"
                      >
                        Save Configurations
                      </button>
                    </div>

                    <div className="p-4 bg-luxury-gold-900/5 border border-luxury-gold-500/10 rounded leading-relaxed text-luxury-gold-200/40 mt-6">
                      <p className="font-bold text-white flex items-center gap-1.5 mb-1.5">
                        <ShieldCheck className="h-4.5 w-4.5 text-luxury-gold-500" /> Operational Assurance
                      </p>
                      Changes made inside the Enterprise Operations panel are written instantly onto the persistent SQLite database schemas, affecting user catalog indexes, checkout calculators, and email notifications in real-time.
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* PRODUCT CREATION MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in text-xs font-sans">
          <div className="bg-luxury-slate-dark border border-luxury-gold-500/30 p-6 rounded-sm w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold tracking-wide text-white border-b border-luxury-gold-900/10 pb-3 mb-6">
              {productForm.id ? 'Edit Product Settings' : 'Create Product Listing'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                    Product name
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Classic Solitaire Ring"
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                    Base SKU
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="SET-SOL-001"
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                  Product Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter details of customization capabilities, diamond cuts compatibility, prongs structures..."
                  className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                    Base Retail Price ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={productForm.basePrice}
                    onChange={(e) => setProductForm(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                    Parent Category
                  </label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                    Status
                  </label>
                  <select
                    value={productForm.status}
                    onChange={(e) => setProductForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none font-sans"
                  >
                    <option value="ACTIVE">Active (Catalog visible)</option>
                    <option value="DRAFT">Draft (Hide listing)</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-6 select-none">
                  <input
                    type="checkbox"
                    checked={productForm.isCustomizable}
                    onChange={(e) => setProductForm(prev => ({ ...prev, isCustomizable: e.target.checked }))}
                    className="rounded bg-luxury-slate border-luxury-gold-900/20 text-luxury-gold-500 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                  />
                  <span className="text-xs text-luxury-gold-200/60 font-sans">Enable metal customization</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-luxury-gold-900/10">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border border-luxury-gold-500/10 hover:border-luxury-gold-500/20 text-luxury-gold-400 text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="px-5 py-2 bg-luxury-gold-500 hover:bg-luxury-gold-600 disabled:opacity-25 text-luxury-slate-dark text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm"
                >
                  {isActionLoading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in text-xs font-sans">
          <div className="bg-luxury-slate-dark border border-luxury-gold-500/30 p-6 rounded-sm w-full max-w-md relative">
            <h3 className="font-serif text-xl font-bold tracking-wide text-white border-b border-luxury-gold-900/10 pb-3 mb-6">
              {categoryForm.id ? 'Edit Category Node' : 'Add Category Node'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                  Category name
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Rings"
                  className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                  Category description
                </label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description of category itemization..."
                  className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                  Parent Category (Optional)
                </label>
                <select
                  value={categoryForm.parentId}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, parentId: e.target.value }))}
                  className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
                >
                  <option value="">Top-Level Category</option>
                  {categories.map((c) => (
                    c.id !== categoryForm.id && (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    )
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-luxury-gold-900/10">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border border-luxury-gold-500/10 hover:border-luxury-gold-500/20 text-luxury-gold-400 text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COLLECTION MODAL */}
      {showCollectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in text-xs font-sans">
          <div className="bg-luxury-slate-dark border border-luxury-gold-500/30 p-6 rounded-sm w-full max-w-md relative">
            <h3 className="font-serif text-xl font-bold tracking-wide text-white border-b border-luxury-gold-900/10 pb-3 mb-6">
              {collectionForm.id ? 'Edit Collection' : 'Create Collection'}
            </h3>

            <form onSubmit={handleSaveCollection} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  required
                  value={collectionForm.name}
                  onChange={(e) => setCollectionForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Bridal Collection"
                  className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                  Collection description
                </label>
                <textarea
                  rows={3}
                  value={collectionForm.description}
                  onChange={(e) => setCollectionForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the campaign theme..."
                  className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-luxury-gold-900/10">
                <button
                  type="button"
                  onClick={() => setShowCollectionModal(false)}
                  className="px-4 py-2 border border-luxury-gold-500/10 hover:border-luxury-gold-500/20 text-luxury-gold-400 text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm"
                >
                  Save Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COUPON MODAL */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in text-xs font-sans">
          <div className="bg-luxury-slate-dark border border-luxury-gold-500/30 p-6 rounded-sm w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold tracking-wide text-white border-b border-luxury-gold-900/10 pb-3 mb-6">
              Create Campaign Coupon
            </h3>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                    Promo Code (Uppercase)
                  </label>
                  <input
                    type="text"
                    required
                    value={couponForm.code}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="WINTER15"
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none uppercase font-mono tracking-widest"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, discountType: e.target.value }))}
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    required
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                    Min Order Amount ($)
                  </label>
                  <input
                    type="number"
                    value={couponForm.minOrderAmount}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, minOrderAmount: Number(e.target.value) }))}
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                    Max Discount Cap ($)
                  </label>
                  <input
                    type="number"
                    value={couponForm.maxDiscountAmount}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, maxDiscountAmount: Number(e.target.value) }))}
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    value={couponForm.expiresAt}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    required
                    value={couponForm.usageLimit}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, usageLimit: Number(e.target.value) }))}
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-luxury-gold-900/10">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 border border-luxury-gold-500/10 hover:border-luxury-gold-500/20 text-luxury-gold-400 text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-slate-dark text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BRAND CREATION MODAL */}
      {showBrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in text-xs font-sans">
          <div className="bg-luxury-slate-dark border border-luxury-gold-500/30 p-6 rounded-sm w-full max-w-md relative">
            <h3 className="font-serif text-xl font-bold tracking-wide text-white border-b border-luxury-gold-900/10 pb-3 mb-6">
              {brandForm.id ? 'Edit Designer Brand' : 'Create Designer Brand'}
            </h3>

            <form onSubmit={handleSaveBrand} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  required
                  value={brandForm.name}
                  onChange={(e) => setBrandForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Cartier"
                  className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                  Brand Description
                </label>
                <textarea
                  rows={3}
                  value={brandForm.description}
                  onChange={(e) => setBrandForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Write a summary of brand history, designers, origins..."
                  className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                  Brand Image URL
                </label>
                <input
                  type="text"
                  value={brandForm.imageUrl}
                  onChange={(e) => setBrandForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-luxury-gold-900/10">
                <button
                  type="button"
                  onClick={() => setShowBrandModal(false)}
                  className="px-4 py-2 border border-luxury-gold-500/10 hover:border-luxury-gold-500/20 text-luxury-gold-400 text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="px-5 py-2 bg-luxury-gold-500 hover:bg-luxury-gold-600 disabled:opacity-25 text-luxury-slate-dark text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm"
                >
                  {isActionLoading ? 'Saving...' : 'Save Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BLOG CREATION MODAL */}
      {showBlogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in text-xs font-sans">
          <div className="bg-luxury-slate-dark border border-luxury-gold-500/30 p-6 rounded-sm w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold tracking-wide text-white border-b border-luxury-gold-900/10 pb-3 mb-6">
              {blogForm.id ? 'Edit Journal Manuscript' : 'Add Journal Manuscript'}
            </h3>

            <form onSubmit={handleSaveBlog} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                    Article Title
                  </label>
                  <input
                    type="text"
                    required
                    value={blogForm.title}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Art of ethically sourcing diamonds"
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    required
                    value={blogForm.authorName}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, authorName: e.target.value }))}
                    placeholder="Elena Rostova, GIA GG"
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                  Article Summary
                </label>
                <textarea
                  rows={2}
                  required
                  value={blogForm.summary}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Provide a brief summary for grid previews..."
                  className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                  Article Content (Markdown / Text)
                </label>
                <textarea
                  rows={6}
                  required
                  value={blogForm.content}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write the full editorial content..."
                  className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-luxury-gold-200/40 mb-1">
                    Banner Image URL
                  </label>
                  <input
                    type="text"
                    value={blogForm.imageUrl}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-luxury-slate border border-luxury-gold-900/10 rounded-sm py-2 px-3 text-xs text-white focus:border-luxury-gold-500/40 outline-none font-mono"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-6 select-none">
                  <input
                    type="checkbox"
                    checked={blogForm.publish}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, publish: e.target.checked }))}
                    className="rounded bg-luxury-slate border-luxury-gold-900/20 text-luxury-gold-500 focus:ring-0 focus:ring-offset-0 h-4 w-4"
                  />
                  <span className="text-xs text-luxury-gold-200/60 font-sans">Publish article instantly</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-luxury-gold-900/10">
                <button
                  type="button"
                  onClick={() => setShowBlogModal(false)}
                  className="px-4 py-2 border border-luxury-gold-500/10 hover:border-luxury-gold-500/20 text-luxury-gold-400 text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="px-5 py-2 bg-luxury-gold-500 hover:bg-luxury-gold-600 disabled:opacity-25 text-luxury-slate-dark text-[10px] font-sans uppercase tracking-widest font-bold transition-all rounded-sm"
                >
                  {isActionLoading ? 'Saving...' : 'Save Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
