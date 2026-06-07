import { prisma } from './prisma';
import {
  DEFAULT_FAQ_IMAGE_DESKTOP,
  DEFAULT_FAQ_IMAGE_MOBILE,
  DEFAULT_HERO_IMAGES,
  DEFAULT_REVIEW_AVATAR,
} from './defaults';
import type { Category, Product, Order, Review, SiteContent, OrderItem, GalleryItem, FaqItem } from './types';

function mapCategory(c: {
  id: string;
  name: string;
  nameBn: string | null;
  icon: string;
  slug: string;
}): Category {
  return {
    id: c.id,
    name: c.name,
    nameBn: c.nameBn ?? undefined,
    icon: c.icon,
    slug: c.slug,
  };
}

function mapProduct(p: {
  id: string;
  name: string;
  nameBn: string | null;
  price: number;
  discount: number;
  description: string;
  descriptionBn: string | null;
  category: string;
  stock: number;
  status: string;
  rating: number;
  image: string;
}): Product {
  return {
    id: p.id,
    name: p.name,
    nameBn: p.nameBn ?? undefined,
    price: p.price,
    discount: p.discount,
    description: p.description,
    descriptionBn: p.descriptionBn ?? undefined,
    category: p.category,
    stock: p.stock,
    status: p.status as Product['status'],
    rating: p.rating,
    image: p.image,
  };
}

function mapOrder(o: {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  amount: number;
  status: string;
  notes: string | null;
  createdAt: Date;
}): Order {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    phone: o.phone,
    address: o.address,
    items: o.items,
    amount: o.amount,
    status: o.status as Order['status'],
    notes: o.notes ?? undefined,
    createdAt: o.createdAt.toISOString(),
  };
}

function mapSiteContent(s: {
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
  heroImage1?: string | null;
  heroImage2?: string | null;
  heroImage3?: string | null;
  heroImage4?: string | null;
  faqImageDesktop?: string | null;
  faqImageMobile?: string | null;
  defaultReviewAvatar?: string | null;
}): SiteContent {
  return {
    ...s,
    heroImage1: s.heroImage1 || DEFAULT_HERO_IMAGES[0],
    heroImage2: s.heroImage2 || DEFAULT_HERO_IMAGES[1],
    heroImage3: s.heroImage3 || DEFAULT_HERO_IMAGES[2],
    heroImage4: s.heroImage4 || DEFAULT_HERO_IMAGES[3],
    faqImageDesktop: s.faqImageDesktop || DEFAULT_FAQ_IMAGE_DESKTOP,
    faqImageMobile: s.faqImageMobile || DEFAULT_FAQ_IMAGE_MOBILE,
    defaultReviewAvatar: s.defaultReviewAvatar || DEFAULT_REVIEW_AVATAR,
  };
}

export const db = {
  getCategories: async (): Promise<Category[]> => {
    const categories = await prisma.category.findMany({ orderBy: { id: 'asc' } });
    return categories.map(mapCategory);
  },

  saveCategory: async (category: Omit<Category, 'id'> & { id?: string }): Promise<Category> => {
    if (category.id) {
      const updated = await prisma.category.update({
        where: { id: category.id },
        data: {
          name: category.name,
          nameBn: category.nameBn,
          icon: category.icon,
          slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
        },
      });
      return mapCategory(updated);
    }

    const newCategory = await prisma.category.create({
      data: {
        id: `cat-${Date.now()}`,
        name: category.name,
        nameBn: category.nameBn,
        icon: category.icon || 'Folder',
        slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
      },
    });
    return mapCategory(newCategory);
  },

  deleteCategory: async (id: string): Promise<boolean> => {
    try {
      await prisma.category.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },

  getProducts: async (): Promise<Product[]> => {
    const products = await prisma.product.findMany({ orderBy: { id: 'asc' } });
    return products.map(mapProduct);
  },

  saveProduct: async (
    product: Omit<Product, 'id' | 'rating'> & { id?: string; rating?: number }
  ): Promise<Product> => {
    if (product.id) {
      const existing = await prisma.product.findUnique({ where: { id: product.id } });
      const updated = await prisma.product.update({
        where: { id: product.id },
        data: {
          name: product.name,
          nameBn: product.nameBn,
          price: Number(product.price),
          discount: Number(product.discount || 0),
          description: product.description || '',
          descriptionBn: product.descriptionBn,
          category: product.category,
          stock: Number(product.stock || 0),
          status: product.status || 'Active',
          image: product.image,
          rating: existing?.rating ?? product.rating ?? 4.8,
        },
      });
      return mapProduct(updated);
    }

    const created = await prisma.product.create({
      data: {
        id: `prod-${Date.now()}`,
        name: product.name,
        nameBn: product.nameBn,
        price: Number(product.price),
        discount: Number(product.discount || 0),
        description: product.description || '',
        descriptionBn: product.descriptionBn,
        category: product.category,
        stock: Number(product.stock || 0),
        status: product.status || 'Active',
        rating: 4.8,
        image:
          product.image ||
          'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=600',
      },
    });
    return mapProduct(created);
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    try {
      await prisma.product.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },

  getOrders: async (): Promise<Order[]> => {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
    return orders.map(mapOrder);
  },

  createOrder: async (
    order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>
  ): Promise<Order> => {
    const orderNum = `KF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    for (const item of order.items) {
      const prod = await prisma.product.findUnique({ where: { id: item.productId } });
      if (prod) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: Math.max(0, prod.stock - item.quantity) },
        });
      }
    }

    const created = await prisma.order.create({
      data: {
        orderNumber: orderNum,
        customerName: order.customerName,
        phone: order.phone,
        address: order.address,
        items: order.items,
        amount: Number(order.amount),
        status: 'Pending',
        notes: order.notes || '',
      },
    });
    return mapOrder(created);
  },

  updateOrderStatus: async (id: string, status: Order['status']): Promise<boolean> => {
    try {
      await prisma.order.update({ where: { id }, data: { status } });
      return true;
    } catch {
      return false;
    }
  },

  deleteOrder: async (id: string): Promise<boolean> => {
    try {
      await prisma.order.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },

  getReviews: async (): Promise<Review[]> => {
    const rows = await prisma.review.findMany({ orderBy: { id: 'desc' } });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      rating: r.rating,
      text: r.text,
      image: r.image,
      role: r.role ?? undefined,
      roleBn: r.roleBn ?? undefined,
    }));
  },

  addReview: async (
    name: string,
    rating: number,
    text: string,
    image?: string,
    role?: string,
    roleBn?: string
  ): Promise<Review> => {
    const created = await prisma.review.create({
      data: {
        name,
        rating: Number(rating),
        text,
        image: image || DEFAULT_REVIEW_AVATAR,
        role: role || null,
        roleBn: roleBn || null,
      },
    });
    return {
      id: created.id,
      name: created.name,
      rating: created.rating,
      text: created.text,
      image: created.image,
      role: created.role ?? undefined,
      roleBn: created.roleBn ?? undefined,
    };
  },

  deleteReview: async (id: string): Promise<boolean> => {
    try {
      await prisma.review.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },

  saveReview: async (review: Review): Promise<Review> => {
    const updated = await prisma.review.update({
      where: { id: review.id },
      data: {
        name: review.name,
        rating: review.rating,
        text: review.text,
        image: review.image,
        role: review.role || null,
        roleBn: review.roleBn || null,
      },
    });
    return {
      id: updated.id,
      name: updated.name,
      rating: updated.rating,
      text: updated.text,
      image: updated.image,
      role: updated.role ?? undefined,
      roleBn: updated.roleBn ?? undefined,
    };
  },

  getSiteContent: async (): Promise<SiteContent | null> => {
    const content = await prisma.siteContent.findUnique({ where: { id: 'main' } });
    return content ? mapSiteContent(content) : null;
  },

  updateSiteContent: async (content: SiteContent): Promise<SiteContent> => {
    const { id: _id, ...data } = content as SiteContent & { id?: string };
    const updated = await prisma.siteContent.upsert({
      where: { id: 'main' },
      create: { id: 'main', ...data },
      update: data,
    });
    return mapSiteContent(updated);
  },

  saveContactMessage: async (contact: {
    name: string;
    email: string;
    message: string;
  }): Promise<void> => {
    await prisma.contactMessage.create({ data: contact });
  },

  getContactMessages: async (): Promise<
    Array<{ id: string; name: string; email: string; message: string; createdAt: Date }>
  > => {
    return prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
  },

  deleteContactMessage: async (id: string): Promise<boolean> => {
    try {
      await prisma.contactMessage.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },

  testConnection: async (): Promise<boolean> => {
    await prisma.$runCommandRaw({ ping: 1 });
    return true;
  },

  getGalleryItems: async (): Promise<GalleryItem[]> => {
    const rows = await prisma.galleryItem.findMany({ orderBy: [{ sortOrder: 'asc' }, { slot: 'asc' }] });
    return rows.map((g) => ({
      id: g.id,
      title: g.title,
      titleBn: g.titleBn ?? undefined,
      description: g.description,
      descriptionBn: g.descriptionBn ?? undefined,
      image: g.image,
      slot: g.slot,
      sortOrder: g.sortOrder,
    }));
  },

  saveGalleryItem: async (item: GalleryItem): Promise<GalleryItem> => {
    const data = {
      title: item.title,
      titleBn: item.titleBn || null,
      description: item.description,
      descriptionBn: item.descriptionBn || null,
      image: item.image,
      slot: item.slot,
      sortOrder: item.sortOrder,
    };

    if (item.id) {
      const updated = await prisma.galleryItem.update({ where: { id: item.id }, data });
      return {
        id: updated.id,
        title: updated.title,
        titleBn: updated.titleBn ?? undefined,
        description: updated.description,
        descriptionBn: updated.descriptionBn ?? undefined,
        image: updated.image,
        slot: updated.slot,
        sortOrder: updated.sortOrder,
      };
    }

    const created = await prisma.galleryItem.create({ data });
    return {
      id: created.id,
      title: created.title,
      titleBn: created.titleBn ?? undefined,
      description: created.description,
      descriptionBn: created.descriptionBn ?? undefined,
      image: created.image,
      slot: created.slot,
      sortOrder: created.sortOrder,
    };
  },

  deleteGalleryItem: async (id: string): Promise<boolean> => {
    try {
      await prisma.galleryItem.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },

  getFaqItems: async (): Promise<FaqItem[]> => {
    const rows = await prisma.faqItem.findMany({ orderBy: { sortOrder: 'asc' } });
    return rows.map((f) => ({
      id: f.id,
      question: f.question,
      questionBn: f.questionBn ?? undefined,
      answer: f.answer,
      answerBn: f.answerBn ?? undefined,
      sortOrder: f.sortOrder,
    }));
  },

  saveFaqItem: async (item: FaqItem): Promise<FaqItem> => {
    const data = {
      question: item.question,
      questionBn: item.questionBn || null,
      answer: item.answer,
      answerBn: item.answerBn || null,
      sortOrder: item.sortOrder,
    };

    if (item.id) {
      const updated = await prisma.faqItem.update({ where: { id: item.id }, data });
      return {
        id: updated.id,
        question: updated.question,
        questionBn: updated.questionBn ?? undefined,
        answer: updated.answer,
        answerBn: updated.answerBn ?? undefined,
        sortOrder: updated.sortOrder,
      };
    }

    const created = await prisma.faqItem.create({ data });
    return {
      id: created.id,
      question: created.question,
      questionBn: created.questionBn ?? undefined,
      answer: created.answer,
      answerBn: created.answerBn ?? undefined,
      sortOrder: created.sortOrder,
    };
  },

  deleteFaqItem: async (id: string): Promise<boolean> => {
    try {
      await prisma.faqItem.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },
};
