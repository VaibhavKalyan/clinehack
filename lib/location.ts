// Auto-location. Pure helpers (normalisation + offline nearest-state) are kept
// separate from the browser orchestrator so they are unit-testable in Node.
// Precise GPS coordinates are only sent to our own /api/location proxy for
// reverse-geocoding; nothing is stored or logged.

import type { LocationInfo } from './contracts';

export const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
] as const;

/** Approximate state centroids used only for coarse offline fallback. */
const CENTROIDS: Record<string, [number, number]> = {
  'Andhra Pradesh': [15.91, 79.74], 'Arunachal Pradesh': [28.22, 94.73], 'Assam': [26.2, 92.94],
  'Bihar': [25.1, 85.31], 'Chhattisgarh': [21.28, 81.86], 'Goa': [15.3, 74.12], 'Gujarat': [22.26, 71.19],
  'Haryana': [29.06, 76.09], 'Himachal Pradesh': [31.1, 77.17], 'Jharkhand': [23.61, 85.28],
  'Karnataka': [15.32, 75.71], 'Kerala': [10.85, 76.27], 'Madhya Pradesh': [22.97, 78.66],
  'Maharashtra': [19.75, 75.71], 'Manipur': [24.66, 93.91], 'Meghalaya': [25.47, 91.37],
  'Mizoram': [23.16, 92.94], 'Nagaland': [26.16, 94.56], 'Odisha': [20.95, 85.1], 'Punjab': [31.15, 75.34],
  'Rajasthan': [27.02, 74.22], 'Sikkim': [27.53, 88.51], 'Tamil Nadu': [11.13, 78.66],
  'Telangana': [18.11, 79.02], 'Tripura': [23.94, 91.99], 'Uttar Pradesh': [26.85, 80.95],
  'Uttarakhand': [30.07, 79.02], 'West Bengal': [22.99, 87.86], 'Andaman and Nicobar Islands': [11.74, 92.66],
  'Chandigarh': [30.73, 76.78], 'Dadra and Nagar Haveli and Daman and Diu': [20.18, 73.01],
  'Delhi': [28.7, 77.1], 'Jammu and Kashmir': [33.78, 76.58], 'Ladakh': [34.15, 77.58],
  'Lakshadweep': [10.57, 72.64], 'Puducherry': [11.94, 79.83],
};

const ALIASES: Record<string, string> = {
  'orissa': 'Odisha', 'uttaranchal': 'Uttarakhand', 'pondicherry': 'Puducherry',
  'new delhi': 'Delhi', 'nct of delhi': 'Delhi', 'delhi nct': 'Delhi',
  'andaman and nicobar': 'Andaman and Nicobar Islands',
  'andaman and nicobar islands': 'Andaman and Nicobar Islands',
  'dadra and nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'madras': 'Tamil Nadu', 'bombay': 'Maharashtra', 'calcutta': 'West Bengal', 'bangalore': 'Karnataka',
};

const key = (value: string) => value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

/** Map a free-form state string to a canonical STATES entry, if recognized. */
export function normalizeState(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined;
  const k = key(raw);
  if (!k) return undefined;
  const direct = (STATES as readonly string[]).find(s => key(s) === k);
  if (direct) return direct;
  return ALIASES[k];
}

/** Nearest state by centroid. Coarse; used only when reverse-geocoding is unavailable. */
export function nearestState(lat: number, lon: number): string | undefined {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return undefined;
  let best: string | undefined;
  let bestDistance = Infinity;
  for (const [state, [sla, slo]] of Object.entries(CENTROIDS)) {
    const dLat = lat - sla;
    const dLon = lon - slo;
    const distance = dLat * dLat + dLon * dLon;
    if (distance < bestDistance) { bestDistance = distance; best = state; }
  }
  return best;
}

function getCoords(): Promise<{ lat: number; lon: number; accuracy?: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) { reject(new Error('unsupported')); return; }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      err => reject(err),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  });
}

async function reverseGeocode(lat: number, lon: number): Promise<{ state?: string; district?: string }> {
  const res = await fetch(`/api/location?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('geocode failed');
  const data = (await res.json()) as { state?: string; district?: string };
  return { state: normalizeState(data.state), district: data.district };
}

async function ipLookup(): Promise<{ state?: string }> {
  const res = await fetch('/api/location', { cache: 'no-store' });
  if (!res.ok) throw new Error('ip lookup failed');
  const data = (await res.json()) as { state?: string };
  return { state: normalizeState(data.state) };
}

/**
 * Detect the user's area. Tries precise GPS first (user-permission gated), then a
 * network/IP approximation. Falls back to a coarse offline nearest-state guess.
 * The caller should always let the user confirm or edit the result.
 */
export async function detectLocation(): Promise<LocationInfo> {
  try {
    const { lat, lon, accuracy } = await getCoords();
    try {
      const { state, district } = await reverseGeocode(lat, lon);
      if (state) return { state, district, source: 'gps', accuracyMeters: accuracy };
    } catch {
      const state = nearestState(lat, lon);
      if (state) return { state, source: 'offline', accuracyMeters: accuracy };
    }
    const state = nearestState(lat, lon);
    return state ? { state, source: 'offline', accuracyMeters: accuracy } : { source: 'manual' };
  } catch {
    try {
      const { state } = await ipLookup();
      return state ? { state, source: 'ip' } : { source: 'manual' };
    } catch {
      return { source: 'manual' };
    }
  }
}