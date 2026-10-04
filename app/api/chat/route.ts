import { NextResponse } from 'next/server';
import { chatSchema } from '@/lib/validation';
import { chat } from '@/lib/chat';
export const runtime = 'nodejs';
export const maxDuration = 60;
let active = 0;
export async function POST(request: Request) {
  if (active >= 4) return NextResponse.json({error:'Server busy. Please retry shortly.'}, {status:429});
  if (request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) return NextResponse.json({error:'Cross-origin request rejected.'}, {status:403});
  active++;
  try {
    // Bound actual streamed bytes, not just the untrusted Content-Length header.
    const reader = request.body?.getReader();
    if (!reader) return NextResponse.json({error:'Request body required.'}, {status:400});
    const decoder = new TextDecoder(); let raw = ''; let size = 0;
    while (true) {
      const {done, value} = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 64000) { await reader.cancel(); return NextResponse.json({error:'Request too large.'}, {status:413}); }
      raw += decoder.decode(value, {stream:true});
    }
    raw += decoder.decode();
    let body: unknown;
    try { body = JSON.parse(raw); } catch { return NextResponse.json({error:'Invalid JSON.'}, {status:400}); }
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({error:'Invalid request. Check profile values and message length.'}, {status:400});
    return NextResponse.json(await chat(parsed.data), {headers:{'Cache-Control':'no-store'}});
  } catch {
    return NextResponse.json({error:'The live assistant is unavailable. Please retry. Your profile has not been saved on the server.'}, {status:502});
  } finally { active--; }
}