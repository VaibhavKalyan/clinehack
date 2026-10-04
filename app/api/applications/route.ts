import { NextResponse } from 'next/server';
import { readJsonBody, sameOrigin } from '@/lib/api';
import { applicationSchema } from '@/lib/validation';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { schemes } from '@/lib/eligibility';

export const runtime = 'nodejs';
export const maxDuration = 15;

/** Per-account scheme tracking (saved / applied). Scheme ids are validated
 *  against the curated catalog at this boundary. */
export async function GET(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  const user = getSessionUser(request);
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  try {
    const rows = getDb().prepare('SELECT scheme_id, status, updated_at FROM scheme_status WHERE user_id = ? ORDER BY updated_at DESC').all(user.id) as Array<{ scheme_id: string; status: string; updated_at: string }>;
    return NextResponse.json({ applications: rows.map(r => ({ schemeId: r.scheme_id, status: r.status, updatedAt: r.updated_at })) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ applications: [] }, { headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function PUT(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  const user = getSessionUser(request);
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const body = await readJsonBody(request, 4000);
  if (!body.ok) return NextResponse.json({ error: 'Invalid request.' }, { status: body.status });
  const parsed = applicationSchema.safeParse(body.body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid scheme tracking request.' }, { status: 400 });
  if (!schemes.some(s => s.id === parsed.data.schemeId)) return NextResponse.json({ error: 'Unknown scheme.' }, { status: 400 });
  try {
    getDb().prepare(
      `INSERT INTO scheme_status (user_id, scheme_id, status, updated_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, scheme_id) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at`,
    ).run(user.id, parsed.data.schemeId, parsed.data.status, new Date().toISOString());
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Could not save. Please try again.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  const user = getSessionUser(request);
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const schemeId = new URL(request.url).searchParams.get('schemeId') ?? '';
  if (!schemes.some(s => s.id === schemeId)) return NextResponse.json({ error: 'Unknown scheme.' }, { status: 400 });
  try {
    getDb().prepare('DELETE FROM scheme_status WHERE user_id = ? AND scheme_id = ?').run(user.id, schemeId);
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Could not update. Please try again.' }, { status: 500 });
  }
}