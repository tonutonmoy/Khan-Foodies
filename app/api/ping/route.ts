import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** Lightweight ping — no heavy DB queries. Use /api/health for full DB check. */
export async function GET() {
  try {
    await Promise.race([
      prisma.$runCommandRaw({ ping: 1 }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('DB ping timeout')), 8000)),
    ]);
    return NextResponse.json({ ok: true, db: 'connected' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'DB unreachable';
    return NextResponse.json({ ok: false, db: 'error', error: message }, { status: 503 });
  }
}
