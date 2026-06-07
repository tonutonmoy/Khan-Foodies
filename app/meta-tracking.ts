'use server';

import {
  trackMetaAddToCart,
  trackMetaInitiateCheckout,
  trackMetaViewContent,
  type MetaBrowserContext,
} from '@/lib/meta-capi';

type TrackProductPayload = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  eventId?: string;
  browser?: MetaBrowserContext;
};

type TrackCartPayload = {
  items: TrackProductPayload[];
  value: number;
  eventId?: string;
  browser?: MetaBrowserContext;
};

/** Server-side CAPI — paired with browser pixel via shared eventId. */
export async function trackAddToCartMetaAction(payload: TrackProductPayload) {
  return trackMetaAddToCart(
    [
      {
        productId: payload.productId,
        name: payload.name,
        price: payload.price,
        quantity: payload.quantity,
        category: payload.category,
      },
    ],
    payload.price * payload.quantity,
    { eventId: payload.eventId, browser: payload.browser }
  );
}

export async function trackInitiateCheckoutMetaAction(payload: TrackCartPayload) {
  return trackMetaInitiateCheckout(
    payload.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      category: item.category,
    })),
    payload.value,
    { eventId: payload.eventId, browser: payload.browser }
  );
}

export async function trackViewContentMetaAction(payload: TrackProductPayload) {
  return trackMetaViewContent(
    [
      {
        productId: payload.productId,
        name: payload.name,
        price: payload.price,
        quantity: 1,
        category: payload.category,
      },
    ],
    payload.price,
    { eventId: payload.eventId, browser: payload.browser }
  );
}
