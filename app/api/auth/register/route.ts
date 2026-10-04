import { NextResponse } from 'next/server';
import { readJsonBody, sameOrigin, throttle } from '@/lib/api';
import { registerSchema } from '@/lib/validation';
import { createSession, createUser, findUserByEmail, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 15;

const ok = (user: { id: number; name: string; email: string }) => NextResponse.json({ user }, { headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  if (!throttle(`register:${request.headers.get('x-forwarded-for') ?? 'local'}`)) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 });
  }
  const body = await readJsonBody(request, 8000);
  if (!body.ok) return NextResponse.json({ error: 'Invalid request.' }, { status: body.status });
  const parsed = registerSchema.safeParse(body.body);
  if (!parsed.success) return NextResponse.json({ error: 'Please enter a name, a valid email and a password of at least 8 characters.' }, { status: 400 });
  const { name, email, password } = parsed.data;
  try {
    if (findUserByEmail(email)) return NextResponse.json({ error: 'That email is already registered. Try signing in instead.' }, { status: 409 });
    const user = createUser(email, name, password);
    // Seed an empty profile row so GET /api/profile is always defined.
    getDb().prepare('INSERT INTO profiles (user_id, profile_json, language, updated_at) VALUES (?, ?, ?, ?)')
      .run(user.id, JSON.stringify({}), 'en', new Date().toISOString());
    const response = ok(user);
    response.cookies.set(SESSION_COOKIE, createSession(user.id), sessionCookieOptions);
    return response;
  } catch {
    return NextResponse.json({ error: 'Could not create the account. Please try again.' }, { status: 500 });
  }
}