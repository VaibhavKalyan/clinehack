import { NextResponse } from 'next/server';
import { readJsonBody, sameOrigin, throttle } from '@/lib/api';
import { verifySchema } from '@/lib/validation';
import { consumeEmailVerification, findUserById } from '@/lib/auth';
import type { VerifyResponse } from '@/lib/contracts';

export const runtime = 'nodejs';
export const maxDuration = 15;

function handle(rawToken: string) {
  const result = consumeEmailVerification(rawToken);
  if (!result) {
    return NextResponse.json({ error: 'This verification link is invalid or has expired. Request a new one.' }, { status: 400 });
  }
  const user = findUserById(result.userId);
  const response: VerifyResponse = { ok: true, email: user?.email ?? '' };
  return NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  if (!throttle(`verify:${request.headers.get('x-forwarded-for') ?? 'local'}`)) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 });
  }
  const body = await readJsonBody(request, 2000);
  if (!body.ok) return NextResponse.json({ error: 'Invalid request.' }, { status: body.status });
  const parsed = verifySchema.safeParse(body.body);
  if (!parsed.success) return NextResponse.json({ error: 'This verification link is invalid.' }, { status: 400 });
  try {
    return handle(parsed.data.token);
  } catch {
    return NextResponse.json({ error: 'Could not verify your email. Please try again.' }, { status: 500 });
  }
}

/** The email link can hit this endpoint directly as a fallback. */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') ?? '';
  const parsed = verifySchema.safeParse({ token });
  if (!parsed.success) return NextResponse.json({ error: 'This verification link is invalid.' }, { status: 400 });
  try {
    return handle(parsed.data.token);
  } catch {
    return NextResponse.json({ error: 'Could not verify your email. Please try again.' }, { status: 500 });
  }
}