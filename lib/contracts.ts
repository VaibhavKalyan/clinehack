// Supported interface languages. Adding a language = add a code here, add a
// dictionary in lib/i18n.ts (English fallback covers any missing key), and map
// its TTS/STT locale in LANGUAGES. TTS/STT quality depends on device voices.
export const LANGUAGE_CODES = ['en', 'hi', 'te', 'ta', 'kn', 'mr', 'bn', 'gu'] as const;
export type Language = (typeof LANGUAGE_CODES)[number];

export interface LanguageMeta {
  code: Language;
  /** English name of the language (for switcher accessibility labels). */
  name: string;
  /** Native display name shown in the language switcher. */
  native: string;
  /** BCP-47 locale used for speech synthesis / recognition. */
  speechLocale: string;
}

/** Where a detected location came from. Precision varies by source. */
export type LocationSource = 'gps' | 'ip' | 'manual' | 'offline';

export interface LocationInfo {
  state?: string;
  district?: string;
  source: LocationSource;
  /** Rough accuracy hint in metres when known (GPS only). */
  accuracyMeters?: number;
}

export interface Profile {
  age?: number;
  state?: string;
  district?: string;
  annualIncome?: number;
  occupation?: string;
  gender?: 'female' | 'male' | 'other';
  category?: string;
  hasDisability?: boolean;
  isStudent?: boolean;
  ownsLand?: boolean;
}
export interface Rule {
  field: keyof Profile;
  op: 'eq' | 'lte' | 'gte' | 'in';
  value: string | number | boolean | string[];
}
export interface Scheme {
  id: string;
  name: string;
  description: string;
  benefit: string;
  source_url: string;
  last_verified: string | null;
  documents: string[];
  steps: string[];
  rules: Rule[];
  coverage: 'partial' | 'complete';
}
export interface Match {
  scheme: Scheme;
  status: 'eligible' | 'likely' | 'not_eligible';
  score: number;
  reasons: string[];
  missingFields: (keyof Profile)[];
}
export interface ToolTrace { tool: string; summary: string }
export interface ChatResponse {
  reply: string;
  profile: Profile;
  matches: Match[];
  trace: ToolTrace[];
  mode: 'demo' | 'live';
  missingFields: (keyof Profile)[];
}

/** Token purposes we store hashed in the database. */
export type EmailPurpose = 'verify_email';

/**
 * Register always returns this until the address is verified. `devLink` is only
 * present outside production so a tester can complete verification without a
 * real mail provider; it is `null` in production.
 */
export interface RegisterResponse {
  status: 'verification_required';
  email: string;
  devLink: string | null;
}

/** Response from POST /api/auth/resend — always generic to avoid enumeration. */
export interface ResendResponse {
  status: 'sent';
  devLink: string | null;
}

/** Response from POST /api/auth/verify on success. */
export interface VerifyResponse {
  ok: true;
  email: string;
}