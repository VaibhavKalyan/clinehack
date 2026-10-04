import { NextResponse } from 'next/server';
import { readJsonBody, sameOrigin } from '@/lib/api';
import { accountSchema } from '@/lib/validation';
import { getSessionUser, updateUserName } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 15;

/** Update the signed-in account's display name. */
export async function PUT(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  const user = getSessionUser(request);
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const body = await readJsonBody(request, 4000);
  if (!body.ok) return NextResponse.json({ error: 'Invalid request.' }, { status: body.status });
  const parsed = accountSchema.safeParse(body.body);
  if (!parsed.success) return NextResponse.json({ error: 'Please enter a valid name.' }, { status: 400 });
  try {
    updateUserName(user.id, parsed.data.name);
    return NextResponse.json({ user: { id: user.id, name: parsed.data.name, email: user.email } }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Could not update. Please try again.' }, { status: 500 });
  }
}