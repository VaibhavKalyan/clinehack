import { NextResponse } from 'next/server';
import { sameOrigin } from '@/lib/api';
import { getSessionUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 15;

export async function GET(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  try {
    const user = getSessionUser(request);
    return NextResponse.json({ user }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ user: null }, { headers: { 'Cache-Control': 'no-store' } });
  }
}