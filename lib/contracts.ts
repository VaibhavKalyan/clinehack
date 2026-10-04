export type Language = 'en' | 'hi' | 'te';
export interface Profile {
  age?: number;
  state?: string;
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