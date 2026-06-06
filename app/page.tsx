'use client';

import React, { useState, useEffect, useTransition, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Star,
  X,
  ChevronRight,
  ChevronLeft,
  Send,
  Lock,
  Eye,
  Check,
  Package,
  ArrowRight,
  Search,
  Menu,
  Heart,
  Filter,
  Phone,
  User,
  Mail,
  MapPin,
  Facebook,
  Youtube,
  Instagram,
  Droplets,
  CalendarDays,
  Leaf,
  Container,
  FolderMinus,
  MessageSquareShare
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getStoreData, placeStoreOrder, submitContactAction, submitReviewAction } from './actions';
import { Category, Product, Review, SiteContent, GalleryItem, FaqItem } from '@/lib/types';
import { ScrollReveal } from '@/components/scroll-reveal';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/button';
import { FaqSection } from '@/components/faq-section';
import { Footer } from '@/components/footer';
import { GallerySection } from '@/components/gallery-section';
import { ReviewSlider } from '@/components/review-slider';
import { HeroSection } from '@/components/hero-section';
import { Navbar } from '@/components/navbar';
import { PromoBanner } from '@/components/promo-banner';
import { AboutSection } from '@/components/about-section';
import { t } from '@/lib/i18n-bn';

// Helper for Lucide Categories icon rendering
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Droplets':
      return <Droplets className="w-6 h-6 text-[var(--kf-primary)]" />;
    case 'Nut':
      return <Leaf className="w-6 h-6 text-[var(--kf-primary)]" />; // Fallback clean look
    case 'CalendarDays':
      return <CalendarDays className="w-6 h-6 text-[var(--kf-primary)]" />;
    case 'Leaf':
      return <Leaf className="w-6 h-6 text-[var(--kf-primary)]" />;
    case 'Container':
      return <Container className="w-6 h-6 text-[var(--kf-primary)]" />;
    default:
      return <ShoppingBag className="w-6 h-6 text-[var(--kf-primary)]" />;
  }
};

interface CartItem {
  product: Product;
  quantity: number;
}

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const defaultBannerSlides = [
  {
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=1200',
    titleBn: 'রাজশাহী প্রিমিয়াম হিমসাগর আম',
    titleEn: 'Rajshahi Premium Himsagar Mango',
    taglineBn: 'আমের রাজা রাজশাহী থেকে',
    taglineEn: 'SENSATIONAL HIMSAGAR',
  },
  {
    image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=1200',
    titleBn: 'অর্গানিক মিষ্টি আম্রপালি আম',
    titleEn: 'Organic Sweet Amrapali Mango',
    taglineBn: 'সেরা স্বাদের শতভাগ প্রাকৃতিক',
    taglineEn: 'ORGANIC AMRAPALI CROP',
  },
  {
    image: 'https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=1200',
    titleBn: 'রয়েল পাকা আমের ঐতিহ্যবাহী আমসত্ত্ব',
    titleEn: 'Pure Organic Sweet Mango Bars',
    taglineBn: 'রোদে শুকানো খাঁটি স্বাদ',
    taglineEn: 'TRADITIONAL AMSOTTO BAR',
  },
];

export default function StorefrontPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart & checkout states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  // Wishlist / Like support
  const [likes, setLikes] = useState<string[]>([]);

  useEffect(() => {
    const savedLikes = localStorage.getItem('khanfoods_likes');
    if (savedLikes) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLikes(JSON.parse(savedLikes));
      } catch (e) {}
    }
  }, []);

  const toggleLike = (productId: string) => {
    setLikes((prev) => {
      const updated = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      localStorage.setItem('khanfoods_likes', JSON.stringify(updated));
      showToast(
        prev.includes(productId)
          ? ('পছন্দের তালিকা থেকে সরানো হয়েছে!')
          : ('পছন্দের তালিকায় যুক্ত হয়েছে!'),
        'info'
      );
      return updated;
    });
  };

  // Form states
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
    deliveryZone: '' as 'inside_dhaka' | 'outside_dhaka' | '',
  });
  
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [reviewForm, setReviewForm] = useState({
    name: '',
    rating: 5,
    text: ''
  });

  // UI state for Toast
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastCounterRef = useRef(0);
  
  const [isPending, startTransition] = useTransition();

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    toastCounterRef.current += 1;
    const id = toastCounterRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Load store data initially
  useEffect(() => {
    async function loadData() {
      const res = await getStoreData();
      if (res.success && 'categories' in res) {
        setCategories(res.categories || []);
        setProducts(res.products || []);
        setReviews(res.reviews || []);
        setGalleryItems(res.galleryItems || []);
        setFaqItems(res.faqItems || []);
        setSiteContent(res.siteContent || null);
      } else {
        showToast('স্টোর লোড করতে সমস্যা হয়েছে।', 'error');
      }
      setLoading(false);
    }
    loadData();

    // Load cart from local storage on client asynchronously to avoid synchronous cascading renders
    const savedCart = localStorage.getItem('khanfoods_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setTimeout(() => {
          setCart(parsed);
        }, 0);
      } catch (e) {
        console.error('Failed to parse saved cart');
      }
    }
  }, []);

  // Sync cart to local storage
  const saveCartToLocalStorage = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('khanfoods_cart', JSON.stringify(newCart));
  };

  // Cart operations
  const addToCart = (product: Product, quantity: number = 1) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    let newCart = [...cart];

    if (existingIndex > -1) {
      const nextQty = newCart[existingIndex].quantity + quantity;
      if (nextQty > product.stock) {
        showToast(`Cannot add more than ${product.stock} units of ${product.name}!`, 'error');
        return;
      }
      newCart[existingIndex].quantity = nextQty;
    } else {
      if (quantity > product.stock) {
        showToast(`Only ${product.stock} units available!`, 'error');
        return;
      }
      newCart.push({ product, quantity });
    }

    saveCartToLocalStorage(newCart);
        showToast(`${product.name} কার্টে যুক্ত হয়েছে!`, 'success');
    setShowCart(true); // Open cart drawer
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    const newCart = cart
      .map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty > item.product.stock) {
            showToast(`Only ${item.product.stock} items currently in stock!`, 'error');
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    saveCartToLocalStorage(newCart);
  };

  const removeFromCart = (productId: string, name: string) => {
    const newCart = cart.filter((item) => item.product.id !== productId);
    saveCartToLocalStorage(newCart);
    showToast(`${name} removed from cart.`, 'info');
  };

  // Calculation pricing
  const subtotal = cart.reduce((sum, item) => {
    const activePrice = item.product.price * (1 - item.product.discount / 100);
    return sum + activePrice * item.quantity;
  }, 0);

  const getDeliveryFee = (zone: typeof checkoutForm.deliveryZone) => {
    if (subtotal === 0) return 0;
    if (subtotal >= 1500) return 0;
    if (zone === 'inside_dhaka') return 80;
    if (zone === 'outside_dhaka') return 150;
    return 0;
  };

  const deliveryFee = getDeliveryFee(checkoutForm.deliveryZone);
  const total = subtotal + deliveryFee;

  // Search and categorization filtering
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const nameToMatch = (product.name + " " + (product.nameBn || "")).toLowerCase();
    const descToMatch = (product.description + " " + (product.descriptionBn || "")).toLowerCase();
    const matchesQuery = nameToMatch.includes(searchQuery.toLowerCase()) ||
                         descToMatch.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Place order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) {
      showToast('নাম, ফোন ও ঠিকানা পূরণ করুন!', 'error');
      return;
    }
    if (!checkoutForm.deliveryZone) {
      showToast(t.deliveryZoneRequired, 'error');
      return;
    }

    const zoneLabel =
      checkoutForm.deliveryZone === 'inside_dhaka'
        ? `${t.insideDhaka} — ${t.deliveryInsideFee}`
        : `${t.outsideDhaka} — ${t.deliveryOutsideFee}`;
    const combinedNotes = [zoneLabel, checkoutForm.notes].filter(Boolean).join(' | ');

    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price * (1 - item.product.discount / 100),
      quantity: item.quantity,
    }));

    startTransition(async () => {
      const res = await placeStoreOrder(
        { ...checkoutForm, notes: combinedNotes },
        orderItems,
        total
      );
      if (res.success) {
        setOrderSuccess(res.order);
        saveCartToLocalStorage([]); // clear cart
        setShowCheckout(false);
        setCheckoutForm({ name: '', phone: '', address: '', notes: '', deliveryZone: '' });
        showToast('অর্ডার কনফার্ম হয়েছে!', 'success');
      } else {
        showToast(res.error || 'Failed to place order', 'error');
      }
    });
  };

  // Submit Contact
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      showToast('সব তথ্য পূরণ করুন', 'error');
      return;
    }

    const res = await submitContactAction(contactForm);
    if (res.success) {
      showToast('বার্তা পাঠানো হয়েছে! শীঘ্রই যোগাযোগ করব।', 'success');
      setContactForm({ name: '', email: '', message: '' });
    } else {
      showToast(res.error || 'Submission failed.', 'error');
    }
  };

  // Submit Review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.text) {
      showToast('নাম ও রিভিউ লিখুন!', 'error');
      return;
    }

    const res = await submitReviewAction(reviewForm);
    if (res.success && res.review) {
      setReviews((prev) => [res.review!, ...prev]);
      showToast('ধন্যবাদ! আপনার রিভিউ প্রকাশিত হয়েছে।', 'success');
      setReviewForm({ name: '', rating: 5, text: '' });
    } else {
      showToast(res.error || 'Review save failed.', 'error');
    }
  };

  // Active elements fallback
  const headline = siteContent?.heroHeadlineBn || siteContent?.heroHeadline || "খাঁটি ও প্রাকৃতিক প্রিমিয়াম অর্গানিক ফুড স্টোর";
  const subheadline = siteContent?.heroSubheadlineBn || siteContent?.heroSubheadline || "সরাসরি প্রকৃতি থেকে সংগৃহীত শতভাগ খাঁটি মধু, ঘি, বাদাম ও অর্গানিক পণ্য।";

  // Admin-controlled banner slides
  const bannerSlides = siteContent
    ? [
        {
          image: siteContent.bannerImage1 || defaultBannerSlides[0].image,
          title: siteContent.bannerTitle1Bn || siteContent.bannerTitle1,
          tagline: siteContent.bannerTagline1Bn || siteContent.bannerTagline1,
        },
        {
          image: siteContent.bannerImage2 || defaultBannerSlides[1].image,
          title: siteContent.bannerTitle2Bn || siteContent.bannerTitle2,
          tagline: siteContent.bannerTagline2Bn || siteContent.bannerTagline2,
        },
        {
          image: siteContent.bannerImage3 || defaultBannerSlides[2].image,
          title: siteContent.bannerTitle3Bn || siteContent.bannerTitle3,
          tagline: siteContent.bannerTagline3Bn || siteContent.bannerTagline3,
        },
      ]
    : defaultBannerSlides.map((s) => ({
        image: s.image,
        title: s.titleBn,
        tagline: s.taglineBn,
      }));

  const heroImages = [
    ...galleryItems.map((g) => g.image),
    ...bannerSlides.map((b) => b.image),
    ...products.slice(0, 4).map((p) => p.image),
  ].slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Toast Notification Container */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className={`p-4 rounded-xl shadow-2xl pointer-events-auto flex items-center gap-3 border-l-4 backdrop-blur-md ${
                toast.type === 'success'
                  ? 'bg-emerald-50/95 border-emerald-500 text-emerald-950 shadow-emerald-100'
                  : toast.type === 'error'
                  ? 'bg-[var(--kf-peach)]/20 border-[var(--kf-primary)] text-[var(--kf-navy)] shadow-[var(--kf-peach)]/30'
                  : 'bg-stone-50/95 border-stone-500 text-stone-950 shadow-stone-100'
              }`}
            >
              {toast.type === 'success' && <Check className="w-5 h-5 text-emerald-600 shrink-0" />}
              {toast.type === 'error' && <X className="w-5 h-5 text-[var(--kf-primary)] shrink-0" />}
              <p className="text-sm font-medium">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <PromoBanner />
      <Navbar
        cartCount={cart.reduce((s, c) => s + c.quantity, 0)}
        onCartOpen={() => setShowCart(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* HERO SECTION */}
      <HeroSection headline={headline} subheadline={subheadline} images={heroImages} />

      {/* CATEGORIES SECTION */}
      <section id="categories" className="py-20 kf-section-muted border-y">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="kf-badge mb-3">
              {'আমাদের খাদ্য সম্ভার'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold kf-heading tracking-tight">
              {'ক্যাটাগরি সমূহ'}
            </h2>
            <p className="kf-text-muted mt-2 text-sm sm:text-base">
              {'সরাসরি বাংলাদেশের গ্রামীন খাঁটি উৎস থেকে সংগৃহীত প্রাকৃতিক ও স্বাস্থ্যকর খাদ্য সম্ভার।'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((cat, idx) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  // Scroll down to products
                  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`p-6 rounded-none border text-center bg-[var(--kf-card-bg)] flex flex-col items-center justify-center gap-4 cursor-pointer group card-hover card-shine ${
                  selectedCategory === cat.name
                    ? 'border-[var(--kf-primary)] shadow-xl shadow-[var(--kf-peach)]/40 bg-[var(--kf-primary-light)]/30'
                    : 'border-[var(--kf-border)] hover:border-[var(--kf-primary)]/40 hover:shadow-lg'
                }`}
              >
                <div className={`p-4 rounded-none transition ${
                  selectedCategory === cat.name ? 'bg-[var(--kf-primary)]/10' : 'bg-[var(--kf-section-bg)] group-hover:bg-[var(--kf-primary-light)]/40'
                }`}>
                  {getCategoryIcon(cat.icon)}
                </div>
                <div>
                  <h4 className="font-bold kf-heading text-xs sm:text-sm group-hover:text-[var(--kf-primary)] transition mb-0.5 uppercase tracking-wider">
                    {cat.nameBn || cat.name}
                  </h4>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.15em] block">
                    {'শতভাগ পিওর'}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* PRODUCTS DISPLAY SECTION */}
      <section id="products" className="py-20 kf-section-card border-b">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-6 sm:px-10"
        >
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-100 pb-8">
            <div>
              <span className="kf-badge mb-3">
                {'বিশুদ্ধতার গ্যারান্টি'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold kf-heading tracking-tight">
                {'আমাদের বিশেষ প্রিমিয়াম পণ্যসমূহ'}
              </h2>
              <p className="kf-text-muted text-sm sm:text-base mt-2">
                {'কোনো ভেজাল নেই, কোনো কৃত্রিম কেমিক্যাল বা চিনি নেই। শতভাগ খাঁটি স্বাদের নিশ্চয়তা।'}
              </p>
            </div>

            {/* In-page dynamic desktop category filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="filter"
                active={selectedCategory === 'All'}
                onClick={() => setSelectedCategory('All')}
              >
                {t.allProducts}
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant="filter"
                  active={selectedCategory === cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                >
                  {cat.nameBn || cat.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Catalog Loading fallback */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="w-10 h-10 border-2 border-slate-100 border-t-[var(--kf-primary)] animate-spin" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {'খান ফুডস ভল্ট লোড হচ্ছে...'}
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-[var(--kf-border)] rounded-none bg-[var(--kf-section-bg)]">
              <FolderMinus className="w-10 h-10 mx-auto text-slate-300 mb-4" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                {'কোনো পণ্য পাওয়া যায়নি'}
              </h4>
              <p className="text-slate-400 text-xs mt-1">
                {'ফিল্টার পরিবর্তন করে অথবা অন্য কোনো কি-ওয়ার্ড দিয়ে আবার চেষ্টা করুন।'}
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              >
                {'রিসেট সার্চ'}
              </Button>
            </div>
          ) : (
            <div className="product-cards">
              <div className="pc-grid">
                {filteredProducts.map((p, idx) => {
                  const catMatch = categories.find((c) => c.name === p.category);
                  return (
                    <ProductCard
                      key={p.id}
                      product={p}
                      index={idx}
                      categoryLabel={catMatch?.nameBn || catMatch?.name || p.category}
                      onAddToCart={() => addToCart(p, 1)}
                      onImageClick={() => setQuickViewProduct(p)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </section>

      <AboutSection siteContent={siteContent} reviews={reviews} />

      <ScrollReveal>
        <GallerySection items={galleryItems} />
      </ScrollReveal>

      {/* REVIEWS TESTIMONIALS SECTION */}
      <section id="reviews" className="py-20 kf-section-muted border-t">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-6 sm:px-10"
        >
          <div className="text-center mb-10">
            <span className="kf-badge mb-3">
              {t.customerStories}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold kf-heading tracking-tight leading-tight">
              {t.reviewsTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="bg-gradient-to-tr from-slate-200 to-slate-50 rounded-3xl p-6 sm:p-10">
              <ReviewSlider reviews={reviews} />
            </div>

            {/* Testimonials write form */}
            <div className="bg-[var(--kf-card-bg)] border border-[var(--kf-border)] p-8 rounded-none shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquareShare className="w-5 h-5 text-[var(--kf-primary)]" />
                <h3 className="font-serif text-xl font-bold kf-heading tracking-tight">
                  {t.addReviewTitle}
                </h3>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mb-6 leading-relaxed">
                {t.addReviewSub}
              </p>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-1">
                    {t.nameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.namePlaceholder}
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    className="w-full text-slate-800 bg-slate-50 border border-slate-200 text-xs px-4 py-3 rounded-none focus:outline-none focus:ring-1 focus:ring-[var(--kf-primary)] focus:border-[var(--kf-primary)] transition"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-1">
                    {t.ratingLabel}
                  </label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: stars })}
                        className="p-1 rounded-none hover:bg-slate-50 transition cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 transition ${
                            stars <= reviewForm.rating
                              ? 'fill-amber-500 text-amber-500 scale-105'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-1">
                    {t.reviewTextLabel}
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder={t.reviewTextPlaceholder}
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                    className="w-full text-slate-800 bg-slate-50 border border-slate-200 text-xs px-4 py-3 rounded-none focus:outline-none focus:ring-1 focus:ring-[var(--kf-primary)] focus:border-[var(--kf-primary)] transition"
                  />
                </div>

                <Button type="submit" fullWidth size="lg" className="mt-0">
                  <Send className="w-4 h-4" /> {t.submitReview}
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </section>

      <ScrollReveal>
        <FaqSection items={faqItems} />
      </ScrollReveal>

      {/* CONTACT EDITORIAL SECTION */}
      <ScrollReveal>
      <section id="contact" className="py-20 kf-section-card relative overflow-hidden">

        <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">
          <div className="max-w-4xl mx-auto rounded-none overflow-hidden border border-[var(--kf-border)] shadow-2xl bg-[var(--kf-card-bg)] grid grid-cols-1 md:grid-cols-5">
            {/* Left coordinates banner */}
            <div className="md:col-span-2 kf-contact-gradient-soft kf-contact-panel p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-[-30px] right-[-30px] w-40 h-40 bg-[var(--kf-primary)]/20 rounded-full blur-2xl" />

              <div className="space-y-6 relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] block opacity-80">
                  {t.contactConnect}
                </span>
                <h3 className="text-3xl font-serif font-bold tracking-tight leading-tight">
                  {t.contactHeading}
                </h3>
                <p className="text-sm leading-relaxed opacity-85">
                  {t.contactDesc}
                </p>
              </div>

              <div className="space-y-5 pt-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/40 rounded-none border border-[var(--kf-peach)]/60">
                    <Phone className="w-4 h-4 text-[var(--kf-primary)]" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">{siteContent?.contactPhone || '+880 1712-345678'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/40 rounded-none border border-[var(--kf-peach)]/60">
                    <Mail className="w-4 h-4 text-[var(--kf-primary)]" />
                  </div>
                  <span className="text-xs opacity-90">{siteContent?.contactEmail || 'support@khanfoods.com.bd'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/40 rounded-none border border-[var(--kf-peach)]/60">
                    <MapPin className="w-4 h-4 text-[var(--kf-primary)]" />
                  </div>
                  <span className="text-xs opacity-90 leading-normal">{siteContent?.contactAddress || 'Road 12, Banani, Dhaka-1213'}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6 opacity-70 border-t border-[var(--kf-peach)]/40 z-10">
                <a href={siteContent?.facebookUrl} target="_blank" className="hover:text-white transition p-1.5 hover:bg-white/5 rounded-none">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href={siteContent?.instagramUrl} target="_blank" className="hover:text-white transition p-1.5 hover:bg-white/5 rounded-none">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href={siteContent?.youtubeUrl} target="_blank" className="hover:text-white transition p-1.5 hover:bg-white/5 rounded-none">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right contact input form */}
            <div className="md:col-span-3 p-8 lg:p-12 bg-[var(--kf-card-bg)]">
              <h4 className="font-serif text-2xl font-bold kf-heading mb-2 tracking-tight">
                {t.dropLine}
              </h4>
              <p className="text-xs text-slate-400 mb-6 font-medium">
                {t.contactFormHint}
              </p>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-[var(--kf-text)] mb-1.5">
                    {t.nameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.namePlaceholder}
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full text-slate-800 bg-slate-50 border border-slate-200 text-xs px-4 py-3 rounded-none focus:outline-none focus:ring-1 focus:ring-[var(--kf-primary)] focus:border-[var(--kf-primary)] transition"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-[var(--kf-text)] mb-1.5">
                    {t.emailLabel}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="example@gmail.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full text-slate-800 bg-slate-50 border border-slate-200 text-xs px-4 py-3 rounded-none focus:outline-none focus:ring-1 focus:ring-[var(--kf-primary)] focus:border-[var(--kf-primary)] transition"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold tracking-widest text-[var(--kf-text)] mb-1.5">
                    {t.messageLabel}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={t.messagePlaceholder}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full text-slate-800 bg-slate-50 border border-slate-200 text-xs px-4 py-3 rounded-none focus:outline-none focus:ring-1 focus:ring-[var(--kf-primary)] focus:border-[var(--kf-primary)] transition"
                  />
                </div>

                <Button type="submit" fullWidth size="lg" className="mt-4">
                  {t.sendButton}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* FOOTER */}
      <Footer
        siteContent={siteContent}
        categories={categories}
        onCategorySelect={setSelectedCategory}
      />

      {/* QUICK VIEW CUSTOM MODAL */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewProduct(null)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-2xl bg-[var(--kf-card-bg)] rounded-3xl overflow-hidden shadow-2xl border border-[var(--kf-border)] grid grid-cols-1 md:grid-cols-2 z-10 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-stone-50 hover:bg-[var(--kf-primary-light)] hover:text-[var(--kf-primary)] rounded-full transition"
              >
                <X className="w-5 h-5 text-stone-800" />
              </button>

              {/* Product Image preview */}
              <div className="relative aspect-square md:h-full w-full bg-stone-50">
                <Image
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  fill
                  className="object-cover img-hover"
                  referrerPolicy="no-referrer"
                  sizes="(max-w-sm) 100vw, 400px"
                />
              </div>

              {/* Product Info right pane */}
              <div className="p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest font-black text-[var(--kf-primary)] bg-[var(--kf-primary-light)] px-2.5 py-1 rounded inline-block mb-3">
                    {categories.find((c) => c.name === quickViewProduct.category)?.nameBn ||
                      quickViewProduct.category}
                  </span>
                  <h3 className="font-serif text-2xl font-black text-stone-900 leading-tight">
                    {quickViewProduct.nameBn || quickViewProduct.name}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-2 mb-4">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="font-bold text-stone-800 text-sm">
                      {quickViewProduct.rating.toFixed(1)}
                    </span>
                    <span className="text-stone-400 text-xs">স্টক যাচাই সম্পন্ন</span>
                  </div>

                  <p className="text-stone-600 text-sm leading-relaxed mb-6">
                    {quickViewProduct.descriptionBn || quickViewProduct.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-stone-500 mb-6 bg-stone-50 p-4 rounded-xl">
                    <p className="flex items-center gap-1">
                      <span className="font-bold text-stone-700">{t.purityStatus}:</span> {t.purityValue}
                    </p>
                    <p className="flex items-center gap-1">
                      <span className="font-bold text-stone-700">{t.labAnalysis}:</span> {t.labValue}
                    </p>
                    <p className="flex items-center gap-1">
                      <span className="font-bold text-stone-700">{t.availability}:</span> {quickViewProduct.stock > 0 ? `${quickViewProduct.stock} পিস বাকি` : t.restocking}
                    </p>
                  </div>
                </div>

                {/* Addition action */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    {quickViewProduct.discount > 0 ? (
                      <>
                        <span className="block text-xs text-stone-400 line-through">
                          {quickViewProduct.price.toLocaleString()} BDT
                        </span>
                        <span className="text-2xl font-black text-[var(--kf-primary)]">
                          {(quickViewProduct.price * (1 - quickViewProduct.discount / 100)).toLocaleString()}{' '}
                          <span className="text-xs font-bold font-sans">BDT</span>
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-black text-stone-900">
                        {quickViewProduct.price.toLocaleString()}{' '}
                        <span className="text-xs font-bold font-sans">BDT</span>
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => {
                      addToCart(quickViewProduct, 1);
                      setQuickViewProduct(null);
                    }}
                    disabled={quickViewProduct.stock <= 0}
                  >
                    {t.addToCartFull}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CART DRAWER ON SIDE */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="absolute inset-0 bg-stone-950/40 backdrop-blur-sm"
            />

            {/* Sliding Panel */}
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="w-screen max-w-md bg-[var(--kf-card-bg)] shadow-2xl flex flex-col justify-between"
              >
                {/* Header block */}
                <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[var(--kf-primary)]" />
                    <h3 className="font-serif text-xl font-bold text-stone-900">{t.basketTitle}</h3>
                  </div>
                  <button
                    onClick={() => setShowCart(false)}
                    className="p-2 hover:bg-[var(--kf-primary-light)] hover:text-[var(--kf-primary)] rounded-full transition"
                  >
                    <X className="w-5 h-5 text-stone-800" />
                  </button>
                </div>

                {/* Items Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <ShoppingCart className="w-12 h-12 text-stone-200 mb-4 animate-bounce" />
                      <h4 className="font-serif text-lg font-bold text-stone-700">{t.basketEmpty}</h4>
                      <p className="text-[var(--kf-text)] text-sm mt-1 mb-6">{t.basketEmptySub}</p>
                      <Button size="lg" onClick={() => setShowCart(false)}>
                        {t.exploreProducts}
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Free Shipping Progress bar */}
                      <div className="bg-stone-50 border border-stone-100 p-4 rounded-2xl mb-2">
                        {subtotal >= 1500 ? (
                          <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <Check className="w-4 h-4" /> {t.freeDeliveryUnlocked}
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            <p className="text-xs text-stone-600">
                              {t.freeDeliveryProgress} <span className="font-bold text-[var(--kf-primary)]">{(1500 - subtotal).toLocaleString()} BDT</span> <span className="font-semibold text-emerald-700">{t.free}</span>!
                            </p>
                            <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.min(100, (subtotal / 1500) * 100)}%` }}
                                className="h-full bg-[var(--kf-primary)] rounded-full transition-all duration-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {cart.map((item) => {
                        const activePrice = item.product.price * (1 - item.product.discount / 100);
                        return (
                          <div
                            key={item.product.id}
                            className="bg-stone-50 border border-stone-100/50 rounded-2xl p-4 flex gap-4 transition-all"
                          >
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-stone-100 group">
                              <Image
                                src={item.product.image}
                                alt={item.product.name}
                                fill
                                className="object-cover img-hover"
                                referrerPolicy="no-referrer"
                              />
                            </div>

                            <div className="flex-1 space-y-1">
                              <h4 className="font-serif font-bold text-[var(--kf-text)] text-sm line-clamp-1">
                                {item.product.name}
                              </h4>
                              <p className="text-xs font-bold text-[var(--kf-primary)]">
                                {activePrice.toLocaleString()} BDT{' '}
                                {item.product.discount > 0 && (
                                  <span className="font-normal text-stone-400 line-through text-[10px]">
                                    {item.product.price.toLocaleString()} BDT
                                  </span>
                                )}
                              </p>

                              {/* Quantity actions */}
                              <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2 border bg-white rounded-lg p-0.5">
                                  <button
                                    onClick={() => updateCartQuantity(item.product.id, -1)}
                                    className="p-1 hover:bg-[var(--kf-primary-light)] hover:text-[var(--kf-primary)] rounded text-stone-600 transition"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-xs font-black w-6 text-center text-stone-800">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateCartQuantity(item.product.id, 1)}
                                    className="p-1 hover:bg-[var(--kf-primary-light)] hover:text-[var(--kf-primary)] rounded text-stone-600 transition"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <button
                                  onClick={() => removeFromCart(item.product.id, item.product.name)}
                                  className="text-stone-400 hover:text-[var(--kf-primary)] p-1.5 transition"
                                  title={t.removeItem}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                {/* Cart totals */}
                {cart.length > 0 && (
                  <div className="p-6 border-t border-stone-100 space-y-4">
                    <div className="space-y-2 text-sm text-[var(--kf-text)]">
                      <div className="flex justify-between">
                        <span className="text-stone-500 font-medium">{t.subtotal}</span>
                        <span className="font-bold">{subtotal.toLocaleString()} BDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500 font-medium">{t.deliveryFee}</span>
                        {subtotal >= 1500 ? (
                          <span className="font-bold text-emerald-600">{t.free}</span>
                        ) : checkoutForm.deliveryZone === 'inside_dhaka' ? (
                          <span className="font-bold">80 BDT</span>
                        ) : checkoutForm.deliveryZone === 'outside_dhaka' ? (
                          <span className="font-bold">150 BDT</span>
                        ) : (
                          <span className="font-bold text-stone-500 text-xs">
                            ৮০–১৫০ BDT
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between text-base pt-2 border-t font-black">
                        <span className="font-serif">{t.totalBill}</span>
                        <span className="text-[var(--kf-primary)] text-lg">
                          {(checkoutForm.deliveryZone || subtotal >= 1500
                            ? total
                            : subtotal
                          ).toLocaleString()}{' '}
                          BDT
                          {!checkoutForm.deliveryZone && subtotal > 0 && subtotal < 1500 && (
                            <span className="block text-[10px] font-medium text-stone-400 normal-case tracking-normal">
                              + {t.deliveryFeeAtCheckout}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button variant="outline" size="md" fullWidth onClick={() => setShowCart(false)}>
                        {t.keepShopping}
                      </Button>
                      <Button
                        size="md"
                        fullWidth
                        onClick={() => {
                          setShowCart(false);
                          setShowCheckout(true);
                        }}
                      >
                        {t.checkout}
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* CHECKOUT DRAWERS / MODALS */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckout(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-lg bg-[var(--kf-card-bg)] rounded-3xl shadow-2xl border border-[var(--kf-border)] z-10 p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] sm:max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowCheckout(false)}
                className="absolute top-4 right-4 p-2 bg-stone-50 hover:bg-[var(--kf-primary-light)] hover:text-[var(--kf-primary)] rounded-full transition"
              >
                <X className="w-5 h-5 text-stone-800" />
              </button>

              <div className="mb-6 flex items-center gap-2">
                <span className="p-2.5 bg-[var(--kf-peach)]/30 rounded-xl">
                  <Package className="w-5 h-5 text-[var(--kf-primary)]" />
                </span>
                <div>
                  <h3 className="font-serif text-2xl font-black text-stone-900">
                    {t.secureCheckout}
                  </h3>
                  <p className="text-xs text-stone-400 font-medium">{t.codNote}</p>
                </div>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-5">
                {/* Section 1 — Contact */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[var(--kf-primary)] border-b border-[var(--kf-border)] pb-2">
                    {t.sectionContact}
                  </h4>
                  <div>
                    <label className="block text-[11px] uppercase font-bold tracking-widest text-[var(--kf-text)] mb-1">
                      {t.nameLabel}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t.namePlaceholder}
                      value={checkoutForm.name}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                      className="w-full text-stone-800 bg-stone-50 border border-stone-200 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--kf-primary)]/20 focus:border-[var(--kf-primary)] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold tracking-widest text-[var(--kf-text)] mb-1">
                      {t.phoneLabel}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder={t.phonePlaceholder}
                      value={checkoutForm.phone}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                      className="w-full text-stone-800 bg-stone-50 border border-stone-200 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--kf-primary)]/20 focus:border-[var(--kf-primary)] transition"
                    />
                  </div>
                </div>

                {/* Section 2 — Delivery zone */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[var(--kf-primary)] border-b border-[var(--kf-border)] pb-2">
                    {t.sectionDelivery}
                  </h4>
                  <p className="text-xs text-stone-500">{t.selectDeliveryZone}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCheckoutForm({ ...checkoutForm, deliveryZone: 'inside_dhaka' })}
                      className={`p-4 rounded-xl border-2 text-left transition ${
                        checkoutForm.deliveryZone === 'inside_dhaka'
                          ? 'border-[var(--kf-primary)] bg-[var(--kf-primary-light)]/40 shadow-md'
                          : 'border-stone-200 bg-stone-50 hover:border-[var(--kf-peach)]'
                      }`}
                    >
                      <span className="block text-sm font-black text-stone-900">{t.insideDhaka}</span>
                      <span className="block text-xs font-bold text-[var(--kf-primary)] mt-1">
                        {t.deliveryInsideFee}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckoutForm({ ...checkoutForm, deliveryZone: 'outside_dhaka' })}
                      className={`p-4 rounded-xl border-2 text-left transition ${
                        checkoutForm.deliveryZone === 'outside_dhaka'
                          ? 'border-[var(--kf-primary)] bg-[var(--kf-primary-light)]/40 shadow-md'
                          : 'border-stone-200 bg-stone-50 hover:border-[var(--kf-peach)]'
                      }`}
                    >
                      <span className="block text-sm font-black text-stone-900">{t.outsideDhaka}</span>
                      <span className="block text-xs font-bold text-[var(--kf-primary)] mt-1">
                        {t.deliveryOutsideFee}
                      </span>
                    </button>
                  </div>
                  {subtotal >= 1500 && (
                    <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {t.freeDeliveryUnlocked}
                    </p>
                  )}
                </div>

                {/* Section 3 — Address & notes */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[var(--kf-primary)] border-b border-[var(--kf-border)] pb-2">
                    {t.sectionAddress}
                  </h4>
                  <div>
                    <label className="block text-[11px] uppercase font-bold tracking-widest text-[var(--kf-text)] mb-1">
                      {t.addressLabel}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t.addressPlaceholder}
                      value={checkoutForm.address}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                      className="w-full text-stone-800 bg-stone-50 border border-stone-200 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--kf-primary)]/20 focus:border-[var(--kf-primary)] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold tracking-widest text-[var(--kf-text)] mb-1">
                      {t.notesLabel}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={t.notesPlaceholder}
                      value={checkoutForm.notes}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, notes: e.target.value })}
                      className="w-full text-stone-800 bg-stone-50 border border-stone-200 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--kf-primary)]/20 focus:border-[var(--kf-primary)] transition"
                    />
                  </div>
                </div>

                {/* Short Summary inside checker page */}
                <div className="bg-stone-50 p-4 rounded-2xl space-y-2 mt-2 text-xs">
                  <h4 className="font-extrabold uppercase text-stone-600 tracking-wider">{t.orderSummary}</h4>
                  <div className="max-h-24 overflow-y-auto divide-y divide-stone-100">
                    {cart.map((item) => (
                      <div key={item.product.id} className="py-1.5 flex justify-between text-stone-700">
                        <span>{item.product.nameBn || item.product.name} (x{item.quantity})</span>
                        <span className="font-bold">
                          {((item.product.price * (1 - item.product.discount / 100)) * item.quantity).toLocaleString()} BDT
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-1 flex justify-between text-stone-600">
                    <span>{t.subtotal}</span>
                    <span className="font-bold">{subtotal.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>{t.deliveryFee}</span>
                    <span className="font-bold">
                      {subtotal >= 1500
                        ? t.free
                        : checkoutForm.deliveryZone === 'inside_dhaka'
                          ? '80 BDT'
                          : checkoutForm.deliveryZone === 'outside_dhaka'
                            ? '150 BDT'
                            : '—'}
                    </span>
                  </div>
                  <div className="pt-2 border-t flex justify-between text-sm font-black text-stone-950">
                    <span>{t.totalBill}</span>
                    <span className="text-[var(--kf-primary)]">{total.toLocaleString()} BDT</span>
                  </div>
                </div>

                <Button type="submit" fullWidth size="md" disabled={isPending}>
                  {isPending ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      {t.securingOrder}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> {t.confirmOrder}
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ORDER SUCCESS — Custom Bengali Popup */}
      <AnimatePresence>
        {orderSuccess && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOrderSuccess(null)}
              className="absolute inset-0 bg-stone-950/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative w-full max-w-sm bg-[var(--kf-card-bg)] overflow-hidden shadow-2xl z-10 border border-[var(--kf-peach)]/40 dark:border-[var(--kf-border)]"
            >
              {/* Top accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-[var(--kf-navy)] via-[var(--kf-peach)] to-[var(--kf-navy)]" />

              <div className="p-7 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 400 }}
                  className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5"
                >
                  <Check className="w-8 h-8 stroke-[3]" />
                </motion.div>

                <h3 className="font-serif text-2xl font-black text-stone-900 mb-2">
                  {t.orderSuccessTitle}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed px-2 mb-1">
                  {t.orderSuccessSub}
                </p>
                <p className="text-xs text-stone-400 mb-5">
                  {t.orderSuccessCall}
                </p>

                <div className="bg-stone-50 border border-stone-100 p-4 mb-5 text-left space-y-2">
                  <div>
                    <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">
                      {t.orderNumberLabel}
                    </span>
                    <p className="font-mono font-black text-[var(--kf-primary)] text-lg tracking-wide">
                      {orderSuccess.orderNumber || 'KF-PENDING'}
                    </p>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-stone-100">
                    <span className="text-stone-500">{t.total}</span>
                    <span className="font-black text-stone-900">{orderSuccess.amount?.toLocaleString()} BDT</span>
                  </div>
                </div>

                <Button fullWidth size="lg" onClick={() => setOrderSuccess(null)}>
                  {t.keepShopping}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
