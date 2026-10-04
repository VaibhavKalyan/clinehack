import { NextResponse } from 'next/server';
import { readJsonBody, sameOrigin, throttle } from '@/lib/api';
import { registerSchema } from '@/lib/validation';
import { createEmailVerification, createUser, findUserByEmail } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
import { getDb } from '@/lib/db';
import type { RegisterResponse } from '@/lib/contracts';

export const runtime = 'nodejs';
export const maxDuration = 15;

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
    // Accounts start unverified. The address must be confirmed before sign-in.
    const user = createUser(email, name, password);
    // Seed an empty profile row so GET /api/profile is always defined.
    getDb().prepare('INSERT INTO profiles (user_id, profile_json, language, updated_at) VALUES (?, ?, ?, ?)')
      .run(user.id, JSON.stringify({}), 'en', new Date().toISOString());
    const token = createEmailVerification(user.id);
    const { devLink } = await sendVerificationEmail(email, token);
    const response: RegisterResponse = { status: 'verification_required', email, devLink };
    return NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Could not create the account. Please try again.' }, { status: 500 });
  }
}