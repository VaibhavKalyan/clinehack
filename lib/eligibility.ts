import data from '../data/schemes.json';
import type { Match, Profile, Rule, Scheme } from './contracts';

export const schemes: Scheme[] = data as Scheme[];
const base: (keyof Profile)[] = ['age', 'state', 'annualIncome', 'occupation'];
const normalize = (value: string) => value.trim().toLowerCase();

// Invalid runtime inputs are unknown, never coerced into evidence of eligibility.
function known(profile: Profile, field: keyof Profile): boolean {
  const value = profile?.[field];
  if (field === 'age') return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 120;
  if (field === 'annualIncome') return typeof value === 'number' && Number.isFinite(value) && value >= 0;
  if (['ownsLand', 'hasDisability', 'isStudent'].includes(field)) return typeof value === 'boolean';
  if (field === 'gender') return typeof value === 'string' && ['female', 'male', 'other'].includes(normalize(value));
  return typeof value === 'string' && value.trim().length > 0;
}

export function getMissingFields(profile: Profile): (keyof Profile)[] {
  return base.filter(field => !known(profile, field));
}

function passes(value: Profile[keyof Profile], rule: Rule): boolean {
  if (rule.op === 'gte') return typeof value === 'number' && typeof rule.value === 'number' && value >= rule.value;
  if (rule.op === 'lte') return typeof value === 'number' && typeof rule.value === 'number' && value <= rule.value;
  if (rule.op === 'in') return typeof value === 'string' && Array.isArray(rule.value) && rule.value.some(item => normalize(item) === normalize(value));
  return typeof value === 'string' && typeof rule.value === 'string' ? normalize(value) === normalize(rule.value) : value === rule.value;
}

export function matchSchemes(profile: Profile): Match[] {
  return schemes.map((scheme): Match => {
    const missingFields = getMissingFields(profile);
    const reasons: string[] = [];
    let failed = false;
    let passed = 0;
    for (const rule of scheme.rules) {
      if (!known(profile, rule.field)) {
        if (!missingFields.includes(rule.field)) missingFields.push(rule.field);
        reasons.push(`Unknown ${rule.field}: needed to check ${rule.op} ${JSON.stringify(rule.value)}.`);
      } else if (passes(profile[rule.field], rule)) {
        passed++;
        reasons.push(`Meets modeled rule: ${rule.field} ${rule.op} ${JSON.stringify(rule.value)}.`);
      } else {
        failed = true;
        reasons.push(`Does not meet modeled rule: ${rule.field} ${rule.op} ${JSON.stringify(rule.value)}.`);
      }
    }
    if (scheme.coverage === 'partial') reasons.push('Partial screening only: additional conditions and exclusions must be checked with the official provider. ' + scheme.description);
    if (!scheme.last_verified) reasons.push('Policy has not been fully verified; confirm current terms at the linked official source.');
    const status = failed ? 'not_eligible' : missingFields.length || scheme.coverage === 'partial' || !scheme.last_verified ? 'likely' : 'eligible';
    // A transparent rule-completeness score, not a probability or approval guarantee.
    const score = failed ? 0 : Math.round(100 * passed / Math.max(1, scheme.rules.length));
    return { scheme, status, score, reasons, missingFields };
  }).sort((a, b) => {
    const rank = { eligible: 0, likely: 1, not_eligible: 2 };
    return rank[a.status] - rank[b.status] || b.score - a.score || a.scheme.id.localeCompare(b.scheme.id, 'en');
  });
}