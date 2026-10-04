// Shared request guards for the API surface: same-origin enforcement and
// bounded body reads (never trust Content-Length alone).

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
}

export async function readJsonBody(request: Request, maxBytes = 64000): Promise<{ ok: true; body: unknown } | { ok: false; status: 400 | 413 }> {
  const reader = request.body?.getReader();
  if (!reader) return { ok: false, status: 400 };
  const decoder = new TextDecoder();
  let raw = '';
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) { await reader.cancel(); return { ok: false, status: 413 }; }
    raw += decoder.decode(value, { stream: true });
  }
  raw += decoder.decode();
  try { return { ok: true, body: JSON.parse(raw) }; }
  catch { return { ok: false, status: 400 }; }
}

// Lightweight per-process throttling for auth endpoints (not distributed protection).
const attempts = new Map<string, { count: number; resetAt: number }>();

export function throttle(key: string, limit = 12, windowMs = 15 * 60_000): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}