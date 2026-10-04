import { NextResponse } from 'next/server';
import { readJsonBody, sameOrigin } from '@/lib/api';
import { profilePutSchema } from '@/lib/validation';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 15;

export async function GET(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  const user = getSessionUser(request);
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  try {
    const row = getDb().prepare('SELECT profile_json, language FROM profiles WHERE user_id = ?').get(user.id) as { profile_json: string; language: string } | undefined;
    return NextResponse.json(
      row ? { profile: JSON.parse(row.profile_json), language: row.language } : { profile: {}, language: 'en' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json({ profile: {}, language: 'en' }, { headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function PUT(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  const user = getSessionUser(request);
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const body = await readJsonBody(request, 32000);
  if (!body.ok) return NextResponse.json({ error: 'Invalid request.' }, { status: body.status });
  const parsed = profilePutSchema.safeParse(body.body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid profile data.' }, { status: 400 });
  try {
    getDb().prepare(
      `INSERT INTO profiles (user_id, profile_json, language, updated_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET profile_json = excluded.profile_json, language = excluded.language, updated_at = excluded.updated_at`,
    ).run(user.id, JSON.stringify(parsed.data.profile), parsed.data.language, new Date().toISOString());
    return NextResponse.json({ ok: true, savedAt: new Date().toISOString() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Could not save. Please try again.' }, { status: 500 });
  }
}