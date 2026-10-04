// Email delivery via Nodemailer (Node.js SMTP transport).
//
// Configuration (set in .env or .env.local):
//   SMTP_HOST      e.g. smtp.gmail.com
//   SMTP_PORT      e.g. 587  (STARTTLS) or 465 (TLS)
//   SMTP_USER      your Gmail address
//   SMTP_PASS      a 16-char Gmail App Password (NOT your real password)
//   SMTP_FROM      display name + address, e.g. "Knock <you@gmail.com>"
//   PUBLIC_APP_URL base URL for the verification link, e.g. http://localhost:3000
//
// If any SMTP variable is missing the transporter is skipped and the raw link is
// surfaced in the server console + (outside production) returned as devLink so the
// UI can show a dev-only "click to verify" button. This means the app still works
// during local development without any email credentials.
//
// Privacy: recipient addresses are never logged in full (only a redacted form) and
// passwords / API keys are never logged.

import nodemailer from 'nodemailer';

export interface VerificationEmail {
  /** True only when a real provider accepted the message. */
  delivered: boolean;
  /** Non-production only: link a tester can open to verify. Null in production. */
  devLink: string | null;
}

function appBaseUrl(): string {
  return process.env.PUBLIC_APP_URL || 'http://localhost:3000';
}

export function verificationLink(rawToken: string): string {
  return `${appBaseUrl()}/verify?token=${encodeURIComponent(rawToken)}`;
}

/** Redact an address for logs: "asha@example.com" → "a***@example.com". */
export function redactEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 0) return '***';
  const name = email.slice(0, at);
  const domain = email.slice(at);
  return `${name[0]}***${domain}`;
}

/** Build a Nodemailer transporter from env vars. Returns null if unconfigured. */
function buildTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT ?? 587);
  // Gmail App Passwords are displayed with spaces ("abcd efgh ijkl mnop") but
  // must be sent without them to the SMTP server.
  const cleanPass = pass.replace(/\s/g, '');
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465 (TLS), false for 587 (STARTTLS)
    auth: { user, pass: cleanPass },
  });
}

/** HTML email body for the verification message. */
function buildHtml(link: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Verify your Knock email</title>
  <style>
    body { margin:0; padding:0; background:#0d0d0d; font-family: system-ui, -apple-system, sans-serif; color:#e8e8e8; }
    .wrapper { max-width:520px; margin:40px auto; background:#161616; border-radius:16px; overflow:hidden; border:1px solid #2a2a2a; }
    .header { background:#1a1a1a; padding:28px 36px 24px; border-bottom:1px solid #242424; }
    .brand { font-size:22px; font-weight:700; color:#e8e8e8; letter-spacing:-0.5px; }
    .brand-dot { color:#e7b260; }
    .body { padding:32px 36px; }
    h1 { margin:0 0 12px; font-size:20px; font-weight:600; color:#f0f0f0; }
    p { margin:0 0 20px; font-size:15px; line-height:1.6; color:#aaa; }
    .button { display:inline-block; background:#e7b260; color:#111; font-weight:600; font-size:15px; padding:14px 28px; border-radius:10px; text-decoration:none; letter-spacing:0.01em; }
    .link-fallback { margin-top:24px; font-size:13px; color:#666; word-break:break-all; }
    .link-fallback a { color:#888; }
    .footer { padding:20px 36px; border-top:1px solid #242424; font-size:12px; color:#555; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <span class="brand">knock<span class="brand-dot">.</span></span>
    </div>
    <div class="body">
      <h1>Verify your email address</h1>
      <p>Click the button below to confirm your address and activate your Knock account. This link expires in 24 hours.</p>
      <a class="button" href="${link}">Verify my email →</a>
      <p class="link-fallback">If the button doesn't work, copy and paste this link:<br/><a href="${link}">${link}</a></p>
    </div>
    <div class="footer">
      This message was sent because someone created a Knock account with your address. If that wasn't you, you can safely ignore this email.
    </div>
  </div>
</body>
</html>`;
}

export async function sendVerificationEmail(email: string, rawToken: string): Promise<VerificationEmail> {
  const link = verificationLink(rawToken);
  const isProd = process.env.NODE_ENV === 'production';
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'Knock <noreply@knock.app>';

  // Always log a redacted hint to the server console (never the full address or token).
  // eslint-disable-next-line no-console
  console.log(`[email] sending verification to ${redactEmail(email)}`);

  const transporter = buildTransporter();

  if (!transporter) {
    // No SMTP configured — surface the raw link in the console for dev convenience.
    // eslint-disable-next-line no-console
    console.warn(`[email] SMTP not configured. Verification link for ${redactEmail(email)}: ${link}`);
    return { delivered: false, devLink: isProd ? null : link };
  }

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: 'Verify your Knock email address',
      text: `Verify your email address\n\nClick the link below to confirm your address and activate your Knock account (expires in 24 hours):\n\n${link}\n\nIf you didn't create a Knock account you can safely ignore this email.`,
      html: buildHtml(link),
    });
    // eslint-disable-next-line no-console
    console.log(`[email] delivered to ${redactEmail(email)}`);
    return { delivered: true, devLink: isProd ? null : link };
  } catch (err) {
    // Delivery failed — fall back to the dev link so the app remains usable.
    const message = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.error(`[email] delivery failed for ${redactEmail(email)}: ${message}`);
    return { delivered: false, devLink: isProd ? null : link };
  }
}
