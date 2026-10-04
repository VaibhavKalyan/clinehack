import { NextResponse } from 'next/server';
import { readJsonBody, sameOrigin, throttle } from '@/lib/api';
import { loginSchema } from '@/lib/validation';
import { createSession, findUserByEmail, SESSION_COOKIE, sessionCookieOptions, verifyPassword } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 15;

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  if (!throttle(`login:${request.headers.get('x-forwarded-for') ?? 'local'}`)) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 });
  }
  const body = await readJsonBody(request, 8000);
  if (!body.ok) return NextResponse.json({ error: 'Invalid request.' }, { status: body.status });
  const parsed = loginSchema.safeParse(body.body);
  if (!parsed.success) return NextResponse.json({ error: 'Please enter a valid email and password.' }, { status: 400 });
  const { email, password } = parsed.data;
  try {
    const user = findUserByEmail(email);
    // Same generic error for unknown email and wrong password (no account enumeration).
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });
    }
    const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.set(SESSION_COOKIE, createSession(user.id), sessionCookieOptions);
    return response;
  } catch {
    return NextResponse.json({ error: 'Could not sign in. Please try again.' }, { status: 500 });
  }
}