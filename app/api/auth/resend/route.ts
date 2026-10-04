import { NextResponse } from 'next/server';
import { readJsonBody, sameOrigin, throttle } from '@/lib/api';
import { resendSchema } from '@/lib/validation';
import { createEmailVerification, findUserByEmail } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
import type { ResendResponse } from '@/lib/contracts';

export const runtime = 'nodejs';
export const maxDuration = 15;

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  if (!throttle(`resend:${request.headers.get('x-forwarded-for') ?? 'local'}`)) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 });
  }
  const body = await readJsonBody(request, 2000);
  if (!body.ok) return NextResponse.json({ error: 'Invalid request.' }, { status: body.status });
  const parsed = resendSchema.safeParse(body.body);
  if (!parsed.success) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
  const { email } = parsed.data;
  try {
    // Generic response regardless of whether the account exists (no enumeration).
    let devLink: string | null = null;
    const user = findUserByEmail(email);
    if (user && !user.email_verified_at) {
      const token = createEmailVerification(user.id);
      ({ devLink } = await sendVerificationEmail(email, token));
    }
    const response: ResendResponse = { status: 'sent', devLink };
    return NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Could not send the email. Please try again.' }, { status: 500 });
  }
}