import type { Product, ShippingCharge } from './types';

type CartLine = { product: Product; quantity: number };

const FREE_DELIVERY_THRESHOLD = 1500;

/** Free delivery when any cart item has freeShipping (mixed cart still ships free). */
export function cartQualifiesForFreeShipping(cart: CartLine[]): boolean {
  if (cart.length === 0) return false;
  return cart.some((item) => Boolean(item.product.freeShipping));
}

export function computeDeliveryFee(
  subtotal: number,
  cart: CartLine[],
  selectedZoneId: string,
  shippingCharges: ShippingCharge[]
): number {
  if (subtotal === 0) return 0;
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  if (cartQualifiesForFreeShipping(cart)) return 0;
  const zone = shippingCharges.find((z) => z.id === selectedZoneId && z.active);
  return zone?.fee ?? 0;
}

export function formatShippingFee(
  fee: number,
  subtotal: number,
  cart: CartLine[],
  freeLabel: string
): string {
  if (subtotal === 0) return '—';
  if (subtotal >= FREE_DELIVERY_THRESHOLD || cartQualifiesForFreeShipping(cart)) {
    return freeLabel;
  }
  return `${fee.toLocaleString()} BDT`;
}

export function shippingFeeRangeLabel(shippingCharges: ShippingCharge[]): string {
  const fees = shippingCharges.filter((z) => z.active).map((z) => z.fee);
  if (fees.length === 0) return '—';
  const min = Math.min(...fees);
  const max = Math.max(...fees);
  if (min === max) return `${min.toLocaleString()} BDT`;
  return `${min.toLocaleString()}–${max.toLocaleString()} BDT`;
}
