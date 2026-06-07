'use client';

import React, { useState, useEffect, useTransition } from 'react';
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
  getContactMessagesAction,
  deleteContactMessageAction,
} from '../actions';
import { Category, Product, Order, Review, SiteContent, GalleryItem, FaqItem } from '@/lib/types';
import { AdminOrderNotification } from '@/components/admin-order-notification';
import { compressImageForUpload } from '@/lib/compress-image';

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
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'categories' | 'orders' | 'content' | 'reviews' | 'gallery' | 'faq' | 'messages'
  >('overview');
  
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
  const [editingReview, setEditingReview] = useState<Partial<Review> | null>(null);
  const [editingFaq, setEditingFaq] = useState<Partial<FaqItem> | null>(null);

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
      });
      setIsLoggedIn(true);
      localStorage.setItem('khanfoods_admin_key', pwd);
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
      const res = await saveProductAction(password, editingProduct);
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
        refreshAdminData(password);
      } else {
        showToast(res.error || 'Gallery save failed', 'error');
      }
    });
  };

  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm('Delete this gallery item?')) return;
    const res = await deleteGalleryItemAction(password, id);
    if (res.success) {
      showToast('Gallery item deleted', 'success');
      refreshAdminData(password);
    } else {
      showToast(res.error || 'Delete failed', 'error');
    }
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
    if (!editingReview?.id || !editingReview.name || !editingReview.text) {
      showToast('Name and review text required', 'error');
      return;
    }
    startTransition(async () => {
      const res = await saveReviewAction(password, {
        id: editingReview.id!,
        name: editingReview.name!,
        rating: editingReview.rating ?? 5,
        text: editingReview.text!,
        image: editingReview.image || '',
        role: editingReview.role,
        roleBn: editingReview.roleBn,
      });
      if (res.success) {
        showToast('Review updated', 'success');
        setEditingReview(null);
        refreshAdminData(password);
      } else {
        showToast(res.error || 'Review save failed', 'error');
      }
    });
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-stone-900 selection:bg-[#1a234d] selection:text-white">
      <AdminOrderNotification
        password={password}
        isLoggedIn={isLoggedIn}
        onViewOrder={() => setActiveTab('orders')}
      />
      {/* Dynamic Toaster */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-xl shadow-2xl text-xs font-black uppercase tracking-wider border-l-4 flex items-center gap-2 ${
              t.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-950' : 'bg-[#fef8f2] border-[#1a234d] text-[#1a234d]'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* ADMIN SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-100 flex flex-col justify-between shrink-0 border-r border-stone-800 z-10">
        <div>
          <div className="p-6 border-b border-stone-800 flex items-center gap-2">
            <span className="bg-[#1a234d] text-white rounded p-1.5 font-bold text-xs">KF</span>
            <div>
              <span className="font-serif font-black text-lg block leading-none text-white">Console</span>
              <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#f5b075]">Khan Foods HQ</span>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-bold transition text-left cursor-pointer ${
                activeTab === 'overview' ? 'bg-[#1a234d] text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Overview Dashboard
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-bold transition text-left cursor-pointer ${
                activeTab === 'products' ? 'bg-[#1a234d] text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Manage Products
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-bold transition text-left cursor-pointer ${
                activeTab === 'categories' ? 'bg-[#1a234d] text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" /> Categories Group
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-bold transition text-left cursor-pointer ${
                activeTab === 'orders' ? 'bg-[#1a234d] text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" /> Order Records
              {adminData && adminData.orders.filter(o => o.status === 'Pending').length > 0 && (
                <span className="ml-auto bg-amber-500 text-stone-900 text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                  {adminData.orders.filter(o => o.status === 'Pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('content')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-bold transition text-left cursor-pointer ${
                activeTab === 'content' ? 'bg-[#1a234d] text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" /> Content Manager
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-bold transition text-left cursor-pointer ${
                activeTab === 'gallery' ? 'bg-[#1a234d] text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Images className="w-4 h-4" /> Gallery Manager
            </button>

            <button
              onClick={() => setActiveTab('faq')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-bold transition text-left cursor-pointer ${
                activeTab === 'faq' ? 'bg-[#1a234d] text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <CircleHelp className="w-4 h-4" /> FAQ Manager
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-bold transition text-left cursor-pointer ${
                activeTab === 'messages' ? 'bg-[#1a234d] text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Contact Messages
              {contactMessages.length > 0 && (
                <span className="ml-auto bg-[#f5b075] text-[#1a234d] text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {contactMessages.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-bold transition text-left cursor-pointer ${
                activeTab === 'reviews' ? 'bg-[#1a234d] text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Review Testimonials
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-stone-800 space-y-2">
          <Link href="/" className="w-full flex items-center justify-center gap-1 bg-stone-800 text-stone-300 hover:text-white py-2 rounded-lg text-xs font-bold transition">
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Shop
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1 bg-[#fef8f2]/10 hover:bg-[#1a234d] hover:text-white text-[#f5b075] py-2 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout Session
          </button>
        </div>
      </aside>

      {/* MAIN ADMIN AREA CONTAINER */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {/* HQ Header block */}
        <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-4 border-b pb-6 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a234d]">
              HQ Management Command
            </span>
            <h1 className="font-serif text-3xl font-black text-stone-900">
              {activeTab === 'overview' && 'Console Overview'}
              {activeTab === 'products' && 'Product Registry Management'}
              {activeTab === 'categories' && 'Category Taxonomy Management'}
              {activeTab === 'orders' && 'Secure Shipping Orders'}
              {activeTab === 'content' && 'Live Front-page Web Controls'}
              {activeTab === 'gallery' && 'Gallery Image Manager'}
              {activeTab === 'faq' && 'FAQ Content Manager'}
              {activeTab === 'messages' && 'Contact Inbox'}
              {activeTab === 'reviews' && 'Customer Review Moderation'}
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
                <span className="text-[10px] text-[#1a234d] font-bold block mt-1 uppercase">
                  {adminData.products.filter(p => p.stock < 10).length} warning stock out
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
                    name: '', price: 0, discount: 0, description: '', category: adminData.categories[0]?.name || '', stock: 20, status: 'Active', image: ''
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
                      <th className="p-4 text-right">In Stock</th>
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
                        <td className="p-4 text-right">
                          <span className={`font-mono text-xs font-black ${p.stock < 10 ? 'text-[#1a234d] animate-pulse' : 'text-stone-800'}`}>
                            {p.stock}
                          </span>
                        </td>
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
                        <div>
                          <label className="block text-[9px] uppercase font-black text-stone-500 mb-1">Banner Image 1</label>
                          <input
                            type="text"
                            placeholder="Image URL"
                            value={adminData.siteContent.bannerImage1 || ''}
                            onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, bannerImage1: e.target.value }})}
                            className="w-full text-stone-800 bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg focus:outline-none mb-1 text-[10px]"
                          />
                          <div className="relative border border-dashed border-stone-200 bg-stone-50 rounded-lg p-2 text-center hover:bg-stone-100/50 transition cursor-pointer">
                            <input
                              type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  await handleImageUpload(file, (url) =>
                                    setAdminData((prev) =>
                                      prev
                                        ? { ...prev, siteContent: { ...prev.siteContent, bannerImage1: url } }
                                        : prev
                                    )
                                  );
                                }
                                e.target.value = '';
                              }}
                            />
                            <span className="text-[9px] text-[#1a234d] font-extrabold uppercase tracking-wide">
                              {uploadingImage ? 'Uploading to ImgBB...' : 'Or upload to ImgBB'}
                            </span>
                          </div>
                        </div>
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
                        <div>
                          <label className="block text-[9px] uppercase font-black text-stone-500 mb-1">Banner Image 2</label>
                          <input
                            type="text"
                            placeholder="Image URL"
                            value={adminData.siteContent.bannerImage2 || ''}
                            onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, bannerImage2: e.target.value }})}
                            className="w-full text-[#111827] bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg focus:outline-none mb-1 text-[10px]"
                          />
                          <div className="relative border border-dashed border-stone-200 bg-stone-50 rounded-lg p-2 text-center hover:bg-stone-100/50 transition cursor-pointer">
                            <input
                              type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  await handleImageUpload(file, (url) =>
                                    setAdminData((prev) =>
                                      prev
                                        ? { ...prev, siteContent: { ...prev.siteContent, bannerImage2: url } }
                                        : prev
                                    )
                                  );
                                }
                                e.target.value = '';
                              }}
                            />
                            <span className="text-[9px] text-[#1a234d] font-extrabold uppercase tracking-wide">
                              {uploadingImage ? 'Uploading to ImgBB...' : 'Or upload to ImgBB'}
                            </span>
                          </div>
                        </div>
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
                        <div>
                          <label className="block text-[9px] uppercase font-black text-stone-500 mb-1">Banner Image 3</label>
                          <input
                            type="text"
                            placeholder="Image URL"
                            value={adminData.siteContent.bannerImage3 || ''}
                            onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, bannerImage3: e.target.value }})}
                            className="w-full text-stone-800 bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg focus:outline-none mb-1 text-[10px]"
                          />
                          <div className="relative border border-dashed border-stone-200 bg-stone-50 rounded-lg p-2 text-center hover:bg-stone-100/50 transition cursor-pointer">
                            <input
                              type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  await handleImageUpload(file, (url) =>
                                    setAdminData((prev) =>
                                      prev
                                        ? { ...prev, siteContent: { ...prev.siteContent, bannerImage3: url } }
                                        : prev
                                    )
                                  );
                                }
                                e.target.value = '';
                              }}
                            />
                            <span className="text-[9px] text-[#1a234d] font-extrabold uppercase tracking-wide">
                              {uploadingImage ? 'Uploading to ImgBB...' : 'Or upload to ImgBB'}
                            </span>
                          </div>
                        </div>
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
                        <label className="block text-[9px] uppercase font-black text-stone-500">{label}</label>
                        <input
                          type="text"
                          placeholder="Image URL"
                          value={adminData.siteContent[field] || ''}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, [field]: e.target.value },
                            })
                          }
                          className="w-full text-stone-800 bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg text-[10px]"
                        />
                        <div className="relative border border-dashed border-stone-200 bg-stone-50 rounded-lg p-2 text-center cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                await handleImageUpload(
                                  file,
                                  (url) =>
                                    setAdminData((prev) =>
                                      prev
                                        ? { ...prev, siteContent: { ...prev.siteContent, [field]: url } }
                                        : prev
                                    ),
                                  uploadKey
                                );
                              }
                              e.target.value = '';
                            }}
                          />
                          <span className="text-[9px] text-[#1a234d] font-extrabold uppercase">
                            {uploadingImage === uploadKey ? 'Uploading...' : 'Upload to ImgBB'}
                          </span>
                        </div>
                        {adminData.siteContent[field] && (
                          <div className="relative w-full h-24 rounded-lg overflow-hidden border border-stone-100">
                            <Image
                              src={adminData.siteContent[field]!}
                              alt={label}
                              fill
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
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
                      <label className="block text-[10px] uppercase font-black text-stone-500 mb-1.5">
                        About Us Representative Image
                      </label>
                      <div className="p-4 bg-white border border-stone-200 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <span className="text-[10px] text-stone-400 font-bold uppercase block">Method 1: Paste Asset URL</span>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/about-foods-photo"
                            value={adminData.siteContent.aboutImage || ''}
                            onChange={(e) => setAdminData({ ...adminData, siteContent: { ...adminData.siteContent, aboutImage: e.target.value }})}
                            className="w-full text-stone-800 bg-stone-50 border border-stone-200 px-3 py-2 rounded-lg focus:outline-none text-xs"
                          />
                          
                          <div className="relative border border-dashed border-stone-300 bg-stone-50 rounded-xl p-4 text-center hover:bg-stone-100 transition cursor-pointer">
                            <input
                              type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  await handleImageUpload(file, (url) =>
                                    setAdminData((prev) =>
                                      prev ? { ...prev, siteContent: { ...prev.siteContent, aboutImage: url } } : prev
                                    )
                                  );
                                }
                                e.target.value = '';
                              }}
                            />
                            <span className="text-[10px] text-[#1a234d] font-black uppercase block font-sans">
                              {uploadingImage ? 'Uploading to ImgBB...' : 'Method 2: Upload to ImgBB'}
                            </span>
                            <span className="text-[9px] text-stone-400 block mt-0.5">Drag-and-drop or click to upload</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-center p-3 bg-stone-50 border border-stone-100 rounded-xl relative overflow-hidden">
                          {adminData.siteContent.aboutImage ? (
                            <div className="relative w-full h-32 rounded-lg overflow-hidden border border-stone-200">
                              <Image
                                src={adminData.siteContent.aboutImage}
                                alt="About preview photo"
                                fill
                                className="object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          ) : (
                            <span className="text-stone-300 text-[10px] italic">No active story image specified</span>
                          )}
                        </div>
                      </div>
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
                      <div key={field} className="space-y-2">
                        <label className="block text-[10px] uppercase font-black text-stone-500">{label}</label>
                        <input
                          type="text"
                          value={adminData.siteContent[field] || ''}
                          onChange={(e) =>
                            setAdminData({
                              ...adminData,
                              siteContent: { ...adminData.siteContent, [field]: e.target.value },
                            })
                          }
                          className="w-full text-stone-800 bg-white border border-stone-200 px-3 py-2 rounded-lg text-[10px]"
                        />
                        <div className="relative border border-dashed border-stone-200 bg-stone-50 rounded-lg p-2 text-center cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                await handleImageUpload(
                                  file,
                                  (url) =>
                                    setAdminData((prev) =>
                                      prev
                                        ? { ...prev, siteContent: { ...prev.siteContent, [field]: url } }
                                        : prev
                                    ),
                                  uploadKey
                                );
                              }
                              e.target.value = '';
                            }}
                          />
                          <span className="text-[9px] text-[#1a234d] font-extrabold uppercase">
                            {uploadingImage === uploadKey ? 'Uploading...' : 'Upload to ImgBB'}
                          </span>
                        </div>
                        {adminData.siteContent[field] && (
                          <div className="relative w-full h-32 rounded-lg overflow-hidden border border-stone-100">
                            <Image
                              src={adminData.siteContent[field]!}
                              alt={label}
                              fill
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
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
                  প্রাকৃতিক সৌন্দর্যের গ্যালারি — marquee slider images (add/edit items below)
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEditingGallery({
                    title: '',
                    titleBn: '',
                    description: '',
                    descriptionBn: '',
                    image: '',
                    slot: 1,
                    sortOrder: adminData.galleryItems.length,
                  })
                }
                className="bg-[#1a234d] text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl"
              >
                Add Gallery Item
              </button>
            </div>

            {editingGallery && (
              <div className="bg-white border border-stone-100 rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    placeholder="Title (EN)"
                    value={editingGallery.title || ''}
                    onChange={(e) => setEditingGallery({ ...editingGallery, title: e.target.value })}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Title (BN)"
                    value={editingGallery.titleBn || ''}
                    onChange={(e) => setEditingGallery({ ...editingGallery, titleBn: e.target.value })}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <textarea
                    placeholder="Description (EN)"
                    value={editingGallery.description || ''}
                    onChange={(e) => setEditingGallery({ ...editingGallery, description: e.target.value })}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm md:col-span-2"
                    rows={2}
                  />
                  <textarea
                    placeholder="Description (BN)"
                    value={editingGallery.descriptionBn || ''}
                    onChange={(e) => setEditingGallery({ ...editingGallery, descriptionBn: e.target.value })}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm md:col-span-2"
                    rows={2}
                  />
                  <select
                    value={editingGallery.slot ?? 1}
                    onChange={(e) => setEditingGallery({ ...editingGallery, slot: Number(e.target.value) })}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value={1}>Slot 1 — Main (top)</option>
                    <option value={2}>Slot 2 — Bottom left</option>
                    <option value={3}>Slot 3 — Bottom right</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Sort order"
                    value={editingGallery.sortOrder ?? 0}
                    onChange={(e) => setEditingGallery({ ...editingGallery, sortOrder: Number(e.target.value) })}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, (url) => setEditingGallery({ ...editingGallery, image: url }));
                    }}
                    className="text-sm"
                  />
                  {editingGallery.image && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                      <Image src={editingGallery.image} alt="" fill className="object-cover" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={handleSaveGallery} disabled={isPending} className="bg-[#1a234d] text-white px-5 py-2 rounded-lg text-sm font-bold">
                    Save
                  </button>
                  <button type="button" onClick={() => setEditingGallery(null)} className="border px-5 py-2 rounded-lg text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {adminData.galleryItems.map((item) => (
                <div key={item.id} className="bg-white border border-stone-100 rounded-2xl overflow-hidden">
                  <div className="relative h-40">
                    <Image src={item.image} alt={item.title} fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="font-bold text-sm">{item.titleBn || item.title}</p>
                    <p className="text-xs text-stone-500">Slot {item.slot}</p>
                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setEditingGallery(item)} className="text-xs font-bold text-[#1a234d]">
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDeleteGallery(item.id)} className="text-xs font-bold text-stone-400">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-3xl font-black text-stone-900">Review Moderation</h3>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">
                  Edit customer review text & photo, or delete testimonials
                </p>
              </div>
            </div>

            {editingReview && (
              <div className="bg-white border border-stone-100 rounded-2xl p-6 space-y-4">
                <h4 className="font-bold text-stone-900">Edit Review</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    placeholder="Customer name"
                    value={editingReview.name || ''}
                    onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min={1}
                    max={5}
                    placeholder="Rating 1-5"
                    value={editingReview.rating ?? 5}
                    onChange={(e) => setEditingReview({ ...editingReview, rating: Number(e.target.value) })}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <textarea
                    placeholder="Review text"
                    value={editingReview.text || ''}
                    onChange={(e) => setEditingReview({ ...editingReview, text: e.target.value })}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm md:col-span-2"
                    rows={3}
                  />
                  <input
                    placeholder="Photo URL"
                    value={editingReview.image || ''}
                    onChange={(e) => setEditingReview({ ...editingReview, image: e.target.value })}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm md:col-span-2"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file, (url) => setEditingReview({ ...editingReview, image: url }), 'review-edit');
                      }
                      e.target.value = '';
                    }}
                    className="text-xs"
                  />
                  {editingReview.image && (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-stone-200">
                      <Image src={editingReview.image} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveReview}
                    disabled={isPending}
                    className="bg-[#1a234d] text-white text-xs font-bold px-4 py-2 rounded-lg"
                  >
                    Save Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingReview(null)}
                    className="text-xs font-bold text-stone-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adminData.reviews.length === 0 ? (
                <div className="md:col-span-2 bg-white rounded-3xl border border-stone-100 p-12 text-center text-stone-400 font-bold">
                  No verified customer testimonials submitted yet.
                </div>
              ) : (
                adminData.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm relative flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Person header */}
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-stone-50 border border-stone-100">
                          <Image
                            src={rev.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                            alt={rev.name}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-stone-900 text-sm leading-tight">{rev.name}</h4>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Comment text */}
                      <p className="text-stone-600 text-sm italic leading-relaxed">
                        &ldquo;{rev.text}&rdquo;
                      </p>
                    </div>

                    {/* Footer operations */}
                    <div className="mt-6 pt-4 border-t border-stone-50 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-stone-400 font-black uppercase tracking-widest truncate">
                        ID: {rev.id}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingReview({ ...rev })}
                          className="flex items-center gap-1 hover:text-[#1a234d] text-stone-500 text-xs font-bold transition cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => {
                          if (confirm('Are you absolutely sure you want to delete this customer review?')) {
                            startTransition(async () => {
                              const r = await deleteReviewAction(password, rev.id);
                              if (r.success) {
                                showToast('Review deleted successfully!', 'success');
                                refreshAdminData(password);
                              } else {
                                showToast(r.error || 'Failed to delete review', 'error');
                              }
                            });
                          }
                        }}
                        disabled={isPending}
                        className="flex items-center gap-1 hover:text-[#1a234d] text-stone-400 text-xs font-bold transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* CREATOR DIALOG DICTIONARY: PRODUCT */}
      <AnimatePresence>
        {showProductDialog && editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-y-auto max-h-[90vh]"
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

                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <label className="block uppercase font-bold tracking-widest text-stone-500 mb-1 leading-none">
                      Total In Stock count
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="E.g., 40"
                      value={editingProduct.stock === undefined ? '' : editingProduct.stock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                      className="w-full text-[#111827] bg-stone-50 border border-stone-200 text-sm px-4 py-3 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block uppercase font-bold tracking-widest text-stone-500 mb-0 leading-none">
                      Product Display Image
                    </label>
                  </div>
                  
                  <div className="space-y-2 p-3 bg-stone-50 border border-stone-200 rounded-2xl">
                    <div>
                      <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wide block mb-1">Option A: Image Web URL</span>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/promo-honey-photo"
                        required
                        value={editingProduct.image || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        className="w-full text-stone-800 bg-white border border-stone-200 text-xs px-3 py-2 rounded-lg focus:outline-none font-medium"
                      />
                    </div>
                    
                    <div className="relative flex items-center justify-center p-4 border border-dashed border-stone-300 bg-white rounded-xl hover:bg-stone-50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            await handleImageUpload(file, (url) =>
                              setEditingProduct((prev) => (prev ? { ...prev, image: url } : prev))
                            );
                          }
                          e.target.value = '';
                        }}
                      />
                      <div className="text-center space-y-1">
                        <Plus className="w-4 h-4 mx-auto text-stone-400" />
                        <span className="text-[10px] font-black uppercase text-[#1a234d] block">
                          {uploadingImage ? 'Uploading to ImgBB...' : 'Option B: Upload to ImgBB'}
                        </span>
                        <p className="text-[9px] text-stone-400 font-medium">JPEG, PNG or WebP — hosted on ImgBB CDN</p>
                      </div>
                    </div>

                    {editingProduct.image && (
                      <div className="pt-2 flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg border border-stone-200 bg-white overflow-hidden shrink-0">
                          <Image
                            src={editingProduct.image}
                            alt="Preview Product Asset"
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="min-w-0 pr-2">
                          <span className="text-[9px] font-extrabold uppercase text-emerald-600 block font-sans">✓ Selected & Loaded</span>
                          <span className="text-[9px] text-stone-400 truncate block font-mono">
                            {editingProduct.image.includes('ibb.co') ? 'ImgBB CDN URL' : editingProduct.image}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

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

      {/* CREATOR DIALOG DICTIONARY: CATEGORY */}
      <AnimatePresence>
        {showCategoryDialog && editingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
