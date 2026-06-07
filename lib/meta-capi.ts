import crypto from 'crypto';
import { headers } from 'next/headers';

const META_API_VERSION = 'v21.0';

export type MetaProductItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
};

export type MetaCustomerData = {
  name?: string;
  phone?: string;
  email?: string;
};

export type MetaBrowserContext = {
  fbp?: string;
  fbc?: string;
  eventSourceUrl?: string;
};

export type MetaRequestContext = {
  clientIp?: string;
  userAgent?: string;
  sourceUrl?: string;
};

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `880${digits.slice(1)}`;
  else if (!digits.startsWith('880') && digits.length <= 11) digits = `880${digits}`;
  return digits;
}

function buildHashedUserData(customer?: MetaCustomerData) {
  const userData: Record<string, string[]> = {};

  if (customer?.phone) {
    userData.ph = [sha256(normalizePhone(customer.phone))];
  }
  if (customer?.name) {
    const firstName = customer.name.trim().split(/\s+/)[0]?.toLowerCase();
    if (firstName) userData.fn = [sha256(firstName)];
  }
  if (customer?.email) {
    userData.em = [sha256(customer.email.trim().toLowerCase())];
  }

  return userData;
}

async function getRequestContext(override?: MetaRequestContext) {
  if (override) {
    return {
      clientIp: override.clientIp,
      userAgent: override.userAgent,
      sourceUrl: override.sourceUrl || process.env.NEXT_PUBLIC_APP_URL || undefined,
    };
  }

  try {
    const h = await headers();
    return {
      clientIp: h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || undefined,
      userAgent: h.get('user-agent') || undefined,
      sourceUrl: h.get('referer') || process.env.NEXT_PUBLIC_APP_URL || undefined,
    };
  } catch {
    return {
      clientIp: undefined,
      userAgent: undefined,
      sourceUrl: process.env.NEXT_PUBLIC_APP_URL || undefined,
    };
  }
}

function buildContents(items: MetaProductItem[]) {
  return items.map((item) => ({
    id: item.productId,
    quantity: item.quantity,
    item_price: item.price,
  }));
}

function buildCustomData(items: MetaProductItem[], value: number) {
  return {
    currency: 'BDT',
    value: Number(value.toFixed(2)),
    content_ids: items.map((i) => i.productId),
    content_type: 'product',
    contents: buildContents(items),
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
  };
}

function hasSufficientUserData(userData: Record<string, string | string[]>): boolean {
  if (userData.client_ip_address || userData.client_user_agent) return true;
  if (userData.fbp || userData.fbc) return true;
  const hashedKeys = ['em', 'ph', 'fn', 'ln', 'ct', 'st', 'zp', 'country'];
  return hashedKeys.some((key) => userData[key]);
}

export async function sendMetaServerEvent(
  eventName: string,
  options: {
    items: MetaProductItem[];
    value: number;
    eventId?: string;
    customer?: MetaCustomerData;
    browser?: MetaBrowserContext;
    requestContext?: MetaRequestContext;
  }
): Promise<{ ok: boolean; error?: string }> {
  const pixelId = process.env.META_DATASET_ID || process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    return { ok: false, error: 'Meta CAPI not configured' };
  }

  const { clientIp, userAgent, sourceUrl } = await getRequestContext(options.requestContext);
  const hashedUser = buildHashedUserData(options.customer);

  const userData: Record<string, string | string[]> = {
    ...hashedUser,
    ...(clientIp ? { client_ip_address: clientIp } : {}),
    ...(userAgent ? { client_user_agent: userAgent } : {}),
    ...(options.browser?.fbp ? { fbp: options.browser.fbp } : {}),
    ...(options.browser?.fbc ? { fbc: options.browser.fbc } : {}),
  };

  if (!hasSufficientUserData(userData)) {
    console.warn('[Meta CAPI]', eventName, 'skipped — insufficient user_data for Meta matching');
    return { ok: false, error: 'Missing user_data for Meta CAPI' };
  }

  const eventSourceUrl = options.browser?.eventSourceUrl || sourceUrl;

  const eventPayload: Record<string, unknown> = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_id: options.eventId || `${eventName}_${Date.now()}_${crypto.randomUUID()}`,
    custom_data: buildCustomData(options.items, options.value),
    user_data: userData,
    ...(eventSourceUrl ? { event_source_url: eventSourceUrl } : {}),
  };

  const testEventCode = process.env.META_TEST_EVENT_CODE;
  const requestBody: Record<string, unknown> = { data: [eventPayload] };
  if (testEventCode) {
    requestBody.test_event_code = testEventCode;
  }

  try {
    const url = `https://graph.facebook.com/${META_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const result = (await response.json()) as { events_received?: number; error?: { message?: string } };

    if (!response.ok || result.error) {
      const message = result.error?.message || `Meta CAPI HTTP ${response.status}`;
      console.error('[Meta CAPI]', eventName, message);
      return { ok: false, error: message };
    }

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Meta CAPI request failed';
    console.error('[Meta CAPI]', eventName, message);
    return { ok: false, error: message };
  }
}

export async function trackMetaPurchase(
  orderId: string,
  amount: number,
  items: MetaProductItem[],
  customer: MetaCustomerData,
  options?: { eventId?: string; browser?: MetaBrowserContext }
) {
  return sendMetaServerEvent('Purchase', {
    items,
    value: amount,
    eventId: options?.eventId || `purchase_${orderId}`,
    customer,
    browser: options?.browser,
  });
}

export async function trackMetaAddToCart(
  items: MetaProductItem[],
  value: number,
  options?: { eventId?: string; browser?: MetaBrowserContext }
) {
  return sendMetaServerEvent('AddToCart', { items, value, ...options });
}

export async function trackMetaInitiateCheckout(
  items: MetaProductItem[],
  value: number,
  options?: { eventId?: string; browser?: MetaBrowserContext }
) {
  return sendMetaServerEvent('InitiateCheckout', { items, value, ...options });
}

export async function trackMetaViewContent(
  items: MetaProductItem[],
  value: number,
  options?: { eventId?: string; browser?: MetaBrowserContext }
) {
  return sendMetaServerEvent('ViewContent', { items, value, ...options });
}
