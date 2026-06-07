import { NextResponse } from 'next/server';
import { sendMetaServerEvent } from '@/lib/meta-capi';

/**
 * GET /api/meta-health — verify Meta browser pixel + server-side CAPI.
 * Header: x-admin-key matching ADMIN_PASSWORD
 */
export async function GET(request: Request) {
  const adminKey = request.headers.get('x-admin-key');
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || adminKey !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.META_PIXEL_ID || process.env.META_DATASET_ID;
  const configured = Boolean(pixelId && process.env.META_ACCESS_TOKEN);

  if (!configured) {
    return NextResponse.json({
      ok: false,
      error: 'META_PIXEL_ID / META_ACCESS_TOKEN missing on server',
      hint: 'Set NEXT_PUBLIC_META_PIXEL_ID (browser) + META_ACCESS_TOKEN (CAPI) in env',
    });
  }

  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent =
    request.headers.get('user-agent') ||
    'Mozilla/5.0 (compatible; KhanFoodsMetaHealth/1.0)';

  const result = await sendMetaServerEvent('ViewContent', {
    items: [
      {
        productId: 'health-check',
        name: 'Meta CAPI Health Check',
        price: 1,
        quantity: 1,
      },
    ],
    value: 1,
    eventId: `health_${Date.now()}`,
    requestContext: {
      clientIp,
      userAgent,
      sourceUrl: process.env.NEXT_PUBLIC_APP_URL,
    },
  });

  return NextResponse.json({
    ok: result.ok,
    mode: 'browser-pixel-and-capi',
    pixelId,
    browserPixelConfigured: Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID),
    pixelHelperNote: 'Meta Pixel Helper detects browser fbq() events; CAPI events appear in Events Manager',
    error: result.error,
  });
}
