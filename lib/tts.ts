// Enhanced browser text-to-speech. This is provider-agnostic: the pure
// `pickVoice`/`scoreVoice` logic is separated from the browser controller so a
// cloud TTS (Google / OpenAI / ElevenLabs) can be slotted behind `speak()` later
// without touching the UI. Everything here is keyless and offline-capable.

import { speechLocale } from './i18n';
import type { Language } from './contracts';

/** Minimal voice shape so selection logic is testable without a browser. */
export interface VoiceLike {
  name: string;
  lang: string;
  localService?: boolean;
  default?: boolean;
}

/** Heuristic, quality-oriented voice scoring for a target locale. */
export function scoreVoice(voice: VoiceLike, targetLocale: string): number {
  const lang = (voice.lang || '').toLowerCase();
  const target = targetLocale.toLowerCase();
  const targetBase = target.split('-')[0];
  let score = 0;
  if (lang === target) score += 100;
  else if (lang === targetBase) score += 60;
  else if (lang.startsWith(targetBase + '-')) score += 55;
  else return -1; // different language entirely
  // Offline/local voices avoid network latency and are usually more reliable.
  if (voice.localService) score += 8;
  if (voice.default) score += 4;
  // Names hinting at higher-quality neural voices (varies by platform).
  const name = voice.name.toLowerCase();
  if (/natural|neural|premium|enhanced|wavenet|google|online/.test(name)) score += 10;
  if (/compact|espeak|robotic/.test(name)) score -= 6;
  return score;
}

/** Pick the best voice for a locale, honoring a user-preferred voice if set. */
export function pickVoice(voices: VoiceLike[], locale: string, preferredName?: string | null): VoiceLike | null {
  if (preferredName) {
    const preferred = voices.find(v => v.name === preferredName);
    if (preferred) return preferred;
  }
  let best: VoiceLike | null = null;
  let bestScore = -1;
  for (const voice of voices) {
    const score = scoreVoice(voice, locale);
    if (score > bestScore) { bestScore = score; best = voice; }
  }
  return bestScore >= 0 ? best : null;
}

/** Resolve the device voice list, waiting for the async `voiceschanged` event. */
export function loadVoices(): Promise<VoiceLike[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return Promise.resolve([]);
  const existing = window.speechSynthesis.getVoices();
  if (existing.length) return Promise.resolve(existing);
  return new Promise(resolve => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.speechSynthesis.onvoiceschanged = null;
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.onvoiceschanged = finish;
    // Some browsers never fire the event; don't hang forever.
    setTimeout(finish, 1200);
  });
}

export interface TTSController {
  supported: boolean;
  speak: (text: string, language: Language, onDone?: () => void) => void;
  stop: () => void;
  setRate: (rate: number) => void;
  setPreferredVoice: (name: string | null) => void;
}

/** Create a browser TTS controller. Call only in the browser. */
export function createTTS(): TTSController {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  let preferred: string | null = null;
  let rate = 1;
  const stop = () => { if (supported) window.speechSynthesis.cancel(); };
  const speak = (text: string, language: Language, onDone?: () => void) => {
    if (!supported || !text.trim()) { onDone?.(); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const locale = speechLocale(language);
    utterance.lang = locale;
    utterance.rate = rate;
    utterance.pitch = 1;
    const apply = (voices: VoiceLike[]) => {
      const voice = pickVoice(voices, locale, preferred);
      if (voice) {
        const native = window.speechSynthesis.getVoices().find(v => v.name === voice.name);
        if (native) utterance.voice = native;
      }
      utterance.onend = () => onDone?.();
      utterance.onerror = () => onDone?.();
      window.speechSynthesis.speak(utterance);
    };
    const cached = window.speechSynthesis.getVoices();
    if (cached.length) apply(cached);
    else void loadVoices().then(apply);
  };
  return {
    supported,
    speak,
    stop,
    setRate: (r: number) => { rate = Math.min(1.6, Math.max(0.6, r)); },
    setPreferredVoice: (name: string | null) => { preferred = name; },
  };
}