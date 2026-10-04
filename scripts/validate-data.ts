import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const fields: Record<string, string> = { age: 'number', state: 'string', annualIncome: 'number', occupation: 'string', gender: 'string', category: 'string', hasDisability: 'boolean', isStudent: 'boolean', ownsLand: 'boolean' };
const keys = ['id', 'name', 'description', 'benefit', 'source_url', 'last_verified', 'documents', 'steps', 'rules', 'coverage'];
const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

export function validateData(input: unknown): string[] {
  if (!Array.isArray(input) || !input.length) return ['Expected a nonempty scheme array.'];
  const errors: string[] = [];
  const ids = new Set<string>();
  input.forEach((s, i) => {
    const fail = (message: string) => errors.push(`Scheme ${i}: ${message}`);
    if (!object(s)) { fail('Expected object.'); return; }
    if (Object.keys(s).some(k => !keys.includes(k)) || keys.some(k => !(k in s))) fail('Scheme keys must match contract.');
    for (const k of ['id', 'name', 'description', 'benefit', 'source_url']) if (!text(s[k])) fail(`${k} must be nonempty text.`);
    if (text(s.id)) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s.id)) fail('Invalid id.');
      if (ids.has(s.id)) fail('Duplicate id.');
      ids.add(s.id);
    }
    try {
      const url = new URL(String(s.source_url));
      if (url.protocol !== 'https:' || url.username || url.password || !(/\.(gov\.in|nic\.in)$/.test(url.hostname) || url.hostname === 'maandhan.in')) fail('Source must use HTTPS on an approved official host.');
    } catch { fail('Invalid source URL.'); }
    if (s.last_verified !== null) {
      const date = String(s.last_verified);
      const parsed = new Date(date);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || parsed.getTime() > Date.now()) fail('Verification date must be a real, nonfuture ISO date or null.');
    }
    if (!['partial', 'complete'].includes(String(s.coverage))) fail('Invalid coverage.');
    for (const k of ['documents', 'steps']) if (!Array.isArray(s[k]) || !s[k].length || !s[k].every(text)) fail(`${k} must be a nonempty text array.`);
    if (!Array.isArray(s.rules)) { fail('Rules must be an array.'); return; }
    s.rules.forEach((r: unknown) => {
      if (!object(r)) { fail('Invalid rule.'); return; }
      if (Object.keys(r).sort().join(',') !== 'field,op,value') fail('Rule keys must match contract.');
      if (typeof r.field !== 'string' || !Object.hasOwn(fields, r.field)) { fail('Unknown rule field.'); return; }
      if (!['eq', 'gte', 'lte', 'in'].includes(String(r.op))) fail('Unknown rule operator.');
      const type = fields[r.field];
      if (r.op === 'in') {
        if (type !== 'string' || !Array.isArray(r.value) || !r.value.length || !r.value.every(text)) fail('in requires a string field and nonempty string array.');
      } else {
        if (typeof r.value !== type || (type === 'string' && !text(r.value))) fail('Rule value has wrong type.');
        if (['gte', 'lte'].includes(String(r.op)) && type !== 'number') fail('Numeric comparison requires numeric field.');
        if (type === 'number' && (typeof r.value !== 'number' || !Number.isFinite(r.value) || r.value < 0)) fail('Invalid numeric threshold.');
        if (r.field === 'age' && (typeof r.value !== 'number' || !Number.isInteger(r.value) || r.value > 120)) fail('Invalid completed age threshold.');
      }
      if (r.field === 'gender' && !(Array.isArray(r.value) ? r.value : [r.value]).every(v => ['female', 'male', 'other'].includes(String(v)))) fail('Invalid gender value.');
    });
  });
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const file = process.argv[2] || resolve(process.cwd(), 'data/schemes.json');
    const data: unknown = JSON.parse(readFileSync(file, 'utf8'));
    const errors = validateData(data);
    if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
    else {
      console.log(`Validated ${(data as unknown[]).length} schemes. Structural validation does not verify policy accuracy or source availability.`);
      console.log('Review null/stale verification dates and all partial-coverage conditions with official providers before relying on results.');
    }
  } catch (error) { console.error(`Validation failed: ${String(error)}`); process.exitCode = 1; }
}