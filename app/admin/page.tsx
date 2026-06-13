'use client';

import React, { useState, useEffect, useTransition, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  FileText,
  Lock,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  PlusCircle,
  Eye,
  TrendingUp,
  Coins,
  ShieldCheck,
  ArrowLeft,
  Settings,
  AlertTriangle,
  FolderPlus,
  Star,
  Icon,
  Images,
  CircleHelp,
  MessageSquare,
  Truck,
  Menu,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  getAdminData,
  verifyAdminPassword,
  saveProductAction,
  deleteProductAction,
  saveCategoryAction,
  deleteCategoryAction,
  updateOrderStatusAction,
  deleteOrderAction,
  updateSiteContentAction,
  deleteReviewAction,
  saveReviewAction,
  uploadImageAction,
  saveGalleryItemAction,
  deleteGalleryItemAction,
  saveFaqItemAction,
  deleteFaqItemAction,
  saveShippingChargeAction,
  deleteShippingChargeAction,
  getContactMessagesAction,
  deleteContactMessageAction,
} from '../actions';
import {
  Category,
  Product,
  Order,
  Review,
  SiteContent,
  GalleryItem,
  FaqItem,
  ShippingCharge,
} from '@/lib/types';
import { AdminOrderNotification } from '@/components/admin-order-notification';
import { ImageUploadField } from '@/components/image-upload-field';
import { compressImageForUpload } from '@/lib/compress-image';
import {
  ADMIN_TAB_TITLES,
  adminScrollKey,
  isAdminTab,
  type AdminTab,
} from '@/lib/admin-tabs';

export default function AdminDashboardPage() {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminData, setAdminData] = useState<{
    categories: Category[];
    products: Product[];
    orders: Order[];
    reviews: Review[];
    siteContent: SiteContent;
    galleryItems: GalleryItem[];
    faqItems: FaqItem[];
    shippingCharges: ShippingCharge[];
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  
  // Transition support
  const [isPending, startTransition] = useTransition();
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [contactMessages, setContactMessages] = useState<Array<{
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: string;
  }>>([]);

  // Dialog states for Product
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Dialog states for Category
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  const [editingGallery, setEditingGallery] = useState<Partial<GalleryItem> | null>(null);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);
  const [editingReview, setEditingReview] = useState<Partial<Review> | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Partial<FaqItem> | null>(null);
  const [editingShipping, setEditingShipping] = useState<Partial<ShippingCharge> | null>(null);
  const [showShippingDialog, setShowShippingDialog] = useState(false);

  // Expanded orders tracker
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  // Status for Custom Toaster
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: 'success' | 'error' }>>([]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleImageUpload = async (file: File, applyUrl: (url: string) => void, fieldKey = 'default') => {
    if (!password) {
      showToast('Please login first', 'error');
      return;
    }

    setUploadingImage(fieldKey);
    try {
      const compressed = await compressImageForUpload(file);
      const formData = new FormData();
      formData.append('image', compressed);
      const res = await uploadImageAction(password, formData);

      if (res.success && res.url) {
        applyUrl(res.url);
        showToast('Image uploaded to ImgBB', 'success');
      } else {
        showToast(res.error || 'ImgBB upload failed', 'error');
      }
    } catch {
      showToast('ImgBB upload failed', 'error');
    } finally {
      setUploadingImage(null);
    }
  };

  const selectTab = useCallback((tab: AdminTab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${tab}`);
      sessionStorage.setItem('khanfoods_admin_tab', tab);
    }
  }, []);

  // Restore tab from URL hash or session on load
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (isAdminTab(hash)) {
      setActiveTab(hash);
      return;
    }
    const saved = sessionStorage.getItem('khanfoods_admin_tab');
    if (saved && isAdminTab(saved)) {
      setActiveTab(saved);
      window.history.replaceState(null, '', `#${saved}`);
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (isAdminTab(hash)) setActiveTab(hash);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Persist scroll position per tab
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    let timeout: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        sessionStorage.setItem(adminScrollKey(activeTab), String(el.scrollTop));
      }, 120);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      clearTimeout(timeout);
    };
  }, [activeTab]);

  // Restore scroll after reload / tab switch
  useEffect(() => {
    if (!isLoggedIn || !adminData) return;
    const el = mainRef.current;
    if (!el) return;
    const saved = sessionStorage.getItem(adminScrollKey(activeTab));
    const scrollTo = saved ? Number.parseInt(saved, 10) : 0;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.scrollTop = Number.isFinite(scrollTo) ? scrollTo : 0;
      });
    });
  }, [activeTab, isLoggedIn, adminData]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  // Re-fetch admin data
  const refreshContactMessages = async (pwd: string) => {
    const res = await getContactMessagesAction(pwd);
    if (res.success && res.messages) {
      setContactMessages(res.messages);
    }
  };

  const refreshAdminData = async (pwd: string) => {
    setLoading(true);
    const res = await getAdminData(pwd);
    if (res.success && res.categories) {
      setAdminData({
        categories: res.categories,
        products: res.products || [],
        orders: res.orders || [],
        reviews: res.reviews || [],
        siteContent: res.siteContent!,
        galleryItems: res.galleryItems || [],
        faqItems: res.faqItems || [],
        shippingCharges: res.shippingCharges || [],
      });
      setIsLoggedIn(true);
      localStorage.setItem('khanfoods_admin_key', pwd);
      if (typeof window !== 'undefined' && !window.location.hash) {
        window.history.replaceState(null, '', `#${activeTab}`);
      }
      void refreshContactMessages(pwd);
    } else {
      showToast(res.error || 'Access Denied', 'error');
      localStorage.removeItem('khanfoods_admin_key');
    }
    setLoading(false);
  };

  // Check login on load
  useEffect(() => {
    const cachedKey = localStorage.getItem('khanfoods_admin_key');
    if (cachedKey) {
      setTimeout(() => {
        setPassword(cachedKey);
        refreshAdminData(cachedKey);
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      showToast('Please type password', 'error');
      return;
    }
    refreshAdminData(password);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword('');
    setAdminData(null);
    localStorage.removeItem('khanfoods_admin_key');
    showToast('Admin logged out securely');
  };

  // PRODUCT CRUD SAVE
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price || !editingProduct?.category) {
      showToast('Fill in all necessary columns', 'error');
      return;
    }

    startTransition(async () => {
      const res = await saveProductAction(password, {
        ...editingProduct,
        stock: editingProduct.stock ?? 999,
      });
      if (res.success) {
        showToast(editingProduct.id ? 'Product updated successfully' : 'Product created successfully', 'success');
        setShowProductDialog(false);
        setEditingProduct(null);
        refreshAdminData(password);
      } else {
        showToast(res.error || 'Failed to save product', 'error');
      }
    });
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete ${name}?`)) {
      return;
    }

    const res = await deleteProductAction(password, id);
    if (res.success) {
      showToast('Product successfully removed', 'success');
      refreshAdminData(password);
    } else {
      showToast(res.error || 'Delete product failed', 'error');
    }
  };

  // CATEGORY CRUD SAVE
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) {
      showToast('Category name is required', 'error');
      return;
    }

    startTransition(async () => {
      const res = await saveCategoryAction(password, editingCategory);
      if (res.success) {
        showToast(editingCategory.id ? 'Category updated' : 'Category created', 'success');
        setShowCategoryDialog(false);
        setEditingCategory(null);
        refreshAdminData(password);
      } else {
        showToast(res.error || 'Category save failed', 'error');
      }
    });
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete Category '${name}'?`)) {
      return;
    }

    const res = await deleteCategoryAction(password, id);
    if (res.success) {
      showToast('Category successfully deleted', 'success');
      refreshAdminData(password);
    } else {
      showToast(res.error || 'Delete category failed', 'error');
    }
  };

  const handleSaveGallery = () => {
    if (!editingGallery?.title || !editingGallery.image) {
      showToast('Title and image are required', 'error');
      return;
    }

    startTransition(async () => {
      const res = await saveGalleryItemAction(password, {
        id: editingGallery.id || '',
        title: editingGallery.title!,
        titleBn: editingGallery.titleBn,
        description: editingGallery.description || '',
        descriptionBn: editingGallery.descriptionBn,
        image: editingGallery.image!,
        slot: editingGallery.slot ?? 1,
        sortOrder: editingGallery.sortOrder ?? 0,
      });
      if (res.success) {
        showToast('Gallery item saved', 'success');
        setEditingGallery(null);
        setShowGalleryDialog(false);
        refreshAdminData(password);
      } else {
        showToast(res.error || 'Gallery save failed', 'error');
      }
    });
  };

  const handleDeleteGallery = async (id: string, title?: string) => {
    if (!window.confirm(`"${title || 'এই আইটেম'}" গ্যালারি থেকে মুছে ফেলবেন?`)) return;
    const res = await deleteGalleryItemAction(password, id);
    if (res.success) {
      showToast('গ্যালারি আইটেম মুছে ফেলা হয়েছে', 'success');
      if (editingGallery?.id === id) {
        setEditingGallery(null);
        setShowGalleryDialog(false);
      }
      refreshAdminData(password);
    } else {
      showToast(res.error || 'Delete failed', 'error');
    }
  };

  const openGalleryEditor = (item?: Partial<GalleryItem>) => {
    if (item) {
      setEditingGallery(item);
    } else if (adminData) {
      setEditingGallery({
        title: '',
        titleBn: '',
        description: '',
        descriptionBn: '',
        image: '',
        slot: 1,
        sortOrder: adminData.galleryItems.length,
      });
    }
    setShowGalleryDialog(true);
  };

  const handleSaveFaq = () => {
    if (!editingFaq?.question || !editingFaq.answer) {
      showToast('Question and answer are required', 'error');
      return;
    }

    startTransition(async () => {
      const res = await saveFaqItemAction(password, {
        id: editingFaq.id || '',
        question: editingFaq.question!,
        questionBn: editingFaq.questionBn,
        answer: editingFaq.answer!,
        answerBn: editingFaq.answerBn,
        sortOrder: editingFaq.sortOrder ?? 0,
      });
      if (res.success) {
        showToast('FAQ item saved', 'success');
        setEditingFaq(null);
        refreshAdminData(password);
      } else {
        showToast(res.error || 'FAQ save failed', 'error');
      }
    });
  };

  const handleDeleteFaq = async (id: string) => {
    if (!window.confirm('Delete this FAQ item?')) return;
    const res = await deleteFaqItemAction(password, id);
    if (res.success) {
      showToast('FAQ item deleted', 'success');
      refreshAdminData(password);
    } else {
      showToast(res.error || 'Delete failed', 'error');
    }
  };

  const handleSaveReview = () => {
    if (!editingReview?.name || !editingReview.text) {
      showToast('নাম ও রিভিউ টেক্সট দিন', 'error');
      return;
    }
    startTransition(async () => {
      const res = await saveReviewAction(password, {
        id: editingReview.id || '',
        name: editingReview.name!,
        rating: editingReview.rating ?? 5,
        text: editingReview.text!,
        image: editingReview.image || '',
        role: editingReview.role,
        roleBn: editingReview.roleBn,
      });
      if (res.success) {
        showToast(editingReview.id ? 'রিভিউ আপডেট হয়েছে' : 'নতুন রিভিউ যোগ হয়েছে', 'success');
        setEditingReview(null);
        setShowReviewDialog(false);
        refreshAdminData(password);
      } else {
        showToast(res.error || 'Review save failed', 'error');
      }
    });
  };

  const handleDeleteReview = async (id: string, name?: string) => {
    if (!window.confirm(`"${name || 'এই রিভিউ'}" মুছে ফেলবেন?`)) return;
    startTransition(async () => {
      const res = await deleteReviewAction(password, id);
      if (res.success) {
        showToast('রিভিউ মুছে ফেলা হয়েছে', 'success');
        if (editingReview?.id === id) {
          setEditingReview(null);
          setShowReviewDialog(false);
        }
        refreshAdminData(password);
      } else {
        showToast(res.error || 'Failed to delete review', 'error');
      }
    });
  };

  const handleSaveShipping = () => {
    if (!editingShipping?.name || editingShipping.fee === undefined) {
      showToast('নাম ও চার্জ দিন', 'error');
      return;
    }

    startTransition(async () => {
      const res = await saveShippingChargeAction(password, {
        id: editingShipping.id || '',
        name: editingShipping.name!,
        nameBn: editingShipping.nameBn,
        fee: Number(editingShipping.fee),
        sortOrder: editingShipping.sortOrder ?? 0,
        active: editingShipping.active !== false,
      });
      if (res.success) {
        showToast(editingShipping.id ? 'শিপিং চার্জ আপডেট হয়েছে' : 'নতুন শিপিং চার্জ যোগ হয়েছে', 'success');
        setEditingShipping(null);
        setShowShippingDialog(false);
        refreshAdminData(password);
      } else {
        showToast(res.error || 'Save failed', 'error');
      }
    });
  };

  const handleDeleteShipping = async (id: string, name?: string) => {
    if (!window.confirm(`"${name || 'এই চার্জ'}" মুছে ফেলবেন?`)) return;
    const res = await deleteShippingChargeAction(password, id);
    if (res.success) {
      showToast('শিপিং চার্জ মুছে ফেলা হয়েছে', 'success');
      if (editingShipping?.id === id) {
        setEditingShipping(null);
        setShowShippingDialog(false);
      }
      refreshAdminData(password);
    } else {
      showToast(res.error || 'Delete failed', 'error');
    }
  };

  const openShippingEditor = (item?: Partial<ShippingCharge>) => {
    if (item) {
      setEditingShipping(item);
    } else {
      setEditingShipping({
        name: '',
        nameBn: '',
        fee: 80,
        sortOrder: adminData?.shippingCharges.length ?? 0,
        active: true,
      });
    }
    setShowShippingDialog(true);
  };

  const openReviewEditor = (item?: Partial<Review>) => {
    if (item) {
      setEditingReview(item);
    } else {
      setEditingReview({
        name: '',
        rating: 5,
        text: '',
        image: '',
        role: '',
        roleBn: '',
      });
    }
    setShowReviewDialog(true);
  };

  // ORDER CHANGE STATUS 
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    const res = await updateOrderStatusAction(password, orderId, status);
    if (res.success) {
      showToast(`Order status updated to ${status}`, 'success');
      refreshAdminData(password);
    } else {
      showToast(res.error || 'Update status failed', 'error');
    }
  };

  const handleDeleteOrder = async (orderId: string, code: string) => {
    if (!window.confirm(`Delete Order record ${code}?`)) {
      return;
    }

    const res = await deleteOrderAction(password, orderId);
    if (res.success) {
      showToast('Order record removed', 'success');
      refreshAdminData(password);
    } else {
      showToast(res.error || 'Failed to delete order', 'error');
    }
  };

  // CONTENT SAVE
  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminData) return;

    startTransition(async () => {
      const res = await updateSiteContentAction(password, adminData.siteContent);
      if (res.success) {
        showToast('Site content settings updated instantly', 'success');
        refreshAdminData(password);
      } else {
        showToast(res.error || 'Save failed', 'error');
      }
    });
  };

  // Stats operations
  const totalRevenue = adminData?.orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.amount, 0) || 0;

  const totalProductsCount = adminData?.products.length || 0;
  const totalCategoriesCount = adminData?.categories.length || 0;
  const totalOrdersCount = adminData?.orders.length || 0;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4">
        {/* Simple Return Link */}
        <Link href="/" className="absolute top-6 left-6 text-xs uppercase tracking-widest font-bold text-stone-400 hover:text-white transition flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Go back to Shop
        </Link>

        {/* Custom Admin Toaster */}
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`p-4 rounded-xl shadow-xl text-sm font-bold border-l-4 ${
                t.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-950' : 'bg-[#fef8f2] border-[#1a234d] text-[#1a234d]'
              }`}
            >
              {t.message}
            </div>
          ))}
        </div>

        {/* Lock Card Layout */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-stone-100"
        >
          <div className="text-center mb-8">
            <span className="bg-[#fef8f2] text-[#1a234d] rounded-2xl w-14 h-14 flex items-center justify-center mx-auto mb-4 border border-[#f5b075]/40 shadow-sm font-black text-xl">
              KF
            </span>
            <h1 className="font-serif text-2xl font-black text-stone-900">
              Khan Foods Admin Portal
            </h1>
            <p className="text-stone-400 text-xs mt-1 uppercase tracking-wider font-extrabold">
              Verify Credentials to Continue
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase font-extrabold tracking-widest text-[#111827] mb-1.5">
                Secret Access Code
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Enter secret password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-stone-800 bg-stone-50 border border-stone-200 text-sm px-4 py-3 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a234d]/20 focus:border-[#1a234d] transition"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#1a234d] hover:bg-black text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-xl mt-4 flex items-center justify-center gap-1.5"
            >
              {loading ? 'Authenticating...' : 'Enter Console'}
            </button>
          </form>

          <p className="text-center text-[10px] text-stone-400 mt-6 lowercase">
            Default Security code is <span className="font-extrabold text-stone-700 uppercase">admin123</span>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] h-[100dvh] bg-[#F8FAFC] flex overflow-hidden text-stone-900 selection:bg-[#1a234d] selection:text-white">
      <AdminOrderNotification
        password={password}
        isLoggedIn={isLoggedIn}
        onViewOrder={() => selectTab('orders')}
      />
      {/* Dynamic Toaster */}
      <div className="fixed top-4 right-4 left-4 sm:left-auto z-[60] flex flex-col gap-2 max-w-sm sm:max-w-sm ml-auto">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-3 sm:p-4 rounded-xl shadow-2xl text-xs font-black uppercase tracking-wider border-l-4 flex items-center gap-2 ${
              t.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-950' : 'bg-[#fef8f2] border-[#1a234d] text-[#1a234d]'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* ADMIN SIDEBAR NAVIGATION */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-[100dvh] w-72 max-w-[88vw] md:w-64 bg-stone-900 text-stone-100 flex flex-col justify-between shrink-0 border-r border-stone-800 transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 sm:p-6 border-b border-stone-800 flex items-center gap-2 relative">
            <span className="bg-[#1a234d] text-white rounded p-1.5 font-bold text-xs">KF</span>
            <div className="min-w-0">
              <span className="font-serif font-black text-lg block leading-none text-white">Console</span>
              <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#f5b075]">Khan Foods HQ</span>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-stone-800 text-stone-300"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-3 sm:p-4 space-y-1">
            <button
              onClick={() => selectTab('overview')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-bold transition text-left cursor-pointer ${
                activeTab === 'overview' ? 'bg-[#1a234d] text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" /> Overview Dashboard
            </button>

            <button
              onClick={() => selectTab('products')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-bold transition text-left cursor-pointer ${
                activeTab === 'products' ? 'bg-[#1a234d] text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" /> Manage Products
            </button>

            <button
              onClick={() => selectTab('categories')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-bold transition text-left cursor-pointer ${
                activeTab === 'categories' ? 'bg-[#1a234d] text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" /> Categories Group
            </button>

            <button
              onClick={() => selectTab('orders')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-bold transition text-left cursor-pointer ${
                activeTab === 'orders' ? 'bg-[#1a234d] text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 shrink-0" /> Order Records
              {adminData && adminData.orders.filter(o => o.status === 'Pending').length > 0 && (
                <span className="ml-auto bg-amber-500 text-stone-900 text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                  {adminData.orders.filter(o => o.status === 'Pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => selectTab('content')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-bold transition text-left cursor-pointer ${
                activeTab === 'content' ? 'bg-[#1a234d] text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" /> Content Manager
            </button>

            <button
              onClick={() => selectTab('gallery')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-bold transition text-left cursor-pointer ${
                activeTab === 'gallery' ? 'bg-[#1a234d] text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Images className="w-4 h-4 shrink-0" /> Gallery Manager
            </button>

            <button
              onClick={() => selectTab('faq')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-bold transition text-left cursor-pointer ${
                activeTab === 'faq' ? 'bg-[#1a234d] text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <CircleHelp className="w-4 h-4 shrink-0" /> FAQ Manager
            </button>

            <button
              onClick={() => selectTab('shipping')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-bold transition text-left cursor-pointer ${
                activeTab === 'shipping' ? 'bg-[#1a234d] text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4 shrink-0" /> Shipping Charges
            </button>

            <button
              onClick={() => selectTab('messages')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-bold transition text-left cursor-pointer ${
                activeTab === 'messages' ? 'bg-[#1a234d] text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" /> Contact Messages
              {contactMessages.length > 0 && (
                <span className="ml-auto bg-[#f5b075] text-[#1a234d] text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {contactMessages.length}
                </span>
              )}
            </button>

            <button
              onClick={() => selectTab('reviews')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-bold transition text-left cursor-pointer ${
                activeTab === 'reviews' ? 'bg-[#1a234d] text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" /> Review Testimonials
            </button>
          </nav>
        </div>

        <div className="p-3 sm:p-4 border-t border-stone-800 space-y-2 shrink-0">
          <Link href="/" className="w-full flex items-center justify-center gap-1 bg-stone-800 text-stone-300 hover:text-white py-2.5 rounded-lg text-xs font-bold transition">
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Shop
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1 bg-[#fef8f2]/10 hover:bg-[#1a234d] hover:text-white text-[#f5b075] py-2.5 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout Session
          </button>
        </div>
      </aside>

      {/* MAIN ADMIN AREA CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="md:hidden shrink-0 sticky top-0 z-30 bg-white border-b border-stone-200 px-4 py-3 flex items-center gap-3 shadow-sm">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 rounded-lg hover:bg-stone-100 text-stone-800"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1a234d] block">HQ Console</span>
            <h2 className="font-serif text-base font-black text-stone-900 truncate">{ADMIN_TAB_TITLES[activeTab]}</h2>
          </div>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-10">
        {/* HQ Header block */}
        <div className="hidden md:flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-4 border-b pb-6 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a234d]">
              HQ Management Command
            </span>
            <h1 className="font-serif text-2xl lg:text-3xl font-black text-stone-900">
              {ADMIN_TAB_TITLES[activeTab]}
            </h1>
          </div>

          <div className="text-xs space-y-0.5 text-stone-500 text-right font-medium self-start sm:self-auto">
            <span className="block text-stone-950 font-bold">Secure Connection: Active</span>
            <span>MongoDB Atlas Connected</span>
          </div>
        </div>

        {/* METRICS / STATS OVERVIEW SECTION */}
        {activeTab === 'overview' && adminData && (
          <div className="space-y-10">
            {/* Bento Grid cards metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-stone-100 p-6 rounded-2xl shadow-sm hover:shadow transition">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs uppercase tracking-wider text-stone-400 font-extrabold">Gross Revenue BDT</span>
                  <Coins className="w-5 h-5 text-[#1a234d]" />
                </div>
                <span className="block text-2xl font-black text-stone-950">{totalRevenue.toLocaleString()} BDT</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1 uppercase tracking-widest">
                  Orders Included
                </span>
              </div>

              <div className="bg-white border border-stone-100 p-6 rounded-2xl shadow-sm hover:shadow transition">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs uppercase tracking-wider text-stone-400 font-extrabold">Active Orders</span>
                  <Package className="w-5 h-5 text-[#1a234d]" />
                </div>
                <span className="block text-2xl font-black text-stone-950">{totalOrdersCount} Records</span>
                <span className="text-[10px] text-zinc-500 font-semibold block mt-1 uppercase">
                  {adminData.orders.filter(o => o.status === 'Pending').length} Pending Validation
                </span>
              </div>

              <div className="bg-white border border-stone-100 p-6 rounded-2xl shadow-sm hover:shadow transition">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs uppercase tracking-wider text-stone-400 font-extrabold">Store Catalog</span>
                  <ShoppingBag className="w-5 h-5 text-[#1a234d]" />
                </div>
                <span className="block text-2xl font-black text-stone-950">{totalProductsCount} Products</span>
                <span className="text-[10px] text-stone-500 font-bold block mt-1 uppercase">
                  Catalog Active
                </span>
              </div>

              <div className="bg-white border border-stone-100 p-6 rounded-2xl shadow-sm hover:shadow transition">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs uppercase tracking-wider text-stone-400 font-extrabold">Taxonomies</span>
                  <Layers className="w-5 h-5 text-[#1a234d]" />
                </div>
                <span className="block text-2xl font-black text-stone-950">{totalCategoriesCount} Shelves</span>
                <span className="text-[10px] text-stone-500 font-bold block mt-1 uppercase">
                  Organized & Managed
                </span>
              </div>
            </div>

            {/* Quick insights logs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Latest activity logs */}
              <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif text-lg font-bold text-stone-900 mb-4 flex items-center gap-1.5">
                  <Package className="w-5 h-5 text-[#1a234d]" /> Recent Shipping Requests
                </h3>

                <div className="divide-y divide-stone-100">
                  {adminData.orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold font-mono tracking-tight text-[#1a234d] block">{o.orderNumber}</span>
                        <span className="text-xs text-stone-500 font-medium">{o.customerName} | {o.phone}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs font-black text-stone-950">{o.amount.toLocaleString()} BDT</span>
                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded mt-0.5 ${
                          o.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          o.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                          o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-800'
                        }`}>
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified food reviews review board */}
              <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif text-lg font-bold text-stone-900 mb-4 flex items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-[#1a234d]" /> Registered Testimonials
                </h3>

                <div className="divide-y divide-stone-100 max-h-[300px] overflow-y-auto">
                  {adminData.reviews.map((r) => (
                    <div key={r.id} className="py-3.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900">{r.name}</span>
                        <div className="flex text-amber-500 scale-75">
                          {[...Array(5)].map((_, i) => (
                            <Check key={i} className={`w-3.5 h-3.5 fill-current ${i < r.rating ? '' : 'opacity-20'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-stone-500 leading-normal italic">
                        &ldquo;{r.text}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && adminData && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setEditingProduct({
                    name: '', price: 0, discount: 0, description: '', category: adminData.categories[0]?.name || '', stock: 999, status: 'Active', image: '', freeShipping: false
                  });
                  setShowProductDialog(true);
                }}
                className="bg-[#1a234d] hover:bg-black text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center gap-1 shadow-md shadow-[#1a234d]/20"
              >
                <PlusCircle className="w-4 h-4" /> Create Premium Product
              </button>
            </div>

            {/* List products table wrapper */}
            <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500 text-xs font-black uppercase tracking-wider border-b border-stone-100">
                      <th className="p-4 pl-6">Picture</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4 text-right">Raw Price</th>
                      <th className="p-4 text-right">Discount</th>
                      <th className="p-4 text-center">Security Status</th>
                      <th className="p-4 pr-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {adminData.products.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50/50 transition duration-150">
                        <td className="p-4 pl-6">
                          <div className="relative w-12 h-12 bg-stone-50 border rounded-lg overflow-hidden">
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </td>
                        <td className="p-4 font-bold text-stone-900 max-w-xs">{p.name}</td>
                        <td className="p-4 text-xs font-bold text-stone-400">{p.category}</td>
                        <td className="p-4 text-right font-bold text-stone-800">{p.price.toLocaleString()} BDT</td>
                        <td className="p-4 text-right text-[#1a234d] font-extrabold">{p.discount}%</td>
                        <td className="p-4 text-center">
                          <span className={`inline-block text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full ${
                            p.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setShowProductDialog(true);
                              }}
                              className="p-2 hover:bg-blue-50 text-stone-600 hover:text-blue-600 rounded-lg transition"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-2 hover:bg-[#fef8f2] text-stone-600 hover:text-[#f5b075] rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CATEGORY TAXONOMY GROUP */}
        {activeTab === 'categories' && adminData && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setEditingCategory({ name: '', slug: '', icon: 'Droplets' });
                  setShowCategoryDialog(true);
                }}
                className="bg-[#1a234d] hover:bg-black text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" /> Create Category Group
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminData.categories.map((c) => {
                const associatedCount = adminData.products.filter(p => p.category === c.name).length;
                return (
                  <div key={c.id} className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="text-[10px] bg-[#fef8f2] text-[#1a234d] font-extrabold uppercase px-2.5 py-1 rounded-full">
                          Icon Tag: {c.icon}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingCategory(c);
                              setShowCategoryDialog(true);
                            }}
                            className="p-1.5 hover:bg-stone-100 text-stone-500 rounded hover:text-blue-600 transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.id, c.name)}
                            className="p-1.5 hover:bg-stone-100 text-stone-500 rounded hover:text-[#f5b075] transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-[#1a234d] transition mb-1 leading-none">
                        {c.name}
                      </h3>
                      <p className="text-stone-400 text-xs font-mono font-medium">Slug Target: /{c.slug}</p>
                    </div>

                    <div className="pt-4 mt-6 border-t border-stone-50 flex justify-between items-center text-xs text-stone-500 font-bold">
                      <span>Total products synced:</span>
                      <span className="text-stone-950 font-black font-mono">{associatedCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ORDER RECORDS */}
        {activeTab === 'orders' && adminData && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
              <div>
                <h3 className="font-serif text-2xl font-black text-stone-900">Secure COD Shipping Orders</h3>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-0.5">
                  Real-time database records of raw food seekers of Bangladesh
                </p>
              </div>
            </div>

            {adminData.orders.length === 0 ? (
              <div className="bg-white border border-stone-100 rounded-3xl p-12 text-center text-stone-400 font-bold">
                No e-commerce orders recorded in system database.
              </div>
            ) : (
              <div className="bg-white border border-stone-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[700px]">
                    <thead>
                      <tr className="bg-stone-50 text-stone-500 font-black uppercase tracking-wider border-b border-stone-100 text-[10px]">
                        <th className="p-4 pl-6">Order Code</th>
                        <th className="p-4">Customer Info</th>
                        <th className="p-4">Delivery Address</th>
                        <th className="p-4 text-right">Total Invoice</th>
                        <th className="p-4 text-center">Processing Stage</th>
                        <th className="p-4 pr-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {adminData.orders.map((o) => {
                        const isExpanded = !!expandedOrders[o.id];
                        const dateString = o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A';
                        
                        return (
                          <React.Fragment key={o.id}>
                            <tr className={`hover:bg-stone-50/50 transition duration-150 ${isExpanded ? 'bg-stone-50/30' : ''}`}>
                              <td className="p-4 pl-6">
                                <span className="font-mono text-xs font-black text-stone-950 block">{o.orderNumber}</span>
                                <span className="text-[10px] text-stone-400 font-semibold">{dateString}</span>
                              </td>
                              <td className="p-4">
                                <span className="font-bold text-stone-900 block">{o.customerName}</span>
                                <span className="text-[10px] font-mono text-stone-500 flex items-center gap-1 mt-0.5">
                                  {o.phone}
                                </span>
                              </td>
                              <td className="p-4 font-medium text-stone-600 max-w-xs truncate" title={o.address}>
                                {o.address}
                              </td>
                              <td className="p-4 text-right font-black text-[#1a234d] text-xs sm:text-sm">
                                {o.amount.toLocaleString()} BDT
                              </td>
                              <td className="p-4 text-center">
                                <select
                                  value={o.status || 'Pending'}
                                  onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as Order['status'])}
                                  className={`bg-stone-50 border text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1a234d]/20 cursor-pointer ${
                                    o.status === 'Delivered' ? 'border-emerald-200 text-emerald-700 bg-emerald-50/50' :
                                    o.status === 'Cancelled' ? 'border-stone-200 text-stone-400 bg-stone-50' :
                                    o.status === 'Shipped' ? 'border-blue-200 text-blue-700 bg-blue-50/50' :
                                    o.status === 'Processing' ? 'border-amber-200 text-amber-700 bg-amber-50/50' :
                                    'border-[#f5b075]/50 text-[#1a234d] bg-[#fef8f2]'
                                  }`}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td className="p-4 pr-6 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => setExpandedOrders(prev => ({ ...prev, [o.id]: !isExpanded }))}
                                    className={`p-2 rounded-lg transition-all ${isExpanded ? 'bg-stone-200 text-stone-800' : 'hover:bg-stone-100 text-stone-600'}`}
                                    title="Toggle item details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteOrder(o.id, o.orderNumber)}
                                    className="p-2 hover:bg-[#fef8f2] text-stone-600 hover:text-[#1a234d] rounded-lg transition"
                                    title="Delete Order record"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            
                            {/* Expanded Sub-Row */}
                            {isExpanded && (
                              <tr className="bg-stone-50/20">
                                <td colSpan={6} className="p-6 border-b border-stone-100">
                                  <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4 max-w-4xl mx-auto"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                      {/* Delivery instructions */}
                                      <div className="md:col-span-4 p-4 rounded-xl bg-white border border-stone-100 space-y-2 text-xs">
                                        <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Shipping Details</h4>
                                        <p className="text-stone-900 font-bold">{o.customerName}</p>
                                        <p className="text-stone-600">{o.address}</p>
                                        <p className="text-stone-600 font-medium">Phone: {o.phone}</p>
                                        {o.notes && (
                                          <div className="pt-2 border-t mt-2">
                                            <span className="text-[9px] font-black uppercase text-[#f5b075] tracking-widest block">Customer Notes</span>
                                            <p className="text-xs text-stone-700 italic mt-0.5 bg-[#fef8f2]/30 p-2 border border-[#f5b075]/40 rounded-lg">{o.notes}</p>
                                          </div>
                                        )}
                                      </div>

                                      {/* Order items invoice */}
                                      <div className="md:col-span-8 p-4 rounded-xl bg-white border border-stone-100 space-y-4 text-xs">
                                        <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Itemized Breakdown</h4>
                                        <div className="divide-y divide-stone-100 text-stone-700">
                                          {o.items.map((item, idx) => (
                                            <div key={idx} className="py-2.5 flex justify-between items-center">
                                              <div>
                                                <span className="font-bold text-stone-900 text-xs sm:text-sm">{item.name}</span>
                                                <span className="text-stone-400 text-[10px] font-medium block mt-0.5">Quantity items bought: x{item.quantity} × {item.price.toLocaleString()} BDT</span>
                                              </div>
                                              <span className="font-bold text-stone-900">{(item.price * item.quantity).toLocaleString()} BDT</span>
                                            </div>
                                          ))}
                                        </div>

                                        <div className="pt-3 border-t border-stone-100 flex justify-between items-center font-black text-xs sm:text-sm text-stone-950 font-sans">
                                          <span>Cumulative Invoice Total</span>
                                          <span className="text-[#1a234d] text-base font-black">{o.amount.toLocaleString()} BDT</span>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SITE CONTENT MANAGEMENT */}
        {activeTab === 'content' && adminData && (
          <div className="space-y-8">
            <div className="bg-white border border-stone-100 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1a234d]" />
              
              <div className="flex items-center justify-between pb-6 border-b border-stone-100 mb-8">
                <div>
                  <h3 className="font-serif text-2xl font-black text-stone-900 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-[#1a234d]" /> Live Front-page Web Controls
                  </h3>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">
                    Manage bilingual texts, sliders, and background imagery for Bangladesh storefront
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveContent} className="space-y-10 text-xs text-[#111827]">
                
                {/* 1. HERO SLIDER BANNER CAROUSEL SETTINGS */}
                <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 space-y-8">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-stone-900">1. Hero Slider Banner Controls</h4>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                      Customize three premium slides of the home page banner slider deck
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Slide Slot 1 */}
                    <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="font-bold text-[#1a234d]">Banner Slide 1</span>
                        <span className="text-[9px] bg-[#fef8f2] text-[#1a234d] px-2 py-0.5 rounded font-black font-mono">SLOT 01</span>
                      </div>

                      <div className="space-y-3">
                        {/* Title English */}
                        <div>
                          <label className="block text-[9px] uppercase font-black text-stone-500 mb-1">Title (English)</label>
                          <input
                            type="text"
                            required
                            value={adminData.siteContent.bannerTitle1 || ''}
                            onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, bannerTitle1: e.target.value }})}
                            className="w-full text-stone-800 bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg focus:outline-none"
                          />
                        </div>
                        {/* Title Bangla */}
                        <div>
                          <label className="block text-[9px] uppercase font-black text-stone-500 mb-1">Title (Bangla)</label>
                          <input
                            type="text"
                            required
                            value={adminData.siteContent.bannerTitle1Bn || ''}
                            onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, bannerTitle1Bn: e.target.value }})}
                            className="w-full text-stone-800 bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg focus:outline-none"
                          />
                        </div>
                        {/* Tagline English */}
                        <div>
                          <label className="block text-[9px] uppercase font-black text-stone-500 mb-1">Tagline (English)</label>
                          <input
                            type="text"
                            required
                            value={adminData.siteContent.bannerTagline1 || ''}
                            onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, bannerTagline1: e.target.value }})}
                            className="w-full text-stone-800 bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg focus:outline-none"
                          />
                        </div>
                        {/* Tagline Bangla */}
                        <div>
                          <label className="block text-[9px] uppercase font-black text-stone-500 mb-1">Tagline (Bangla)</label>
                          <input
                            type="text"
                            required
                            value={adminData.siteContent.bannerTagline1Bn || ''}
                            onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, bannerTagline1Bn: e.target.value }})}
                            className="w-full text-stone-800 bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg focus:outline-none"
                          />
                        </div>
                        {/* Image Banner 1 (URL and Upload) */}
                        <ImageUploadField
                          label="Banner Image 1"
                          value={adminData.siteContent.bannerImage1 || ''}
                          onValueChange={(url) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, bannerImage1: url },
                            })
                          }
                          onUpload={(file) =>
                            handleImageUpload(
                              file,
                              (url) =>
                                setAdminData((prev) =>
                                  prev
                                    ? { ...prev, siteContent: { ...prev.siteContent, bannerImage1: url } }
                                    : prev
                                ),
                              'banner1'
                            )
                          }
                          uploading={uploadingImage === 'banner1'}
                          uploadLabel="Upload banner to ImgBB"
                          compact
                          previewShape="wide"
                        />
                      </div>
                    </div>

                    {/* Slide Slot 2 */}
                    <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="font-bold text-[#1a234d]">Banner Slide 2</span>
                        <span className="text-[9px] bg-[#fef8f2] text-[#1a234d] px-2 py-0.5 rounded font-black font-mono">SLOT 02</span>
                      </div>

                      <div className="space-y-3">
                        {/* Title English */}
                        <div>
                          <label className="block text-[9px] uppercase font-black text-stone-500 mb-1">Title (English)</label>
                          <input
                            type="text"
                            required
                            value={adminData.siteContent.bannerTitle2 || ''}
                            onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, bannerTitle2: e.target.value }})}
                            className="w-full text-stone-800 bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg focus:outline-none"
                          />
                        </div>
                        {/* Title Bangla */}
                        <div>
                          <label className="block text-[9px] uppercase font-black text-stone-500 mb-1">Title (Bangla)</label>
                          <input
                            type="text"
                            required
                            value={adminData.siteContent.bannerTitle2Bn || ''}
                            onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, bannerTitle2Bn: e.target.value }})}
                            className="w-full text-stone-800 bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg focus:outline-none"
                          />
                        </div>
                        {/* Tagline English */}
                        <div>
                          <label className="block text-[9px] uppercase font-black text-stone-500 mb-1">Tagline (English)</label>
                          <input
                            type="text"
                            required
                            value={adminData.siteContent.bannerTagline2 || ''}
                            onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, bannerTagline2: e.target.value }})}
                            className="w-full text-stone-800 bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg focus:outline-none"
                          />
                        </div>
                        {/* Tagline Bangla */}
                        <div>
                          <label className="block text-[9px] uppercase font-black text-stone-500 mb-1">Tagline (Bangla)</label>
                          <input
                            type="text"
                            required
                            value={adminData.siteContent.bannerTagline2Bn || ''}
                            onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, bannerTagline2Bn: e.target.value }})}
                            className="w-full text-[#111827] bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg focus:outline-none"
                          />
                        </div>
                        {/* Image Banner 2 */}
                        <ImageUploadField
                          label="Banner Image 2"
                          value={adminData.siteContent.bannerImage2 || ''}
                          onValueChange={(url) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, bannerImage2: url },
                            })
                          }
                          onUpload={(file) =>
                            handleImageUpload(
                              file,
                              (url) =>
                                setAdminData((prev) =>
                                  prev
                                    ? { ...prev, siteContent: { ...prev.siteContent, bannerImage2: url } }
                                    : prev
                                ),
                              'banner2'
                            )
                          }
                          uploading={uploadingImage === 'banner2'}
                          compact
                          previewShape="wide"
                        />
                      </div>
                    </div>

                    {/* Slide Slot 3 */}
                    <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="font-bold text-[#1a234d]">Banner Slide 3</span>
                        <span className="text-[9px] bg-[#fef8f2] text-[#1a234d] px-2 py-0.5 rounded font-black font-mono">SLOT 03</span>
                      </div>

                      <div className="space-y-3">
                        {/* Title English */}
                        <div>
                          <label className="block text-[9px] uppercase font-black text-stone-500 mb-1">Title (English)</label>
                          <input
                            type="text"
                            required
                            value={adminData.siteContent.bannerTitle3 || ''}
                            onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, bannerTitle3: e.target.value }})}
                            className="w-full text-stone-800 bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg focus:outline-none"
                          />
                        </div>
                        {/* Title Bangla */}
                        <div>
                          <label className="block text-[9px] uppercase font-black text-stone-500 mb-1">Title (Bangla)</label>
                          <input
                            type="text"
                            required
                            value={adminData.siteContent.bannerTitle3Bn || ''}
                            onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, bannerTitle3Bn: e.target.value }})}
                            className="w-full text-stone-800 bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg focus:outline-none"
                          />
                        </div>
                        {/* Tagline English */}
                        <div>
                          <label className="block text-[9px] uppercase font-black text-stone-500 mb-1">Tagline (English)</label>
                          <input
                            type="text"
                            required
                            value={adminData.siteContent.bannerTagline3 || ''}
                            onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, bannerTagline3: e.target.value }})}
                            className="w-full text-stone-800 bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg focus:outline-none"
                          />
                        </div>
                        {/* Tagline Bangla */}
                        <div>
                          <label className="block text-[9px] uppercase font-black text-stone-500 mb-1">Tagline (Bangla)</label>
                          <input
                            type="text"
                            required
                            value={adminData.siteContent.bannerTagline3Bn || ''}
                            onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, bannerTagline3Bn: e.target.value }})}
                            className="w-full text-stone-800 bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg focus:outline-none"
                          />
                        </div>
                        {/* Image Banner 3 */}
                        <ImageUploadField
                          label="Banner Image 3"
                          value={adminData.siteContent.bannerImage3 || ''}
                          onValueChange={(url) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, bannerImage3: url },
                            })
                          }
                          onUpload={(file) =>
                            handleImageUpload(
                              file,
                              (url) =>
                                setAdminData((prev) =>
                                  prev
                                    ? { ...prev, siteContent: { ...prev.siteContent, bannerImage3: url } }
                                    : prev
                                ),
                              'banner3'
                            )
                          }
                          uploading={uploadingImage === 'banner3'}
                          compact
                          previewShape="wide"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. STOREFRONT WELCOME HERO HEADINGS */}
                <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 space-y-6">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-stone-900">2. Global Storefront Welcome Titles</h4>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                      Customize top headlines appearing instantly over storefront grids
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase font-black text-stone-500 mb-1.5">
                        Global Main Title (English)
                      </label>
                      <input
                        type="text"
                        required
                        value={adminData.siteContent.heroHeadline || ''}
                        onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, heroHeadline: e.target.value }})}
                        className="w-full text-stone-800 bg-white border border-stone-200 px-4 py-3 rounded-xl focus:outline-none text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black text-stone-500 mb-1.5">
                        Global Main Title (Bangla)
                      </label>
                      <input
                        type="text"
                        required
                        value={adminData.siteContent.heroHeadlineBn || ''}
                        onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, heroHeadlineBn: e.target.value }})}
                        className="w-full text-stone-800 bg-white border border-stone-200 px-4 py-3 rounded-xl focus:outline-none text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black text-stone-500 mb-1.5">
                        Sub-headline Paragraph (English)
                      </label>
                      <input
                        type="text"
                        required
                        value={adminData.siteContent.heroSubheadline || ''}
                        onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, heroSubheadline: e.target.value }})}
                        className="w-full text-stone-800 bg-white border border-stone-200 px-4 py-3 rounded-xl focus:outline-none text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black text-stone-500 mb-1.5">
                        Sub-headline Paragraph (Bangla)
                      </label>
                      <input
                        type="text"
                        required
                        value={adminData.siteContent.heroSubheadlineBn || ''}
                        onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, heroSubheadlineBn: e.target.value }})}
                        className="w-full text-[#111827] bg-white border border-stone-200 px-4 py-3 rounded-xl focus:outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 2B. HERO SECTION — 4 GRID IMAGES */}
                <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 space-y-6">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-stone-900">2B. Hero Section — 4 Grid Images</h4>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                      Right-side 2×2 image grid on the home page hero (প্রিমিয়াম হিরো সেকশন)
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {(
                      [
                        ['heroImage1', 'Hero Image 1', 'hero1'],
                        ['heroImage2', 'Hero Image 2', 'hero2'],
                        ['heroImage3', 'Hero Image 3', 'hero3'],
                        ['heroImage4', 'Hero Image 4', 'hero4'],
                      ] as const
                    ).map(([field, label, uploadKey]) => (
                      <div key={field} className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
                        <ImageUploadField
                          label={label}
                          value={adminData.siteContent[field] || ''}
                          onValueChange={(url) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, [field]: url },
                            })
                          }
                          onUpload={(file) =>
                            handleImageUpload(
                              file,
                              (url) =>
                                setAdminData((prev) =>
                                  prev
                                    ? { ...prev, siteContent: { ...prev.siteContent, [field]: url } }
                                    : prev
                                ),
                              uploadKey
                            )
                          }
                          uploading={uploadingImage === uploadKey}
                          compact
                          previewShape="wide"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. ABOUT US CUSTOM STORY SECTION */}
                <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 space-y-6">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-stone-900">3. Storefront About Us Segment</h4>
                    <p className="text-[10px] text-[#1a234d] font-bold uppercase tracking-widest">
                      Supporter stories, health-conscious farm statements, and central imagery
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase font-black text-stone-500 mb-1.5">
                        About Story Header (English)
                      </label>
                      <input
                        type="text"
                        required
                        value={adminData.siteContent.aboutTitle || ''}
                        onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, aboutTitle: e.target.value }})}
                        className="w-full text-stone-800 bg-white border border-stone-200 px-3 py-2.5 rounded-xl focus:outline-none text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black text-stone-500 mb-1.5">
                        About Story Header (Bangla)
                      </label>
                      <input
                        type="text"
                        required
                        value={adminData.siteContent.aboutTitleBn || ''}
                        onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, aboutTitleBn: e.target.value }})}
                        className="w-full text-stone-800 bg-white border border-stone-200 px-3 py-2.5 rounded-xl focus:outline-none text-xs"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] uppercase font-black text-stone-500 mb-1.5">
                        Central Story Passage (English)
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={adminData.siteContent.aboutText || ''}
                        onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, aboutText: e.target.value }})}
                        className="w-full text-stone-800 bg-white border border-stone-200 px-3 py-3 rounded-xl focus:outline-none text-xs"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] uppercase font-black text-stone-500 mb-1.5">
                        Central Story Passage (Bangla)
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={adminData.siteContent.aboutTextBn || ''}
                        onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, aboutTextBn: e.target.value }})}
                        className="w-full text-stone-800 bg-white border border-stone-200 px-3 py-3 rounded-xl focus:outline-none text-xs"
                      />
                    </div>

                    {/* About Section Image URL/Upload Choice */}
                    <div className="md:col-span-2">
                      <ImageUploadField
                        label="About Us Representative Image"
                        value={adminData.siteContent.aboutImage || ''}
                        onValueChange={(url) =>
                          setAdminData({
                            ...adminData,
                            siteContent: { ...adminData.siteContent, aboutImage: url },
                          })
                        }
                        onUpload={(file) =>
                          handleImageUpload(file, (url) =>
                            setAdminData((prev) =>
                              prev ? { ...prev, siteContent: { ...prev.siteContent, aboutImage: url } } : prev
                            ),
                            'about-image'
                          )
                        }
                        uploading={uploadingImage === 'about-image'}
                        previewShape="banner"
                      />
                    </div>
                  </div>
                </div>

                {/* 3B. FAQ & REVIEW IMAGES */}
                <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 space-y-6">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-stone-900">3B. FAQ & Review Images</h4>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                      সচরাচর জিজ্ঞাসিত প্রশ্ন section image + default review avatar (MongoDB)
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(
                      [
                        ['faqImageDesktop', 'FAQ Image (Desktop)', 'faq-desk'],
                        ['faqImageMobile', 'FAQ Image (Mobile)', 'faq-mob'],
                        ['defaultReviewAvatar', 'Default Review Avatar', 'review-avatar'],
                      ] as const
                    ).map(([field, label, uploadKey]) => (
                      <div key={field}>
                        <ImageUploadField
                          label={label}
                          value={adminData.siteContent[field] || ''}
                          onValueChange={(url) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, [field]: url },
                            })
                          }
                          onUpload={(file) =>
                            handleImageUpload(
                              file,
                              (url) =>
                                setAdminData((prev) =>
                                  prev
                                    ? { ...prev, siteContent: { ...prev.siteContent, [field]: url } }
                                    : prev
                                ),
                              uploadKey
                            )
                          }
                          uploading={uploadingImage === uploadKey}
                          compact
                          previewShape={field === 'defaultReviewAvatar' ? 'circle' : 'wide'}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. FOOTER & CONTACT SETTINGS */}
                <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 space-y-6">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-stone-900">4. Office Contact & Copyrights</h4>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                      Central channels and responsive mailing markers
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase font-black text-stone-500 mb-1.5">Central Support Email Address</label>
                      <input
                        type="email"
                        required
                        value={adminData.siteContent.contactEmail || ''}
                        onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, contactEmail: e.target.value }})}
                        className="w-full text-stone-800 bg-white border border-stone-200 px-3.5 py-2.5 rounded-xl focus:outline-none text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black text-stone-500 mb-1.5">Phone Line</label>
                      <input
                        type="text"
                        required
                        value={adminData.siteContent.contactPhone || ''}
                        onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, contactPhone: e.target.value }})}
                        className="w-full text-stone-800 bg-white border border-stone-200 px-3.5 py-2.5 rounded-xl focus:outline-none text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black text-stone-500 mb-1.5">Office Address (English)</label>
                      <input
                        type="text"
                        required
                        value={adminData.siteContent.contactAddress || ''}
                        onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, contactAddress: e.target.value }})}
                        className="w-full text-stone-800 bg-white border border-stone-200 px-3.5 py-2.5 rounded-xl focus:outline-none text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black text-stone-500 mb-1.5">Office Address (Bangla)</label>
                      <input
                        type="text"
                        required
                        value={adminData.siteContent.contactAddressBn || ''}
                        onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, contactAddressBn: e.target.value }})}
                        className="w-full text-stone-800 bg-white border border-stone-200 px-3.5 py-2.5 rounded-xl focus:outline-none text-xs font-medium font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-stone-200">
                    <div>
                      <label className="block text-[10px] uppercase font-black text-stone-500 mb-1.5">Facebook URL</label>
                      <input
                        type="text"
                        value={adminData.siteContent.facebookUrl || ''}
                        onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, facebookUrl: e.target.value }})}
                        className="w-full text-stone-800 bg-white border border-stone-200 px-3 py-2 rounded-lg focus:outline-none text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black text-stone-500 mb-1.5">Instagram URL</label>
                      <input
                        type="text"
                        value={adminData.siteContent.instagramUrl || ''}
                        onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, instagramUrl: e.target.value }})}
                        className="w-full text-[#111827] bg-white border border-stone-200 px-3 py-2 rounded-lg focus:outline-none text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black text-stone-500 mb-1.5">YouTube Channel URL</label>
                      <input
                        type="text"
                        value={adminData.siteContent.youtubeUrl || ''}
                        onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, youtubeUrl: e.target.value }})}
                        className="w-full text-stone-800 bg-white border border-stone-200 px-3 py-2 rounded-lg focus:outline-none text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-200">
                    <div>
                      <label className="block text-[10px] uppercase font-black text-stone-500 mb-1.5">Footer Copyright Paragraph (English)</label>
                      <input
                        type="text"
                        required
                        value={adminData.siteContent.footerText || ''}
                        onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, footerText: e.target.value }})}
                        className="w-full text-stone-800 bg-white border border-stone-200 px-3 py-2 rounded-lg focus:outline-none text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black text-stone-500 mb-1.5">Footer Copyright Paragraph (Bangla)</label>
                      <input
                        type="text"
                        required
                        value={adminData.siteContent.footerTextBn || ''}
                        onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, footerTextBn: e.target.value }})}
                        className="w-full text-[#111827] bg-white border border-stone-200 px-3 py-2 rounded-lg focus:outline-none text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t flex justify-end">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="bg-[#1a234d] hover:bg-black text-white font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-lg transition"
                  >
                    {isPending ? 'Saving Frontpage Configuration...' : 'Update Front-page Layout'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* GALLERY TAB */}
        {activeTab === 'gallery' && adminData && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-3xl font-black text-stone-900">Gallery Manager</h3>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">
                  হোমপেজ গ্যালারি স্লাইডার — এডিট ও ডিলিট করুন
                </p>
              </div>
              <button
                type="button"
                onClick={() => openGalleryEditor()}
                className="bg-[#1a234d] hover:bg-black text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" /> নতুন গ্যালারি আইটেম
              </button>
            </div>

            {adminData.galleryItems.length === 0 ? (
              <div className="bg-white border border-dashed border-stone-200 rounded-2xl p-12 text-center">
                <Images className="w-10 h-10 mx-auto text-stone-300 mb-3" />
                <p className="font-bold text-stone-700">কোনো গ্যালারি আইটেম নেই</p>
                <p className="text-sm text-stone-400 mt-1">উপরের বাটন দিয়ে নতুন ছবি যোগ করুন</p>
              </div>
            ) : (
              <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-stone-50 text-stone-500 text-xs font-black uppercase tracking-wider border-b border-stone-100">
                        <th className="p-4 pl-6">ছবি</th>
                        <th className="p-4">শিরোনাম</th>
                        <th className="p-4">বিবরণ</th>
                        <th className="p-4 text-center">Slot</th>
                        <th className="p-4 text-center">ক্রম</th>
                        <th className="p-4 pr-6 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {adminData.galleryItems.map((item) => (
                        <tr key={item.id} className="hover:bg-stone-50/50 transition duration-150">
                          <td className="p-4 pl-6">
                            <div className="relative w-16 h-16 bg-stone-50 border rounded-lg overflow-hidden">
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </td>
                          <td className="p-4 font-bold text-stone-900 max-w-[10rem]">
                            {item.titleBn || item.title}
                          </td>
                          <td className="p-4 text-xs text-stone-500 max-w-xs line-clamp-2">
                            {item.descriptionBn || item.description}
                          </td>
                          <td className="p-4 text-center">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-[#fef8f2] text-[#1a234d] px-2 py-1 rounded-full">
                              Slot {item.slot}
                            </span>
                          </td>
                          <td className="p-4 text-center font-mono text-xs font-bold">{item.sortOrder}</td>
                          <td className="p-4 pr-6 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openGalleryEditor(item)}
                                className="p-2 hover:bg-blue-50 text-stone-600 hover:text-blue-600 rounded-lg transition"
                                title="এডিট"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteGallery(item.id, item.titleBn || item.title)}
                                className="p-2 hover:bg-[#fef8f2] text-stone-600 hover:text-[#1a234d] rounded-lg transition"
                                title="ডিলিট"
                              >
                                <Trash2 className="w-4 h-4" />
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
          </div>
        )}

        {/* FAQ TAB */}
        {activeTab === 'faq' && adminData && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-3xl font-black text-stone-900">FAQ Manager</h3>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">
                  Manage frequently asked questions shown on the homepage
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEditingFaq({
                    question: '',
                    questionBn: '',
                    answer: '',
                    answerBn: '',
                    sortOrder: adminData.faqItems.length,
                  })
                }
                className="bg-[#1a234d] text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl"
              >
                Add FAQ
              </button>
            </div>

            {editingFaq && (
              <div className="bg-white border border-stone-100 rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    placeholder="Question (EN)"
                    value={editingFaq.question || ''}
                    onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Question (BN)"
                    value={editingFaq.questionBn || ''}
                    onChange={(e) => setEditingFaq({ ...editingFaq, questionBn: e.target.value })}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <textarea
                    placeholder="Answer (EN)"
                    value={editingFaq.answer || ''}
                    onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm md:col-span-2"
                    rows={3}
                  />
                  <textarea
                    placeholder="Answer (BN)"
                    value={editingFaq.answerBn || ''}
                    onChange={(e) => setEditingFaq({ ...editingFaq, answerBn: e.target.value })}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm md:col-span-2"
                    rows={3}
                  />
                  <input
                    type="number"
                    placeholder="Sort order"
                    value={editingFaq.sortOrder ?? 0}
                    onChange={(e) => setEditingFaq({ ...editingFaq, sortOrder: Number(e.target.value) })}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={handleSaveFaq} disabled={isPending} className="bg-[#1a234d] text-white px-5 py-2 rounded-lg text-sm font-bold">
                    Save
                  </button>
                  <button type="button" onClick={() => setEditingFaq(null)} className="border px-5 py-2 rounded-lg text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {adminData.faqItems.map((item) => (
                <div key={item.id} className="bg-white border border-stone-100 rounded-xl p-4 flex justify-between gap-4">
                  <div>
                    <p className="font-bold text-stone-900">{item.questionBn || item.question}</p>
                    <p className="text-sm text-stone-500 mt-1 line-clamp-2">{item.answerBn || item.answer}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button type="button" onClick={() => setEditingFaq(item)} className="text-xs font-bold text-[#1a234d]">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDeleteFaq(item.id)} className="text-xs font-bold text-stone-400">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SHIPPING CHARGES TAB */}
        {activeTab === 'shipping' && adminData && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-3xl font-black text-stone-900">Shipping Charge Manager</h3>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">
                  ডেলিভারি চার্জ তৈরি, এডিট, ডিলিট — চেকআউটে সব দেখাবে
                </p>
              </div>
              <button
                type="button"
                onClick={() => openShippingEditor()}
                className="bg-[#1a234d] hover:bg-black text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" /> নতুন শিপিং চার্জ
              </button>
            </div>

            {adminData.shippingCharges.length === 0 ? (
              <div className="bg-white border border-dashed border-stone-200 rounded-2xl p-12 text-center">
                <Truck className="w-10 h-10 mx-auto text-stone-300 mb-3" />
                <p className="font-bold text-stone-700">কোনো শিপিং চার্জ নেই</p>
                <p className="text-sm text-stone-400 mt-1">যেমন: ঢাকার ভেতর ৮০, বাইরে ১৫০</p>
              </div>
            ) : (
              <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-stone-50 text-stone-500 text-xs font-black uppercase tracking-wider border-b border-stone-100">
                        <th className="p-4 pl-6">নাম</th>
                        <th className="p-4 text-right">চার্জ (BDT)</th>
                        <th className="p-4 text-center">ক্রম</th>
                        <th className="p-4 text-center">স্ট্যাটাস</th>
                        <th className="p-4 pr-6 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {adminData.shippingCharges.map((zone) => (
                        <tr key={zone.id} className="hover:bg-stone-50/50 transition duration-150">
                          <td className="p-4 pl-6">
                            <p className="font-bold text-stone-900">{zone.nameBn || zone.name}</p>
                            {zone.nameBn && <p className="text-xs text-stone-400">{zone.name}</p>}
                          </td>
                          <td className="p-4 text-right font-black text-[#1a234d]">
                            {zone.fee.toLocaleString()} BDT
                          </td>
                          <td className="p-4 text-center font-mono text-xs">{zone.sortOrder}</td>
                          <td className="p-4 text-center">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                                zone.active ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
                              }`}
                            >
                              {zone.active ? 'Active' : 'Off'}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openShippingEditor(zone)}
                                className="p-2 hover:bg-blue-50 text-stone-600 hover:text-blue-600 rounded-lg transition"
                                title="এডিট"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteShipping(zone.id, zone.nameBn || zone.name)}
                                className="p-2 hover:bg-[#fef8f2] text-stone-600 hover:text-[#1a234d] rounded-lg transition"
                                title="ডিলিট"
                              >
                                <Trash2 className="w-4 h-4" />
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
          </div>
        )}

        {/* CONTACT MESSAGES TAB */}
        {activeTab === 'messages' && adminData && (
          <div className="space-y-6">
            <div className="mb-6">
              <h3 className="font-serif text-3xl font-black text-stone-900">Contact Inbox</h3>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">
                Messages from the website contact form
              </p>
            </div>

            {contactMessages.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-100 p-12 text-center text-stone-400 font-bold">
                No contact messages yet.
              </div>
            ) : (
              <div className="space-y-4">
                {contactMessages.map((msg) => (
                  <div key={msg.id} className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <h4 className="font-bold text-stone-900">{msg.name}</h4>
                        <a href={`mailto:${msg.email}`} className="text-sm text-[#1a234d] hover:underline">
                          {msg.email}
                        </a>
                        <p className="text-xs text-stone-400 mt-1">
                          {new Date(msg.createdAt).toLocaleString('en-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!password) return;
                          startTransition(async () => {
                            const res = await deleteContactMessageAction(password, msg.id);
                            if (res.success) {
                              showToast('Message deleted', 'success');
                              void refreshContactMessages(password);
                            } else {
                              showToast(res.error || 'Delete failed', 'error');
                            }
                          });
                        }}
                        className="text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CUSTOM REVIEWS TAB SECTION */}
        {activeTab === 'reviews' && adminData && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-3xl font-black text-stone-900">Review Moderation</h3>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">
                  গ্রাহক রিভিউ তৈরি, এডিট ও ডিলিট করুন
                </p>
              </div>
              <button
                type="button"
                onClick={() => openReviewEditor()}
                className="bg-[#1a234d] hover:bg-black text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" /> নতুন রিভিউ
              </button>
            </div>

            {adminData.reviews.length === 0 ? (
              <div className="bg-white border border-dashed border-stone-200 rounded-2xl p-12 text-center">
                <Star className="w-10 h-10 mx-auto text-amber-300 mb-3" />
                <p className="font-bold text-stone-700">কোনো রিভিউ নেই</p>
                <p className="text-sm text-stone-400 mt-1">উপরের বাটন দিয়ে নতুন রিভিউ যোগ করুন</p>
              </div>
            ) : (
              <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-stone-50 text-stone-500 text-xs font-black uppercase tracking-wider border-b border-stone-100">
                        <th className="p-4 pl-6">গ্রাহক</th>
                        <th className="p-4">রেটিং</th>
                        <th className="p-4">রিভিউ</th>
                        <th className="p-4 pr-6 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {adminData.reviews.map((rev) => (
                        <tr key={rev.id} className="hover:bg-stone-50/50 transition duration-150">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-stone-50 border shrink-0">
                                <Image
                                  src={rev.image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                                  alt={rev.name}
                                  fill
                                  className="object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div>
                                <p className="font-bold text-stone-900">{rev.name}</p>
                                {(rev.roleBn || rev.role) && (
                                  <p className="text-[10px] text-stone-400">{rev.roleBn || rev.role}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}`}
                                />
                              ))}
                            </div>
                          </td>
                          <td className="p-4 text-xs text-stone-600 max-w-md line-clamp-2 italic">
                            &ldquo;{rev.text}&rdquo;
                          </td>
                          <td className="p-4 pr-6 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openReviewEditor(rev)}
                                className="p-2 hover:bg-blue-50 text-stone-600 hover:text-blue-600 rounded-lg transition"
                                title="এডিট"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteReview(rev.id, rev.name)}
                                disabled={isPending}
                                className="p-2 hover:bg-[#fef8f2] text-stone-600 hover:text-[#1a234d] rounded-lg transition"
                                title="ডিলিট"
                              >
                                <Trash2 className="w-4 h-4" />
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
          </div>
        )}
      </main>
      </div>

      {/* CREATOR DIALOG DICTIONARY: PRODUCT */}
      <AnimatePresence>
        {showProductDialog && editingProduct && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowProductDialog(false); setEditingProduct(null); }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl z-10 overflow-y-auto max-h-[92vh] sm:max-h-[90vh]"
            >
              <h3 className="font-serif text-2xl font-black mb-4 text-[#111827]">
                {editingProduct.id ? 'Edit Product Parameters' : 'Register New Pure Source Asset'}
              </h3>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div>
                  <label className="block uppercase font-bold tracking-widest text-stone-500 mb-1 leading-none">
                    Product Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mustard oil, Royal honey mixed nuts, etc."
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full text-stone-800 bg-stone-50 border border-stone-200 text-sm px-4 py-3 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase font-bold tracking-widest text-stone-500 mb-1 leading-none">
                      Pristine Raw Price BDT
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="1200"
                      value={editingProduct.price || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="w-full text-stone-800 bg-stone-50 border border-stone-200 text-sm px-4 py-3 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block uppercase font-bold tracking-widest text-stone-500 mb-1 leading-none">
                      Discount % Percentage
                    </label>
                    <input
                      type="number"
                      placeholder="E.g., 10"
                      value={editingProduct.discount === undefined ? '' : editingProduct.discount}
                      onChange={(e) => setEditingProduct({ ...editingProduct, discount: Number(e.target.value) })}
                      className="w-full text-stone-800 bg-stone-50 border border-stone-200 text-sm px-4 py-3 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block uppercase font-bold tracking-widest text-stone-500 mb-1 leading-none">
                    Shelf Category
                  </label>
                  <select
                    required
                    value={editingProduct.category || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full text-stone-800 bg-stone-50 border border-stone-200 text-sm px-4 py-3 rounded-xl focus:outline-none"
                  >
                    <option value="" disabled>-- Select Category (Required) --</option>
                    {adminData && adminData.categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <label className="flex items-start gap-3 p-4 border border-stone-200 rounded-xl bg-stone-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.freeShipping)}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, freeShipping: e.target.checked })
                    }
                    className="mt-1 rounded border-stone-300"
                  />
                  <span>
                    <span className="block text-sm font-bold text-stone-900">ফ্রি ডেলিভারি (শিপিং চার্জ নেই)</span>
                    <span className="block text-xs text-stone-500 mt-0.5">
                      ডিফল্ট আনচেক — চেক করলে এই পণ্যে ডেলিভারি চার্জ লাগবে না
                    </span>
                  </span>
                </label>

                <ImageUploadField
                  label="Product Display Image"
                  value={editingProduct.image || ''}
                  onValueChange={(url) => setEditingProduct({ ...editingProduct, image: url })}
                  onUpload={(file) =>
                    handleImageUpload(file, (url) =>
                      setEditingProduct((prev) => (prev ? { ...prev, image: url } : prev)),
                      'product-image'
                    )
                  }
                  uploading={uploadingImage === 'product-image'}
                  required
                  urlPlaceholder="https://images.unsplash.com/promo-honey-photo"
                />

                <div>
                  <label className="block uppercase font-bold tracking-widest text-stone-500 mb-1 leading-none">
                    Status Toggle Scope
                  </label>
                  <select
                    value={editingProduct.status || 'Active'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as any })}
                    className="w-full text-[#111827] bg-stone-50 border border-stone-200 text-sm px-4 py-3 rounded-xl focus:outline-none"
                  >
                    <option value="Active">Active storefront display</option>
                    <option value="Draft">Draft storage</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase font-bold tracking-widest text-stone-500 mb-1 leading-none">
                    Gourmet Nutritional Passage (Description)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Details about raw honey collection or ghee preparation..."
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full text-stone-800 bg-stone-50 border border-stone-200 text-sm px-4 py-3 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => { setShowProductDialog(false); setEditingProduct(null); }}
                    className="py-3 px-5 border rounded-xl hover:bg-stone-50 transition font-bold"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="py-3 px-5 bg-[#1a234d] hover:bg-black text-white rounded-xl transition font-bold"
                  >
                    {isPending ? 'Syncing...' : 'Save Product Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GALLERY EDIT / CREATE DIALOG */}
      <AnimatePresence>
        {showGalleryDialog && editingGallery && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowGalleryDialog(false); setEditingGallery(null); }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl z-10 overflow-y-auto max-h-[92vh] sm:max-h-[90vh]"
            >
              <h3 className="font-serif text-2xl font-black mb-4 text-[#111827]">
                {editingGallery.id ? 'গ্যালারি আইটেম এডিট' : 'নতুন গ্যালারি আইটেম'}
              </h3>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-1">
                      Title (EN)
                    </label>
                    <input
                      placeholder="Title (EN)"
                      value={editingGallery.title || ''}
                      onChange={(e) => setEditingGallery({ ...editingGallery, title: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-1">
                      Title (BN)
                    </label>
                    <input
                      placeholder="শিরোনাম (বাংলা)"
                      value={editingGallery.titleBn || ''}
                      onChange={(e) => setEditingGallery({ ...editingGallery, titleBn: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-1">
                      Description (EN)
                    </label>
                    <textarea
                      placeholder="Description (EN)"
                      value={editingGallery.description || ''}
                      onChange={(e) => setEditingGallery({ ...editingGallery, description: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm"
                      rows={2}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-1">
                      Description (BN)
                    </label>
                    <textarea
                      placeholder="বিবরণ (বাংলা)"
                      value={editingGallery.descriptionBn || ''}
                      onChange={(e) => setEditingGallery({ ...editingGallery, descriptionBn: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-1">
                      Slot
                    </label>
                    <select
                      value={editingGallery.slot ?? 1}
                      onChange={(e) => setEditingGallery({ ...editingGallery, slot: Number(e.target.value) })}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm"
                    >
                      <option value={1}>Slot 1 — Main</option>
                      <option value={2}>Slot 2 — Bottom left</option>
                      <option value={3}>Slot 3 — Bottom right</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-1">
                      Sort order
                    </label>
                    <input
                      type="number"
                      placeholder="Sort order"
                      value={editingGallery.sortOrder ?? 0}
                      onChange={(e) => setEditingGallery({ ...editingGallery, sortOrder: Number(e.target.value) })}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <ImageUploadField
                  label="Gallery Image"
                  value={editingGallery.image || ''}
                  onValueChange={(url) => setEditingGallery({ ...editingGallery, image: url })}
                  onUpload={(file) =>
                    handleImageUpload(
                      file,
                      (url) => setEditingGallery({ ...editingGallery, image: url }),
                      'gallery-edit'
                    )
                  }
                  uploading={uploadingImage === 'gallery-edit'}
                  previewShape="banner"
                />

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowGalleryDialog(false); setEditingGallery(null); }}
                    className="flex-1 py-3 border rounded-xl hover:bg-stone-50 transition font-bold text-sm"
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveGallery}
                    disabled={isPending}
                    className="flex-1 py-3 bg-[#1a234d] hover:bg-black text-white rounded-xl transition font-bold text-sm"
                  >
                    {isPending ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SHIPPING EDIT / CREATE DIALOG */}
      <AnimatePresence>
        {showShippingDialog && editingShipping && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowShippingDialog(false); setEditingShipping(null); }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10"
            >
              <h3 className="font-serif text-2xl font-black mb-4 text-[#111827]">
                {editingShipping.id ? 'শিপিং চার্জ এডিট' : 'নতুন শিপিং চার্জ'}
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-1">
                    Name (EN)
                  </label>
                  <input
                    placeholder="Inside Dhaka"
                    value={editingShipping.name || ''}
                    onChange={(e) => setEditingShipping({ ...editingShipping, name: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-1">
                    Name (BN)
                  </label>
                  <input
                    placeholder="ঢাকার ভেতর"
                    value={editingShipping.nameBn || ''}
                    onChange={(e) => setEditingShipping({ ...editingShipping, nameBn: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-1">
                      Fee (BDT)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editingShipping.fee ?? ''}
                      onChange={(e) => setEditingShipping({ ...editingShipping, fee: Number(e.target.value) })}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-1">
                      Sort order
                    </label>
                    <input
                      type="number"
                      value={editingShipping.sortOrder ?? 0}
                      onChange={(e) => setEditingShipping({ ...editingShipping, sortOrder: Number(e.target.value) })}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingShipping.active !== false}
                    onChange={(e) => setEditingShipping({ ...editingShipping, active: e.target.checked })}
                  />
                  <span className="text-sm font-semibold">চেকআউটে দেখাবে (Active)</span>
                </label>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowShippingDialog(false); setEditingShipping(null); }}
                    className="flex-1 py-3 border rounded-xl hover:bg-stone-50 font-bold"
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveShipping}
                    disabled={isPending}
                    className="flex-1 py-3 bg-[#1a234d] hover:bg-black text-white rounded-xl font-bold"
                  >
                    {isPending ? 'সেভ...' : 'সেভ করুন'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REVIEW EDIT / CREATE DIALOG */}
      <AnimatePresence>
        {showReviewDialog && editingReview && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowReviewDialog(false); setEditingReview(null); }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl z-10 overflow-y-auto max-h-[92vh] sm:max-h-[90vh]"
            >
              <h3 className="font-serif text-2xl font-black mb-4 text-[#111827]">
                {editingReview.id ? 'রিভিউ এডিট' : 'নতুন রিভিউ যোগ করুন'}
              </h3>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-1">
                      গ্রাহকের নাম
                    </label>
                    <input
                      placeholder="যেমন: রহিম আহমেদ"
                      value={editingReview.name || ''}
                      onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-1">
                      রেটিং (১–৫)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={editingReview.rating ?? 5}
                      onChange={(e) => setEditingReview({ ...editingReview, rating: Number(e.target.value) })}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-1">
                      Role (EN)
                    </label>
                    <input
                      placeholder="Verified Buyer"
                      value={editingReview.role || ''}
                      onChange={(e) => setEditingReview({ ...editingReview, role: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-1">
                      Role (BN)
                    </label>
                    <input
                      placeholder="যাচাইকৃত ক্রেতা"
                      value={editingReview.roleBn || ''}
                      onChange={(e) => setEditingReview({ ...editingReview, roleBn: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-1">
                      রিভিউ টেক্সট
                    </label>
                    <textarea
                      placeholder="গ্রাহকের অভিজ্ঞতা লিখুন..."
                      value={editingReview.text || ''}
                      onChange={(e) => setEditingReview({ ...editingReview, text: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm"
                      rows={4}
                    />
                  </div>
                </div>

                <ImageUploadField
                  label="প্রোফাইল ছবি"
                  value={editingReview.image || ''}
                  onValueChange={(url) => setEditingReview({ ...editingReview, image: url })}
                  onUpload={(file) =>
                    handleImageUpload(
                      file,
                      (url) => setEditingReview({ ...editingReview, image: url }),
                      'review-edit'
                    )
                  }
                  uploading={uploadingImage === 'review-edit'}
                  previewShape="circle"
                />

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowReviewDialog(false); setEditingReview(null); }}
                    className="flex-1 py-3 border rounded-xl hover:bg-stone-50 transition font-bold text-sm"
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveReview}
                    disabled={isPending}
                    className="flex-1 py-3 bg-[#1a234d] hover:bg-black text-white rounded-xl transition font-bold text-sm"
                  >
                    {isPending ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATOR DIALOG DICTIONARY: CATEGORY */}
      <AnimatePresence>
        {showCategoryDialog && editingCategory && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowCategoryDialog(false); setEditingCategory(null); }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10"
            >
              <h3 className="font-serif text-2xl font-black mb-4 text-stone-950">
                {editingCategory.id ? 'Edit Taxonomy' : 'Create Category Taxonomy'}
              </h3>

              <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                <div>
                  <label className="block uppercase font-bold tracking-widest text-stone-500 mb-1">
                    Category Name Label
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Sweet Delicacies"
                    value={editingCategory.name || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="w-full text-stone-800 bg-stone-50 border border-stone-200 text-sm px-4 py-3 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold tracking-widest text-[#111827] mb-1">
                    Slug target identifier
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., organic-nuts"
                    value={editingCategory.slug || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                    className="w-full text-stone-800 bg-stone-50 border border-stone-200 text-sm px-4 py-3 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold tracking-widest text-stone-500 mb-1">
                    Lucide Icon Representative
                  </label>
                  <select
                    value={editingCategory.icon || 'Droplets'}
                    onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                    className="w-full text-stone-800 bg-stone-50 border border-stone-200 text-sm px-4 py-3 rounded-xl focus:outline-none"
                  >
                    <option value="Droplets">Droplets (Ghee & Oils)</option>
                    <option value="Nut">Nut (Nuts & Seeds)</option>
                    <option value="CalendarDays">CalendarDays (Dates)</option>
                    <option value="Leaf">Leaf (Seeds & Spices)</option>
                    <option value="Container">Container (Liquids & Oils)</option>
                  </select>
                </div>

                <div className="pt-4 border-t flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => { setShowCategoryDialog(false); setEditingCategory(null); }}
                    className="py-3 px-5 border rounded-xl hover:bg-stone-50 transition font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="py-3 px-5 bg-[#1a234d] hover:bg-black text-white rounded-xl transition font-bold"
                  >
                    {isPending ? 'Saving...' : 'Save Taxonomy'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
