export interface Category {
  id: string;
  name: string;
  nameBn?: string;
  icon: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  nameBn?: string;
  price: number;
  discount: number;
  description: string;
  descriptionBn?: string;
  category: string;
  stock: number;
  status: 'Active' | 'Draft';
  rating: number;
  image: string;
  freeShipping?: boolean;
}

export interface ShippingCharge {
  id: string;
  name: string;
  nameBn?: string;
  fee: number;
  sortOrder: number;
  active: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  amount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  notes?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  image: string;
  role?: string;
  roleBn?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  titleBn?: string;
  description: string;
  descriptionBn?: string;
  image: string;
  slot: number;
  sortOrder: number;
}

export interface FaqItem {
  id: string;
  question: string;
  questionBn?: string;
  answer: string;
  answerBn?: string;
  sortOrder: number;
}

export interface SiteContent {
  heroHeadline: string;
  heroHeadlineBn: string;
  heroSubheadline: string;
  heroSubheadlineBn: string;
  aboutTitle: string;
  aboutTitleBn: string;
  aboutText: string;
  aboutTextBn: string;
  aboutImage: string;

  bannerImage1: string;
  bannerTagline1: string;
  bannerTagline1Bn: string;
  bannerTitle1: string;
  bannerTitle1Bn: string;

  bannerImage2: string;
  bannerTagline2: string;
  bannerTagline2Bn: string;
  bannerTitle2: string;
  bannerTitle2Bn: string;

  bannerImage3: string;
  bannerTagline3: string;
  bannerTagline3Bn: string;
  bannerTitle3: string;
  bannerTitle3Bn: string;

  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactAddressBn: string;
  facebookUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  footerText: string;
  footerTextBn: string;

  heroImage1?: string;
  heroImage2?: string;
  heroImage3?: string;
  heroImage4?: string;
  faqImageDesktop?: string;
  faqImageMobile?: string;
  defaultReviewAvatar?: string;
}
