'use server';

import {
  trackMetaAddToCart,
  trackMetaInitiateCheckout,
  trackMetaViewContent,
} from '@/lib/meta-capi';

type TrackProductPayload = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
};

type TrackCartPayload = {
  items: TrackProductPayload[];
  value: number;
};

/** Server-side only — no browser pixel. Called from client via server action. */
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
    payload.price * payload.quantity
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
    payload.value
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
    payload.price
  );
}
