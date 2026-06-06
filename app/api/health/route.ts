import { NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/app/actions';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await testDatabaseConnection();
  return NextResponse.json(result, { status: result.success ? 200 : 503 });
}
