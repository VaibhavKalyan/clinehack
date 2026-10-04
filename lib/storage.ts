// Non-personal device preferences (language, voice, speed) in localStorage.
// Profiles are no longer stored here — they sync to your account server-side.
// Everything degrades gracefully when storage is unavailable (e.g. private mode).

import type { Language } from './contracts';

const PREFS_KEY = 'knock.prefs.v1';

export interface LocalPrefs {
  language?: Language;
  rate?: number;
  preferredVoice?: string | null;
}

function store(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch { return null; }
}

export function loadPrefs(): LocalPrefs {
  const s = store();
  if (!s) return {};
  try {
    const raw = s.getItem(PREFS_KEY);
    const parsed = raw ? (JSON.parse(raw) as LocalPrefs) : {};
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch { return {}; }
}

export function savePrefs(patch: Partial<LocalPrefs>): LocalPrefs {
  const next = { ...loadPrefs(), ...patch };
  const s = store();
  if (s) {
    try { s.setItem(PREFS_KEY, JSON.stringify(next)); } catch { /* quota or private mode */ }
  }
  return next;
}