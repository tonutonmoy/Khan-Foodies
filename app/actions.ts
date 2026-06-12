'use server';

import { unstable_cache, revalidateTag } from 'next/cache';
import { db } from '@/lib/db';
import { fileToBase64, uploadToImgBB } from '@/lib/imgbb';
import { trackMetaPurchase, type MetaBrowserContext } from '@/lib/meta-capi';
import { DEFAULT_REVIEW_AVATAR } from '@/lib/defaults';
import type { SiteContent } from '@/lib/types';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const getCachedStoreData = unstable_cache(
  async () => {
    const [categories, products, reviews, siteContent, galleryItems, faqItems, shippingCharges] =
      await Promise.all([
        db.getCategories(),
        db.getProducts(),
        db.getReviews(),
        db.getSiteContent(),
        db.getGalleryItems(),
        db.getFaqItems(),
        db.getShippingCharges(),
      ]);

    return {
      categories,
      products: products.filter((p) => p.status === 'Active'),
      reviews,
      siteContent,
      galleryItems,
      faqItems,
      shippingCharges: shippingCharges.filter((s) => s.active),
    };
  },
  ['store-data'],
  { revalidate: 60, tags: ['store'] }
);

export async function getStoreData() {
  try {
    const data = await Promise.race([
      getCachedStoreData(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Database timeout — please refresh')), 15000)
      ),
    ]);
    return { success: true, ...data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch store data';
    return { success: false, error: message };
  }
}

export async function verifyAdminPassword(password: string) {
  if (password === ADMIN_PASSWORD) {
    return { success: true };
  }
  return { success: false, error: 'Incorrect password' };
}

export async function getAdminData(password: string) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized access' };
  }

  try {
    const [categories, products, orders, reviews, siteContent, galleryItems, faqItems, shippingCharges] =
      await Promise.all([
        db.getCategories(),
        db.getProducts(),
        db.getOrders(),
        db.getReviews(),
        db.getSiteContent(),
        db.getGalleryItems(),
        db.getFaqItems(),
        db.getShippingCharges(),
      ]);

    return {
      success: true,
      categories,
      products,
      orders,
      reviews,
      siteContent,
      galleryItems,
      faqItems,
      shippingCharges,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch admin data';
    return { success: false, error: message };
  }
}

function invalidateStoreCache() {
  revalidateTag('store');
}

export async function placeStoreOrder(
  customer: { name: string; phone: string; address: string; notes?: string },
  items: Array<{ productId: string; name: string; price: number; quantity: number }>,
  amount: number,
  meta?: { eventId?: string; browser?: MetaBrowserContext }
) {
  try {
    if (!customer.name || !customer.phone || !customer.address || items.length === 0) {
      return { success: false, error: 'Missing customer details or empty cart items' };
    }

    const order = await db.createOrder({
      customerName: customer.name,
      phone: customer.phone,
      address: customer.address,
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
      })),
      amount: Number(amount),
      notes: customer.notes || '',
    });

    void trackMetaPurchase(
      order.id,
      Number(amount),
      items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
      })),
      { name: customer.name, phone: customer.phone },
      { eventId: meta?.eventId, browser: meta?.browser }
    );

    invalidateStoreCache();

    return { success: true, order };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to place order';
    return { success: false, error: message };
  }
}

export async function saveProductAction(password: string, productData: Record<string, unknown>) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const product = await db.saveProduct({
      id: productData.id as string | undefined,
      name: productData.name as string,
      price: Number(productData.price),
      discount: Number(productData.discount || 0),
      description: (productData.description as string) || '',
      category: productData.category as string,
      stock: Number(productData.stock || 0),
      status: (productData.status as 'Active' | 'Draft') || 'Active',
      image: productData.image as string,
      freeShipping: Boolean(productData.freeShipping),
    });

    invalidateStoreCache();
    return { success: true, product };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save product';
    return { success: false, error: message };
  }
}

export async function deleteProductAction(password: string, id: string) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const success = await db.deleteProduct(id);
    invalidateStoreCache();
    return { success };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete product';
    return { success: false, error: message };
  }
}

export async function saveCategoryAction(password: string, categoryData: Record<string, unknown>) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const category = await db.saveCategory({
      id: categoryData.id as string | undefined,
      name: categoryData.name as string,
      icon: (categoryData.icon as string) || 'Folder',
      slug: categoryData.slug as string,
    });

    invalidateStoreCache();
    return { success: true, category };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save category';
    return { success: false, error: message };
  }
}

export async function deleteCategoryAction(password: string, id: string) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const success = await db.deleteCategory(id);
    invalidateStoreCache();
    return { success };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete category';
    return { success: false, error: message };
  }
}

export async function updateOrderStatusAction(password: string, id: string, status: string) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const success = await db.updateOrderStatus(id, status as Parameters<typeof db.updateOrderStatus>[1]);
    return { success };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update order status';
    return { success: false, error: message };
  }
}

export async function deleteOrderAction(password: string, id: string) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const success = await db.deleteOrder(id);
    return { success };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete order';
    return { success: false, error: message };
  }
}

export async function updateSiteContentAction(password: string, content: SiteContent) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const updated = await db.updateSiteContent(content);
    invalidateStoreCache();
    return { success: true, siteContent: updated };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update site content';
    return { success: false, error: message };
  }
}

export async function submitContactAction(contact: { name: string; email: string; message: string }) {
  try {
    await db.saveContactMessage(contact);
    return {
      success: true,
      message: 'Your message has been received! Our premium food concierge will get back to you.',
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit';
    return { success: false, error: message };
  }
}

export async function getContactMessagesAction(password: string) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const messages = await db.getContactMessages();
    return {
      success: true,
      messages: messages.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch messages';
    return { success: false, error: message };
  }
}

export async function deleteContactMessageAction(password: string, id: string) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const success = await db.deleteContactMessage(id);
    return { success };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete message';
    return { success: false, error: message };
  }
}

export async function submitReviewAction(formData: FormData) {
  try {
    const name = String(formData.get('name') || '').trim();
    const rating = Number(formData.get('rating'));
    const text = String(formData.get('text') || '').trim();
    const defaultAvatar = String(formData.get('defaultAvatar') || '').trim();
    const file = formData.get('image');

    if (!name || !text || !rating) {
      return { success: false, error: 'Name, rating and review text are required' };
    }

    let imageUrl = defaultAvatar;
    if (file instanceof File && file.size > 0) {
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'File must be an image' };
      }
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'Image must be under 5MB' };
      }
      const base64 = await fileToBase64(file);
      const result = await uploadToImgBB(base64, `review-${name.replace(/\s+/g, '-')}`);
      imageUrl = result.displayUrl || result.url;
    }

    if (!imageUrl) {
      const siteContent = await db.getSiteContent();
      imageUrl = siteContent?.defaultReviewAvatar || DEFAULT_REVIEW_AVATAR;
    }

    const review = await db.addReview(name, rating, text, imageUrl);
    invalidateStoreCache();
    return { success: true, review };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit review';
    return { success: false, error: message };
  }
}

export async function saveReviewAction(password: string, review: import('@/lib/types').Review) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized' };
  }

  if (!review.name || !review.text) {
    return { success: false, error: 'Name and review text are required' };
  }

  try {
    const saved = await db.saveReview(review);
    invalidateStoreCache();
    return { success: true, review: saved };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save review';
    return { success: false, error: message };
  }
}

export async function deleteReviewAction(password: string, id: string) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const success = await db.deleteReview(id);
    invalidateStoreCache();
    return { success };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete review';
    return { success: false, error: message };
  }
}

export async function getOrderUpdatesAction(password: string) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const orders = await db.getOrders();
    const pendingCount = orders.filter((o) => o.status === 'Pending').length;
    return {
      success: true,
      orders,
      pendingCount,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch orders';
    return { success: false, error: message };
  }
}

export async function uploadImageAction(password: string, formData: FormData) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const file = formData.get('image');
    if (!file || !(file instanceof File)) {
      return { success: false, error: 'No image file provided' };
    }

    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File must be an image' };
    }

    if (file.size > 32 * 1024 * 1024) {
      return { success: false, error: 'Image must be under 32MB' };
    }

    const base64 = await fileToBase64(file);
    const name = file.name.replace(/\.[^.]+$/, '');
    const result = await uploadToImgBB(base64, name);

    return {
      success: true,
      url: result.displayUrl || result.url,
      deleteUrl: result.deleteUrl,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Image upload failed';
    return { success: false, error: message };
  }
}

export async function saveGalleryItemAction(password: string, item: import('@/lib/types').GalleryItem) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const saved = await db.saveGalleryItem(item);
    invalidateStoreCache();
    return { success: true, item: saved };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save gallery item';
    return { success: false, error: message };
  }
}

export async function deleteGalleryItemAction(password: string, id: string) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const success = await db.deleteGalleryItem(id);
    invalidateStoreCache();
    return { success };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete gallery item';
    return { success: false, error: message };
  }
}

export async function saveFaqItemAction(password: string, item: import('@/lib/types').FaqItem) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const saved = await db.saveFaqItem(item);
    invalidateStoreCache();
    return { success: true, item: saved };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save FAQ item';
    return { success: false, error: message };
  }
}

export async function deleteFaqItemAction(password: string, id: string) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const success = await db.deleteFaqItem(id);
    invalidateStoreCache();
    return { success };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete FAQ item';
    return { success: false, error: message };
  }
}

export async function saveShippingChargeAction(
  password: string,
  item: import('@/lib/types').ShippingCharge
) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized' };
  }

  if (!item.name || item.fee === undefined || item.fee === null) {
    return { success: false, error: 'Name and fee are required' };
  }

  try {
    const saved = await db.saveShippingCharge(item);
    invalidateStoreCache();
    return { success: true, item: saved };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save shipping charge';
    return { success: false, error: message };
  }
}

export async function deleteShippingChargeAction(password: string, id: string) {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const success = await db.deleteShippingCharge(id);
    invalidateStoreCache();
    return { success };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete shipping charge';
    return { success: false, error: message };
  }
}

export async function testDatabaseConnection() {
  try {
    await db.testConnection();
    const counts = await Promise.all([
      db.getCategories(),
      db.getProducts(),
      db.getReviews(),
    ]);
    return {
      success: true,
      message: 'MongoDB connected successfully via Prisma',
      stats: {
        categories: counts[0].length,
        products: counts[1].length,
        reviews: counts[2].length,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Connection failed';
    return { success: false, error: message };
  }
}
