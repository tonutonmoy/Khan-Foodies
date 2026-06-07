export type MetaBrowserContext = {
  fbp?: string;
  fbc?: string;
  eventSourceUrl?: string;
};

export function generateMetaEventId(eventName: string): string {
  return `${eventName}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/** Capture _fbp/_fbc for Conversions API matching (call from browser only). */
export function getMetaBrowserContext(): MetaBrowserContext {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get('fbclid');
  let fbc = readCookie('_fbc');

  if (fbclid && !fbc) {
    fbc = `fb.1.${Date.now()}.${fbclid}`;
    document.cookie = `_fbc=${encodeURIComponent(fbc)}; path=/; max-age=${90 * 24 * 60 * 60}; SameSite=Lax`;
  }

  return {
    fbp: readCookie('_fbp'),
    fbc,
    eventSourceUrl: window.location.href,
  };
}

export type MetaCustomData = {
  currency?: string;
  value?: number;
  content_ids?: string[];
  content_type?: string;
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  num_items?: number;
};

declare global {
  interface Window {
    fbq?: (
      action: string,
      eventName: string,
      data?: MetaCustomData,
      options?: { eventID?: string }
    ) => void;
    _fbq?: unknown;
  }
}

export function trackMetaBrowserEvent(
  eventName: string,
  customData: MetaCustomData,
  eventId: string
): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  window.fbq('track', eventName, customData, { eventID: eventId });
}

export function buildMetaCustomData(
  items: Array<{ productId: string; price: number; quantity: number }>,
  value: number
): MetaCustomData {
  return {
    currency: 'BDT',
    value: Number(value.toFixed(2)),
    content_ids: items.map((i) => i.productId),
    content_type: 'product',
    contents: items.map((i) => ({
      id: i.productId,
      quantity: i.quantity,
      item_price: i.price,
    })),
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
  };
}
