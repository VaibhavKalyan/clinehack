import { NextResponse } from 'next/server';
import { sameOrigin } from '@/lib/api';
import { deleteSession, readSessionCookie, SESSION_COOKIE } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 15;

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  try {
    const token = readSessionCookie(request);
    if (token) deleteSession(token);
    const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptionsSafe(), maxAge: 0 });
    return response;
  } catch {
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  }
}

function sessionCookieOptionsSafe() {
  return { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/' };
}