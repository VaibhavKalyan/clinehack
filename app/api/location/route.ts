import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 15;

const UA = 'KnockWelfareNavigator/1.0 (scheme guidance prototype)';

function clientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  const candidate = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip')?.trim();
  // Basic shape guard; never logged or stored.
  return candidate && /^[0-9a-fA-F:.]{3,45}$/.test(candidate) ? candidate : null;
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
}

async function reverseGeocode(lat: number, lon: number): Promise<{ state?: string; district?: string }> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&addressdetails=1&zoom=10&accept-language=en`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(6000) });
  if (!res.ok) return {};
  const data = (await res.json()) as { address?: Record<string, string> };
  const address = data.address ?? {};
  return {
    state: address.state || address.state_district,
    district: address.county || address.state_district || address.district || address.city || address.town,
  };
}

async function ipLocate(ip: string): Promise<{ state?: string }> {
  const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(6000) });
  if (!res.ok) return {};
  const data = (await res.json()) as { region?: string; error?: boolean };
  if (data.error) return {};
  return { state: data.region };
}

export async function GET(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  const url = new URL(request.url);
  const latRaw = url.searchParams.get('lat');
  const lonRaw = url.searchParams.get('lon');
  try {
    if (latRaw !== null && lonRaw !== null) {
      const lat = Number(latRaw);
      const lon = Number(lonRaw);
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return NextResponse.json({ error: 'Invalid coordinates.' }, { status: 400 });
      }
      const result = await reverseGeocode(lat, lon);
      return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
    }
    const ip = clientIp(request);
    if (!ip) return NextResponse.json({}, { headers: { 'Cache-Control': 'no-store' } });
    const result = await ipLocate(ip);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({}, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }
}