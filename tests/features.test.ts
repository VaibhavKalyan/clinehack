import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Isolated SQLite database per test run — never touches the real .data/ dir.
process.env.KNOCK_DATA_DIR = mkdtempSync(join(tmpdir(), 'knock-test-'));

import { LANGUAGE_CODES } from '../lib/contracts';
import { getLabels, LANGUAGES, languageName, speechLocale } from '../lib/i18n';
import { nearestState, normalizeState, STATES } from '../lib/location';
import { pickVoice, scoreVoice } from '../lib/tts';

test('every language resolves a complete label set with English fallback', () => {
  const base = getLabels('en');
  const baseKeys = Object.keys(base) as (keyof typeof base)[];
  for (const code of LANGUAGE_CODES) {
    const labels = getLabels(code);
    for (const key of baseKeys) assert.notEqual(labels[key], undefined, `missing ${key} for ${code}`);
    assert.ok(Array.isArray(labels.prompts) && labels.prompts.length > 0);
  }
});

test('language metadata covers all codes with distinct speech locales', () => {
  assert.equal(LANGUAGES.length, LANGUAGE_CODES.length);
  for (const code of LANGUAGE_CODES) {
    const meta = LANGUAGES.find(l => l.code === code);
    assert.ok(meta);
    assert.equal(speechLocale(code), meta.speechLocale);
    assert.equal(languageName(code), meta.name);
  }
});

test('state normalisation maps variants and rejects unknown values', () => {
  assert.equal(normalizeState('telangana'), 'Telangana');
  assert.equal(normalizeState('TELANGANA'), 'Telangana');
  assert.equal(normalizeState(' Orissa '), 'Odisha');
  assert.equal(normalizeState('Uttaranchal'), 'Uttarakhand');
  assert.equal(normalizeState('New Delhi'), 'Delhi');
  assert.equal(normalizeState('Jammu & Kashmir'), 'Jammu and Kashmir');
  assert.equal(normalizeState(''), undefined);
  assert.equal(normalizeState(undefined), undefined);
  assert.equal(normalizeState('Narnia'), undefined);
});

test('offline nearest-state picks the closest centroid', () => {
  assert.equal(nearestState(17.385, 78.4867), 'Telangana'); // Hyderabad
  assert.equal(nearestState(28.6139, 77.209), 'Delhi');
  assert.ok(STATES.includes('Telangana'));
});

test('voice selection prefers the target locale and rejects other languages', () => {
  const voices = [
    { name: 'English Voice', lang: 'en-IN', localService: true },
    { name: 'Hindi Neural', lang: 'hi-IN', localService: true },
    { name: 'Telugu Voice', lang: 'te-IN' },
  ];
  assert.equal(pickVoice(voices, 'hi-IN')?.name, 'Hindi Neural');
  assert.equal(pickVoice(voices, 'te-IN')?.name, 'Telugu Voice');
  assert.equal(pickVoice(voices, 'kn-IN'), null);
  assert.equal(pickVoice(voices, 'hi-IN', 'Telugu Voice')?.name, 'Telugu Voice', 'preferred voice wins');
  assert.ok(scoreVoice({ name: 'X', lang: 'hi-IN' }, 'hi-IN') >= 100);
  assert.equal(scoreVoice({ name: 'X', lang: 'en-IN' }, 'hi-IN'), -1);
});

import { POST as register } from '../app/api/auth/register/route';
import { POST as login } from '../app/api/auth/login/route';
import { POST as logout } from '../app/api/auth/logout/route';
import { GET as session } from '../app/api/auth/session/route';
import { GET as getProfile, PUT as putProfile } from '../app/api/profile/route';

const json = (url: string, method: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(url, { method, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', ...headers } });

function sessionToken(res: Response): string {
  const match = (res.headers.get('set-cookie') ?? '').match(/knock_session=([a-f0-9]+)/);
  return match?.[1] ?? '';
}

test('register → session → profile sync roundtrip', async () => {
  const email = `asha+${Date.now()}@example.com`;
  const res = await register(json('http://localhost/api/auth/register', 'POST', { name: 'Asha Kumari', email, password: 'villagedoor-7' }));
  assert.equal(res.status, 200);
  assert.equal((await res.json()).user.email, email);
  const token = sessionToken(res);
  assert.ok(token.length >= 32, 'session cookie is a strong random token');

  const sess = await (await session(new Request('http://localhost/api/auth/session', { headers: { cookie: `knock_session=${token}` } }))).json();
  assert.equal(sess.user.email, email);

  const put = await putProfile(json('http://localhost/api/profile', 'PUT',
    { profile: { age: 34, state: 'Telangana', district: 'Hyderabad', annualIncome: 90000, occupation: 'farmer' }, language: 'te' },
    { cookie: `knock_session=${token}` }));
  assert.equal(put.status, 200);

  const saved = await (await getProfile(new Request('http://localhost/api/profile', { headers: { cookie: `knock_session=${token}` } }))).json();
  assert.equal(saved.profile.age, 34);
  assert.equal(saved.profile.district, 'Hyderabad');
  assert.equal(saved.language, 'te');
});

test('auth validation, duplicates and bad credentials are rejected safely', async () => {
  assert.equal((await register(json('http://localhost/api/auth/register', 'POST', { name: 'X', email: 'bad', password: 'short' }))).status, 400);
  assert.equal((await register(new Request('http://localhost/api/auth/register', { method: 'POST', body: '{}', headers: { origin: 'http://attacker.invalid' } }))).status, 403);
  const email = `bharat+${Date.now()}@example.com`;
  await register(json('http://localhost/api/auth/register', 'POST', { name: 'Bharat', email, password: 'longenough-9' }));
  assert.equal((await register(json('http://localhost/api/auth/register', 'POST', { name: 'Bharat', email, password: 'longenough-9' }))).status, 409);
  assert.equal((await login(json('http://localhost/api/auth/login', 'POST', { email, password: 'wrong-password' }))).status, 401);

  const res = await login(json('http://localhost/api/auth/login', 'POST', { email, password: 'longenough-9' }));
  assert.equal(res.status, 200);
  const token = sessionToken(res);
  await logout(new Request('http://localhost/api/auth/logout', { method: 'POST', headers: { cookie: `knock_session=${token}` } }));
  const after = await (await session(new Request('http://localhost/api/auth/session', { headers: { cookie: `knock_session=${token}` } }))).json();
  assert.equal(after.user, null, 'logout invalidates the session');
});

test('profile sync requires a signed-in session', async () => {
  assert.equal((await getProfile(new Request('http://localhost/api/profile'))).status, 401);
  assert.equal((await putProfile(json('http://localhost/api/profile', 'PUT', { profile: {}, language: 'en' }))).status, 401);
});

import { plainText } from '../lib/text';

test('reply normalisation strips markdown and emoji so bubbles and speech stay clean', () => {
  const raw = [
    'KNOCK',
    '### ✅ Likely Matches 🎉',
    '',
    '1. **Pradhan Mantri Ujjwala Yojana (PMUY)** — deposit-free LPG.',
    '2. **Senior Citizens Scheme** — interest income.',
    '',
    '---',
    '> ⚠️ Preliminary results only.',
    '',
    'Ask me `anything` or reply *Yes / No*.',
    '😊',
  ].join('\n');
  const clean = plainText(raw);
  assert.ok(!clean.includes('###'), 'no headings');
  assert.ok(!clean.includes('**'), 'no bold');
  assert.ok(!clean.includes('---'), 'no rules');
  assert.ok(!clean.includes('`'), 'no code marks');
  assert.ok(!clean.includes('✅') && !clean.includes('🎉') && !clean.includes('😊') && !clean.includes('⚠'), 'no emoji');
  assert.ok(!clean.startsWith('KNOCK'), 'name title dropped');
  assert.ok(clean.includes('Pradhan Mantri Ujjwala Yojana (PMUY)'), 'content preserved');
  assert.ok(clean.includes('Yes / No'), 'italics unwrapped');
  assert.ok(!/\n{3,}/.test(clean), 'no triple blank lines');
});

test('plain text passes through unchanged', () => {
  assert.equal(plainText('Namaste! I found 3 opportunities for you.'), 'Namaste! I found 3 opportunities for you.');
});
import { GET as getApps, PUT as putApp, DELETE as delApp } from '../app/api/applications/route';
import { PUT as putAccount } from '../app/api/account/route';
import { POST as changePassword } from '../app/api/auth/password/route';

test('scheme tracking: save, apply, list and remove per account', async () => {
  const email = `track+${Date.now()}@example.com`;
  const reg = await register(json('http://localhost/api/auth/register', 'POST', { name: 'Tracker Kumari', email, password: 'longenough-7' }));
  const cookie = { cookie: `knock_session=${sessionToken(reg)}` };

  // requires a session
  assert.equal((await getApps(new Request('http://localhost/api/applications'))).status, 401);
  assert.equal((await putApp(json('http://localhost/api/applications', 'PUT', { schemeId: 'pm-kisan', status: 'saved' }))).status, 401);

  // unknown scheme ids are rejected at the boundary
  assert.equal((await putApp(json('http://localhost/api/applications', 'PUT', { schemeId: 'does-not-exist', status: 'saved' }, cookie))).status, 400);
  assert.equal((await putApp(json('http://localhost/api/applications', 'PUT', { schemeId: 'pm-kisan', status: 'favourite' }, cookie))).status, 400);

  assert.equal((await putApp(json('http://localhost/api/applications', 'PUT', { schemeId: 'pm-kisan', status: 'saved' }, cookie))).status, 200);
  assert.equal((await putApp(json('http://localhost/api/applications', 'PUT', { schemeId: 'nsp-csss', status: 'applied' }, cookie))).status, 200);

  const list = await (await getApps(new Request('http://localhost/api/applications', { headers: cookie }))).json() as { applications: Array<{ schemeId: string; status: string }> };
  const map = new Map(list.applications.map(a => [a.schemeId, a.status]));
  assert.equal(map.get('pm-kisan'), 'saved');
  assert.equal(map.get('nsp-csss'), 'applied');

  // removing one keeps the other
  assert.equal((await delApp(new Request('http://localhost/api/applications?schemeId=pm-kisan', { method: 'DELETE', headers: cookie }))).status, 200);
  const after = await (await getApps(new Request('http://localhost/api/applications', { headers: cookie }))).json() as { applications: Array<{ schemeId: string }> };
  assert.equal(after.applications.length, 1);
  assert.equal(after.applications[0].schemeId, 'nsp-csss');
});

test('account settings: rename and change password with re-authentication', async () => {
  const email = `rename+${Date.now()}@example.com`;
  const reg = await register(json('http://localhost/api/auth/register', 'POST', { name: 'Old Name', email, password: 'original-12345' }));
  const cookie = { cookie: `knock_session=${sessionToken(reg)}` };

  // rename requires a session and a valid name
  assert.equal((await putAccount(json('http://localhost/api/account', 'PUT', { name: '' }))).status, 401);
  assert.equal((await putAccount(json('http://localhost/api/account', 'PUT', { name: '  ' }, cookie))).status, 400);
  assert.equal((await putAccount(json('http://localhost/api/account', 'PUT', { name: 'New Name' }, cookie))).status, 200);
  const sess = await (await session(new Request('http://localhost/api/auth/session', { headers: cookie }))).json();
  assert.equal(sess.user.name, 'New Name');

  // wrong current password is rejected
  assert.equal((await changePassword(json('http://localhost/api/auth/password', 'POST', { currentPassword: 'wrong-password', newPassword: 'updated-12345' }, cookie))).status, 401);
  // short new password is rejected
  assert.equal((await changePassword(json('http://localhost/api/auth/password', 'POST', { currentPassword: 'original-12345', newPassword: 'short' }, cookie))).status, 400);

  // correct change works, old password stops working
  assert.equal((await changePassword(json('http://localhost/api/auth/password', 'POST', { currentPassword: 'original-12345', newPassword: 'updated-12345' }, cookie))).status, 200);
  assert.equal((await login(json('http://localhost/api/auth/login', 'POST', { email, password: 'original-12345' }))).status, 401);
  assert.equal((await login(json('http://localhost/api/auth/login', 'POST', { email, password: 'updated-12345' }))).status, 200);
});
