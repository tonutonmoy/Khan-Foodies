import { NextResponse } from 'next/server';
import { sendMetaServerEvent } from '@/lib/meta-capi';

/**
 * GET /api/meta-health — verify server-side Meta CAPI (not visible in Pixel Helper).
 * Optional header: x-admin-key matching ADMIN_PASSWORD
 */
export async function GET(request: Request) {
  const adminKey = request.headers.get('x-admin-key');
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || adminKey !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const configured = Boolean(
    (process.env.META_PIXEL_ID || process.env.META_DATASET_ID) && process.env.META_ACCESS_TOKEN
  );

  if (!configured) {
    return NextResponse.json({
      ok: false,
      error: 'META_PIXEL_ID / META_DATASET_ID or META_ACCESS_TOKEN missing on server',
      hint: 'Add env vars in Vercel Project Settings → Environment Variables',
    });
  }

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
  });

  return NextResponse.json({
    ok: result.ok,
    mode: 'server-side-capi-only',
    pixelHelperNote: 'Meta Pixel Helper only detects browser fbq() — server events appear in Events Manager',
    datasetId: process.env.META_DATASET_ID || process.env.META_PIXEL_ID,
    error: result.error,
  });
}
