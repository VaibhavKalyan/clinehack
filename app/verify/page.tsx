'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

type State = 'checking' | 'done' | 'error';

function Mark() {
  return (
    <span className="brand-symbol" aria-hidden="true">
      <svg viewBox="0 0 30 34" fill="none">
        <path d="M5 30V4h20v26M11 30V9l14-5" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="20" cy="18" r="1.6" fill="#e7b260" />
      </svg>
    </span>
  );
}

export default function VerifyPage() {
  const [state, setState] = useState<State>('checking');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const didFetch = useRef(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token') ?? '';
    if (!token) {
      setState('error');
      setError('This verification link is missing its code.');
      return;
    }
    if (didFetch.current) return;
    didFetch.current = true;

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data: unknown = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok) {
          const message = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
            ? data.error
            : 'Verification failed. Please request a new link.';
          setState('error');
          setError(message);
          return;
        }
        setEmail((data as { email?: string })?.email ?? '');
        setState('done');
      } catch {
        if (!cancelled) {
          setState('error');
          setError('Could not reach the server. Please check your connection and try again.');
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="auth-screen">
      <div className="auth-card verify-card">
        <Link href="/" className="brand" aria-label="Knock home">
          <Mark />
          knock<span className="brand-dot">.</span>
        </Link>

        {state === 'checking' && (
          <div className="verify-state">
            <span className="verify-spinner" aria-hidden="true" />
            <h1 className="auth-title">Verifying your email…</h1>
            <p className="auth-sub">One moment while we confirm your address.</p>
          </div>
        )}

        {state === 'done' && (
          <div className="verify-state">
            <span className="verify-badge ok" aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg>
            </span>
            <h1 className="auth-title">Email verified</h1>
            <p className="auth-sub">
              {email ? <>Your address <strong>{email}</strong> is confirmed.</> : 'Your email address is confirmed.'}
              {' '}You can now sign in to Knock.
            </p>
            <Link href="/" className="auth-submit link-button">Continue to sign in →</Link>
          </div>
        )}

        {state === 'error' && (
          <div className="verify-state">
            <span className="verify-badge bad" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v5M12 16h.01" /><circle cx="12" cy="12" r="9" /></svg>
            </span>
            <h1 className="auth-title">Link not valid</h1>
            <p className="auth-sub">{error}</p>
            <Link href="/" className="auth-submit link-button">Request a new link →</Link>
          </div>
        )}

        <p className="auth-note">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 4v3" /></svg>
          Your details stay private and are never shared.
        </p>
      </div>
    </div>
  );
}
