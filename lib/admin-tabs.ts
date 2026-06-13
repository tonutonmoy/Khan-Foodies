export const ADMIN_TABS = [
  'overview',
  'products',
  'categories',
  'orders',
  'content',
  'gallery',
  'faq',
  'shipping',
  'messages',
  'reviews',
] as const;

export type AdminTab = (typeof ADMIN_TABS)[number];

export function isAdminTab(value: string): value is AdminTab {
  return (ADMIN_TABS as readonly string[]).includes(value);
}

export const ADMIN_TAB_TITLES: Record<AdminTab, string> = {
  overview: 'Console Overview',
  products: 'Product Registry Management',
  categories: 'Category Taxonomy Management',
  orders: 'Secure Shipping Orders',
  content: 'Live Front-page Web Controls',
  gallery: 'Gallery Image Manager',
  faq: 'FAQ Content Manager',
  shipping: 'Shipping Charge Manager',
  messages: 'Contact Inbox',
  reviews: 'Customer Review Moderation',
};

export function adminScrollKey(tab: AdminTab) {
  return `khanfoods_admin_scroll_${tab}`;
}
