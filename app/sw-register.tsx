'use client';

import { useEffect } from 'react';

/** Registers the offline service worker after the page loads. */
export default function SwRegister() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    const register = () => { void navigator.serviceWorker.register('/sw.js').catch(() => { /* offline support is optional */ }); };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }, []);
  return null;
}