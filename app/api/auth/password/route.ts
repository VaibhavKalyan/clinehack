import { NextResponse } from 'next/server';
import { readJsonBody, sameOrigin, throttle } from '@/lib/api';
import { passwordChangeSchema } from '@/lib/validation';
import { findUserById, getSessionUser, readSessionCookie, deleteOtherSessions, updatePassword, verifyPassword, SESSION_COOKIE } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 15;

/** Change password: requires the current password (re-authentication) and
 *  signs out all other sessions. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  if (!throttle(`password:${request.headers.get('x-forwarded-for') ?? 'local'}`)) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 });
  }
  const user = getSessionUser(request);
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const body = await readJsonBody(request, 8000);
  if (!body.ok) return NextResponse.json({ error: 'Invalid request.' }, { status: body.status });
  const parsed = passwordChangeSchema.safeParse(body.body);
  if (!parsed.success) return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
  try {
    const record = findUserById(user.id);
    if (!record || !verifyPassword(parsed.data.currentPassword, record.password_hash)) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
    }
    updatePassword(user.id, parsed.data.newPassword);
    const currentToken = readSessionCookie(request);
    if (currentToken) deleteOtherSessions(user.id, currentToken);
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Could not update password. Please try again.' }, { status: 500 });
  }
}