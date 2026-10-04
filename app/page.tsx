'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChatResponse, Language, LocationInfo, Match, Profile, ToolTrace } from '@/lib/contracts';
import { getLabels, LANGUAGES } from '@/lib/i18n';
import { detectLocation, STATES } from '@/lib/location';
import { loadPrefs, savePrefs } from '@/lib/storage';

type SessionUser = { id: number; name: string; email: string };

type Message = { role: 'user' | 'assistant'; content: string };
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

/** Small inline string picker for a handful of micro-labels, English fallback. */
function tri(language: Language, en: string, hi: string, te: string): string {
  return language === 'hi' ? hi : language === 'te' ? te : en;
}

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>,
    mic: <><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/></>,
    leaf: <><path d="M20 4C8 2 2 8 6 16s17 2 14-12Z"/><path d="m5 21 10-12"/></>,
    chat: <path d="M20 11a8 8 0 0 1-8 8H4l1-5a8 8 0 1 1 15-3Z"/>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 4v3"/></>,
    refresh: <><path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5"/></>,
    sound: <><path d="m11 4-6 5H2v6h3l6 5V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></>,
    external: <><path d="M14 3h7v7m0-7L10 14M10 3H4v17h17v-6"/></>,
    spark: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    user: <><circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3"/></>,
    pin: <><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 21h16"/></>,
    upload: <><path d="M12 21V9m-5 5 5-5 5 5M4 3h16"/></>,
    save: <><path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8V3M8 21v-6h8v6"/></>,
    bookmark: <path d="M6 3h12v18l-6-4-6 4z"/>,
    plus: <path d="M12 5v14M5 12h14"/>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    shield: <><path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
    eyeoff: <><path d="M3 3l18 18M10.6 5.2A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.8A16.6 16.6 0 0 0 2 12s3.5 7 10 7c1.6 0 3-.4 4.3-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.spark}</svg>;
}

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const t = getLabels(language);
  const [profile, setProfile] = useState<Profile>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [trace, setTrace] = useState<ToolTrace[]>([]);
  const [mode, setMode] = useState<'demo' | 'live'>('demo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHow, setShowHow] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searched, setSearched] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locInfo, setLocInfo] = useState<LocationInfo | null>(null);
  // Account & auth
  const [authUser, setAuthUser] = useState<SessionUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authView, setAuthView] = useState<'signin' | 'signup' | 'verify'>('signin');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [guest, setGuest] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  // Scheme tracking + account settings
  const [appliedList, setAppliedList] = useState<Record<string, 'saved' | 'applied'>>({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsName, setSettingsName] = useState('');
  const [settingsCurrentPassword, setSettingsCurrentPassword] = useState('');
  const [settingsNewPassword, setSettingsNewPassword] = useState('');
  const [settingsNote, setSettingsNote] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [installable, setInstallable] = useState(false);
  // Email-verification hand-off (after sign-up or a blocked sign-in).
  const [pendingEmail, setPendingEmail] = useState('');
  const [verifyNote, setVerifyNote] = useState('');
  const [resendBusy, setResendBusy] = useState(false);

  const request = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const installEvent = useRef<InstallPromptEvent | null>(null);
  const hydrated = useRef(false);

  // Restore account (if signed in) and non-personal device preferences.
  async function loadAccount() {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json() as { profile?: Profile; language?: Language };
        if (data.profile) setProfile(data.profile);
        if (data.language && LANGUAGES.some(l => l.code === data.language)) setLanguage(data.language);
      }
      const apps = await fetch('/api/applications');
      if (apps.ok) {
        const data = await apps.json() as { applications: Array<{ schemeId: string; status: 'saved' | 'applied' }> };
        const map: Record<string, 'saved' | 'applied'> = {};
        for (const a of data.applications) map[a.schemeId] = a.status;
        setAppliedList(map);
      }
    } catch { /* offline: keep local state */ }
    finally { hydrated.current = true; }
  }

  useEffect(() => {
    const prefs = loadPrefs();
    if (prefs.language && LANGUAGES.some(l => l.code === prefs.language)) setLanguage(prefs.language);
    // Session check: are we already signed in?
    void (async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json() as { user: SessionUser | null };
        if (data?.user) { setAuthUser(data.user); await loadAccount(); }
      } catch { /* offline */ }
      finally { setAuthReady(true); }
    })();
    const onInstall = (e: Event) => { e.preventDefault(); installEvent.current = e as InstallPromptEvent; setInstallable(true); };
    window.addEventListener('beforeinstallprompt', onInstall);
    return () => {
      request.current?.abort();
      window.removeEventListener('beforeinstallprompt', onInstall);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { document.documentElement.lang = language; savePrefs({ language }); }, [language]);
  useEffect(() => { if (messages.length || loading) bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [messages, loading]);

  // Auto-save: every profile/language change syncs to the signed-in account.
  // No save buttons, no files — it just stays in sync.
  useEffect(() => {
    if (!authUser || !hydrated.current) return;
    setSaveState('saving');
    const timer = setTimeout(() => {
      void fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, language }),
      })
        .then(res => { if (res.ok) setSaveState('saved'); else setSaveState('idle'); })
        .catch(() => setSaveState('idle'));
    }, 700);
    return () => clearTimeout(timer);
  }, [profile, language, authUser]);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile(p => ({ ...p, [key]: value }));
    if (searched) { setSearched(false); setMatches([]); setTrace([]); setFilter('all'); }
  }

  async function send(value = text) {
    if (!value.trim() || loading) return;
    setError(''); setLoading(true);
    const prior = messages;
    setMessages(m => [...m, { role: 'user', content: value }]);
    setText('');
    const controller = new AbortController();
    request.current = controller;
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: value, language, profile, history: prior.slice(-12) }), signal: controller.signal });
      const payload: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const apiMessage = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string' ? payload.error : t.error;
        throw new Error(apiMessage);
      }
      const data = payload as ChatResponse;
      if (!data || typeof data.reply !== 'string' || !Array.isArray(data.matches) || !data.profile || !Array.isArray(data.trace)) throw new Error(t.error);
      setProfile(data.profile); setMatches(data.matches); setTrace(data.trace); setMode(data.mode); setSearched(true);
      setMessages(m => [...m, { role: 'assistant', content: data.reply }]);
    }
    catch (cause) { if (!controller.signal.aborted) { setError(cause instanceof Error ? cause.message : t.error); setText(value); } }
    finally { if (!controller.signal.aborted) setLoading(false); }
  }

  function reset() {
    request.current?.abort();
    setProfile({}); setMessages([]); setMatches([]); setTrace([]); setText(''); setError('');
    setLoading(false); setSearched(false); setMode('demo'); setFilter('all'); setLocInfo(null);
  }

  async function locate() {
    setLocating(true); setError(''); setLocInfo(null);
    try {
      const info = await detectLocation();
      if (info.state) {
        setLocInfo(info);
      } else {
        setError(t.locFailed);
      }
    } catch {
      setError(t.locFailed);
    } finally {
      setLocating(false);
    }
  }

  function useDetected() {
    if (!locInfo?.state) return;
    update('state', locInfo.state);
    if (locInfo.district) update('district', locInfo.district);
    setLocInfo(null);
  }

  async function submitAuth(mode: 'signin' | 'signup') {
    if (authBusy) return;
    setAuthBusy(true); setAuthError(''); setVerifyNote('');
    try {
      const endpoint = mode === 'signup' ? '/api/auth/register' : '/api/auth/login';
      const payload = mode === 'signup'
        ? { name: authName, email: authEmail, password: authPassword }
        : { email: authEmail, password: authPassword };
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data: unknown = await res.json().catch(() => null);
      const obj = data && typeof data === 'object' ? data as Record<string, unknown> : {};
      const message = typeof obj.error === 'string' ? obj.error : null;

      if (mode === 'signup') {
        // Registration always returns 200 + verification_required (no session yet).
        if (!res.ok) throw new Error(message ?? t.authError);
        setPendingEmail(authEmail.trim().toLowerCase());
        setAuthView('verify');
        setAuthPassword('');
        return;
      }

      if (!res.ok) {
        // Correct password but unverified address → hand off to the verify screen.
        if (obj.needsVerification === true) {
          setPendingEmail(authEmail.trim().toLowerCase());
          setVerifyNote(tri(language, 'Please verify your email to continue.', 'जारी रखने के लिए अपना ईमेल सत्यापित करें।', 'కొనసాగించడానికి మీ ఇమెయిల్‌ను ధృవీకరించండి.'));
          setAuthView('verify');
          setAuthPassword('');
          return;
        }
        throw new Error(message ?? t.authError);
      }
      const body = data as { user: SessionUser };
      if (!body?.user) throw new Error(t.authError);
      setAuthUser(body.user);
      setAuthPassword('');
      await loadAccount();
    }
    catch (cause) { setAuthError(cause instanceof Error ? cause.message : t.authError); }
    finally { setAuthBusy(false); }
  }

  async function resendVerification() {
    if (resendBusy || !pendingEmail) return;
    setResendBusy(true); setAuthError(''); setVerifyNote('');
    try {
      const res = await fetch('/api/auth/resend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: pendingEmail }) });
      const data: unknown = await res.json().catch(() => null);
      const obj = data && typeof data === 'object' ? data as Record<string, unknown> : {};
      if (!res.ok) throw new Error(typeof obj.error === 'string' ? obj.error : t.authError);
      setVerifyNote(tri(language, 'A new verification link is on its way.', 'एक नया सत्यापन लिंक भेजा गया है।', 'కొత్త ధృవీకరణ లింక్ పంపబడింది.'));
    }
    catch (cause) { setAuthError(cause instanceof Error ? cause.message : t.authError); }
    finally { setResendBusy(false); }
  }

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setMenuOpen(false); setAuthUser(null); setGuest(false);
    hydrated.current = false;
    setProfile({}); setMatches([]); setTrace([]); setMessages([]); setText('');
    setSearched(false); setSaveState('idle'); setError(''); setFilter('all');
    setAppliedList({}); setSettingsOpen(false);
    setAuthView('signin'); setAuthError(''); setVerifyNote('');
  }

  /** Track a scheme as saved/applied on the account; toggles off if already set. */
  async function toggleSchemeStatus(schemeId: string, status: 'saved' | 'applied') {
    if (!authUser) return;
    const turningOff = appliedList[schemeId] === status;
    const previous = appliedList;
    setAppliedList(cur => {
      const next = { ...cur };
      if (turningOff) delete next[schemeId];
      else next[schemeId] = status;
      return next;
    });
    try {
      const res = turningOff
        ? await fetch(`/api/applications?schemeId=${encodeURIComponent(schemeId)}`, { method: 'DELETE' })
        : await fetch('/api/applications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ schemeId, status }) });
      if (!res.ok) throw new Error();
    } catch {
      setAppliedList(previous); // roll back the optimistic update
      setError(t.error);
    }
  }

  async function updateName() {
    if (!authUser || !settingsName.trim() || settingsBusy) return;
    setSettingsBusy(true); setSettingsError(''); setSettingsNote('');
    try {
      const res = await fetch('/api/account', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: settingsName.trim() }) });
      const data: unknown = await res.json().catch(() => null);
      const message = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string' ? data.error : null;
      if (!res.ok) throw new Error(message ?? t.authError);
      setAuthUser({ ...authUser, name: settingsName.trim() });
      setSettingsNote(t.nameUpdated);
    }
    catch (cause) { setSettingsError(cause instanceof Error ? cause.message : t.authError); }
    finally { setSettingsBusy(false); }
  }

  async function changePassword() {
    if (!authUser || settingsBusy) return;
    setSettingsBusy(true); setSettingsError(''); setSettingsNote('');
    try {
      const res = await fetch('/api/auth/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: settingsCurrentPassword, newPassword: settingsNewPassword }) });
      const data: unknown = await res.json().catch(() => null);
      const message = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string' ? data.error : null;
      if (!res.ok) throw new Error(message ?? t.authError);
      setSettingsCurrentPassword(''); setSettingsNewPassword('');
      setSettingsNote(t.passwordUpdated);
    }
    catch (cause) { setSettingsError(cause instanceof Error ? cause.message : t.authError); }
    finally { setSettingsBusy(false); }
  }

  async function installApp() {
    const evt = installEvent.current;
    if (!evt) return;
    await evt.prompt();
    await evt.userChoice;
    installEvent.current = null;
    setInstallable(false);
  }

  const complete = ['age', 'state', 'annualIncome', 'occupation'].filter(k => profile[k as keyof Profile] !== undefined && profile[k as keyof Profile] !== '').length;
  const savedCount = Object.values(appliedList).filter(s => s === 'saved').length;
  const appliedCount = Object.values(appliedList).length - savedCount;
  const shown = matches.filter(m => filter === 'all' ? m.status !== 'not_eligible'
    : filter === 'not' ? m.status === 'not_eligible'
    : filter === 'saved' ? appliedList[m.scheme.id] === 'saved'
    : appliedList[m.scheme.id] === 'applied');
  const fieldName = (key: keyof Profile) => ({ age: t.age, state: t.state, district: t.district, annualIncome: t.income, occupation: t.occupation, gender: t.gender, category: t.category, isStudent: t.student, ownsLand: t.land, hasDisability: t.disability }[key]);
  const firstName = authUser?.name.trim().split(/\s+/)[0] ?? '';
  const initials = (authUser?.name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('') ?? '').toUpperCase();

  // Sign-up validation (advisory in the UI; the server enforces the real rules).
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(authEmail.trim());
  const passwordStrength = (() => {
    const p = authPassword;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return Math.min(score, 4);
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength];
  const canSubmit = authView === 'signup'
    ? (authName.trim().length > 0 && emailValid && authPassword.length >= 8)
    : (emailValid && authPassword.length >= 1);

  const brand = <a className="brand" href="/" aria-label="Knock home"><span className="brand-symbol"><svg viewBox="0 0 30 34" fill="none"><path d="M5 30V4h20v26M11 30V9l14-5" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/><circle cx="20" cy="18" r="1.6" fill="#e7b260"/></svg></span>knock<span className="brand-dot">.</span></a>;

  // Session check still running: quiet splash, no layout shift.
  if (!authReady) return <div className="auth-screen"><div className="auth-splash">{brand}<span className="auth-splash-dot">✳</span></div></div>;

  // Not signed in: a proper sign-in / create-account screen.
  if (!authUser && !guest) return (
    <div className="auth-screen">
      <div className="auth-shell">
        <aside className="auth-aside">
          {brand}
          <h1 className="auth-aside-title">{t.title}<br/><em>{t.title2}</em></h1>
          <p className="auth-aside-sub">{t.intro}</p>
          <ul className="auth-perks">
            <li><Icon name="check" size={16}/><span>{tri(language, 'Your profile and language stay in sync.', 'आपकी प्रोफ़ाइल और भाषा सिंक रहती है।', 'మీ ప్రొఫైల్ మరియు భాష సింక్‌లో ఉంటాయి.')}</span></li>
            <li><Icon name="check" size={16}/><span>{tri(language, 'Track schemes you save or apply to.', 'सहेजी या आवेदित योजनाओं को ट्रैक करें।', 'మీరు సేవ్ చేసిన పథకాలను ట్రాక్ చేయండి.')}</span></li>
            <li><Icon name="shield" size={16}/><span>{tri(language, 'Private by design — chat history is never stored.', 'डिज़ाइन से निजी — चैट इतिहास संग्रहीत नहीं।', 'డిజైన్ ప్రకారం గోప్యం — చాట్ చరిత్ర నిల్వ చేయబడదు.')}</span></li>
          </ul>
          <p className="auth-aside-foot"><Icon name="lock" size={13}/>{t.authTrust}</p>
        </aside>

        <div className="auth-panel">
          <div className="auth-panel-top">
            <div className="language-switch"><select className="language-select" value={language} onChange={e => setLanguage(e.target.value as Language)} aria-label="Language">{LANGUAGES.map(l => <option key={l.code} value={l.code} lang={l.code}>{l.native}</option>)}</select></div>
          </div>

          {authView !== 'verify' ? (
            <>
              <h1 className="auth-title">{authView === 'signin' ? t.authTitleSignIn : t.authTitleSignUp}</h1>
              <p className="auth-sub">{t.authSub}</p>
              <div className="auth-tabs" role="tablist">
                <button type="button" role="tab" aria-selected={authView === 'signin'} className={`auth-tab ${authView === 'signin' ? 'active' : ''}`} onClick={() => { setAuthView('signin'); setAuthError(''); }}>{t.signIn}</button>
                <button type="button" role="tab" aria-selected={authView === 'signup'} className={`auth-tab ${authView === 'signup' ? 'active' : ''}`} onClick={() => { setAuthView('signup'); setAuthError(''); }}>{t.signUp}</button>
              </div>
              <form className="auth-form" onSubmit={e => { e.preventDefault(); void submitAuth(authView === 'signup' ? 'signup' : 'signin'); }}>
                {authView === 'signup' && (
                  <label className="auth-field">{t.name}
                    <input value={authName} onChange={e => setAuthName(e.target.value)} autoComplete="name" required maxLength={60} placeholder="Asha"/>
                  </label>
                )}
                <label className="auth-field">{t.email}
                  <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} autoComplete="email" required placeholder="you@example.com"/>
                  {authEmail.trim() !== '' && !emailValid && <span className="field-hint warn">{tri(language, 'Enter a valid email address.', 'एक मान्य ईमेल दर्ज करें।', 'సరైన ఇమెయిల్ నమోదు చేయండి.')}</span>}
                </label>
                <label className="auth-field">{t.password}
                  <div className="password-wrap">
                    <input type={showPassword ? 'text' : 'password'} value={authPassword} onChange={e => setAuthPassword(e.target.value)} autoComplete={authView === 'signup' ? 'new-password' : 'current-password'} required minLength={authView === 'signup' ? 8 : 1} placeholder="••••••••"/>
                    <button type="button" className="password-toggle" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'}><Icon name={showPassword ? 'eyeoff' : 'eye'} size={16}/></button>
                  </div>
                  {authView === 'signup' && (
                    <div className="strength" aria-label={`Password strength: ${strengthLabel || 'none'}`}>
                      <div className="strength-track">{[1, 2, 3, 4].map(n => <span key={n} className={`strength-seg ${passwordStrength >= n ? `on s${passwordStrength}` : ''}`}/>)}</div>
                      {authPassword && <span className="strength-label">{strengthLabel}</span>}
                    </div>
                  )}
                </label>
                {authError && <p className="auth-error" role="alert">{authError}</p>}
                <button type="submit" className="auth-submit" disabled={authBusy || !canSubmit}>{authBusy ? t.saving : (authView === 'signin' ? t.signIn : t.signUp)}<Icon name="arrow" size={15}/></button>
              </form>
              <button type="button" className="auth-guest" onClick={() => setGuest(true)}>{t.continueGuest}<span aria-hidden="true">→</span></button>
            </>
          ) : (
            <div className="verify-panel">
              <span className="verify-badge" aria-hidden="true"><Icon name="mail" size={26}/></span>
              <h1 className="auth-title">{tri(language, 'Check your email', 'अपना ईमेल देखें', 'మీ ఇమెయిల్ చూడండి')}</h1>
              <p className="auth-sub">{tri(language, 'We sent a verification link to', 'हमने इस पर सत्यापन लिंक भेजा', 'మేము దీనికి ధృవీకరణ లింక్ పంపాము')}</p>
              <p className="verify-email">{pendingEmail}</p>
              {verifyNote && <p className="account-sync"><Icon name="check" size={12}/>{verifyNote}</p>}
              {authError && <p className="auth-error" role="alert">{authError}</p>}
              <button type="button" className="auth-submit" disabled={resendBusy} onClick={() => void resendVerification()}><Icon name="refresh" size={14}/>{resendBusy ? t.saving : tri(language, 'Resend email', 'ईमेल पुनः भेजें', 'ఇమెయిల్ మళ్లీ పంపండి')}</button>
              <button type="button" className="auth-guest" onClick={() => { setAuthView('signin'); setAuthError(''); setVerifyNote(''); }}>← {t.signIn}</button>
              <p className="auth-note"><Icon name="lock" size={12}/>{tri(language, 'Check your inbox and spam folder for the verification link.', 'अपने इनबॉक्स और स्पैम फ़ोल्डर में सत्यापन लिंक देखें।', 'ధృవీకరణ లింక్ కోసం మీ ఇన్‌బాక్స్ మరియు స్పామ్ ఫోల్డర్ తనిఖీ చేయండి.')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return <div className="app-shell">
    <header className="header">
      {brand}
      <div className="header-center"><span className="tiny-spark">✳</span> OPENING DOORS TO BETTER TOMORROWS</div>
      <div className="header-actions">
        <button className="how-button" onClick={() => setShowHow(!showHow)}>{t.how}<span>↗</span></button>
        <div className="language-switch" aria-label="Language">
          <select className="language-select" value={language} onChange={e => setLanguage(e.target.value as Language)} aria-label="Language">
            {LANGUAGES.map(l => <option key={l.code} value={l.code} lang={l.code}>{l.native}</option>)}
          </select>
        </div>
        {authUser ? (
          <div className="account-wrap">
            <button type="button" className="account-chip" onClick={() => setMenuOpen(o => !o)} aria-haspopup="menu" aria-expanded={menuOpen}>
              <span className="avatar" aria-hidden="true">{initials}</span>
              <span className="account-name">{firstName}</span>
              <span className="account-caret" aria-hidden="true">▾</span>
            </button>
            {menuOpen && <>
              <div className="menu-backdrop" onClick={() => setMenuOpen(false)}/>
              <div className="account-menu" role="menu">
                <div className="account-menu-head"><strong>{authUser.name}</strong><span>{authUser.email}</span></div>
                <div className="account-apps"><Icon name="bookmark" size={12}/>{t.saved}: {savedCount} · {t.applied}: {appliedCount}</div>
                {saveState !== 'idle' && <div className="account-sync"><Icon name="check" size={12}/>{saveState === 'saving' ? t.saving : t.synced}</div>}
                <button type="button" role="menuitem" className="menu-item" onClick={() => { setMenuOpen(false); setSettingsName(authUser.name); setSettingsOpen(true); }}><Icon name="user" size={14}/>{t.accountSettings}</button>
                {installable && <button type="button" role="menuitem" className="menu-item" onClick={() => void installApp()}><Icon name="download" size={14}/>{t.install}</button>}
                <button type="button" role="menuitem" className="menu-item danger" onClick={() => void signOut()}><Icon name="external" size={14}/>{t.signOut}</button>
              </div>
            </>}
          </div>
        ) : (
          <button type="button" className="account-chip" onClick={() => setGuest(false)}>
            <span className="avatar guest" aria-hidden="true">✳</span>
            <span className="account-name">{t.signIn}</span>
          </button>
        )}
      </div>
    </header>

    {showHow && <section className="how-panel"><button className="close-how" onClick={() => setShowHow(false)} aria-label="Close">×</button><h2>{t.how}</h2><div><p><b>01 · {t.profile}</b><br/>{t.profileSub}</p><p><b>02 · {t.results}</b><br/>{t.resultsSub}</p><p><b>03 · {t.steps}</b><br/>{t.warning}</p></div></section>}

    <div className="workspace">
      <aside className="sidebar">
        <div className="nav-selected"><Icon name="chat"/>{t.nav}<span className="small-dot"/></div>
        <div className="profile-heading"><span className="overline">MADE FOR YOU</span><h2>{t.profile}</h2><p>{t.profileSub}</p></div>
        <div className="completion"><div><span>{tri(language, 'The essentials', 'ज़रूरी जानकारी', 'ముఖ్య వివరాలు')}</span><span>{complete}/4</span></div><div className="progress-track"><span style={{ width: `${complete * 25}%` }}/></div></div>

        <div className={`account-strip ${authUser ? 'is-user' : 'is-guest'}`}>
          <span className="avatar big" aria-hidden="true">{authUser ? initials : '✳'}</span>
          <div className="account-meta">
            <strong>{authUser ? `${t.greeting}, ${firstName}` : t.guest}</strong>
            <span>{authUser
              ? (saveState === 'saving'
                ? <><Icon name="refresh" size={11}/>{t.saving}</>
                : <><Icon name="check" size={11}/>{t.synced}</>)
              : t.guestNote}</span>
          </div>
          {!authUser && <button type="button" className="strip-signin" onClick={() => setGuest(false)}>{t.signIn}</button>}
        </div>


        <form className="profile-form" onSubmit={e => { e.preventDefault(); void send(t.find); }}>
          <div className="form-row">
            <label>{t.age}<input type="number" min="0" max="120" placeholder="e.g. 28" value={profile.age ?? ''} disabled={loading} onChange={e => update('age', e.target.value === '' ? undefined : Number(e.target.value))}/></label>
            <label>{t.gender}<select disabled={loading} value={profile.gender ?? ''} onChange={e => update('gender', (e.target.value || undefined) as Profile['gender'])}><option value="">{t.any}</option><option value="female">{tri(language, 'Female', 'महिला', 'మహిళ')}</option><option value="male">{tri(language, 'Male', 'पुरुष', 'పురుషుడు')}</option><option value="other">{tri(language, 'Other', 'अन्य', 'ఇతర')}</option></select></label>
          </div>
          <div className="locate-row">
            <button type="button" className="locate-button" onClick={() => void locate()} disabled={loading || locating} title={t.locPrivacy}><Icon name="pin" size={15}/>{locating ? t.detecting : t.detect}</button>
          </div>
          {locInfo?.state && <div className="locate-chip"><Icon name="pin" size={14}/><span>{locInfo.district ? `${locInfo.district}, ${locInfo.state}` : locInfo.state}{(locInfo.source === 'ip' || locInfo.source === 'offline') && <small> · {t.locApprox}</small>}</span><button type="button" className="chip-use" onClick={useDetected}>{t.locUse}</button><button type="button" className="chip-dismiss" onClick={() => setLocInfo(null)}>{t.locManual}</button></div>}
          <label>{t.state}<select disabled={loading} value={profile.state ?? ''} onChange={e => update('state', e.target.value || undefined)}><option value="">{t.any}</option>{STATES.map(s => <option key={s}>{s}</option>)}</select></label>
          <label>{t.district}<input disabled={loading} placeholder="e.g. Hyderabad" value={profile.district ?? ''} onChange={e => update('district', e.target.value || undefined)}/></label>
          <label>{t.income}<div className="currency-input"><span>₹</span><input disabled={loading} type="number" min="0" step="1" placeholder="e.g. 1,20,000" value={profile.annualIncome ?? ''} onChange={e => update('annualIncome', e.target.value === '' ? undefined : Number(e.target.value))}/><span>/ year</span></div></label>
          <label>{t.occupation}<input disabled={loading} placeholder={tri(language, 'e.g. Farmer, student, daily worker', 'जैसे किसान, विद्यार्थी', 'ఉదా. రైతు, విద్యార్థి')} value={profile.occupation ?? ''} onChange={e => update('occupation', e.target.value || undefined)}/></label>
          <details className="optional"><summary>{t.optional}<span>+</span></summary>
            <label>{t.category}<select disabled={loading} value={profile.category ?? ''} onChange={e => update('category', e.target.value || undefined)}><option value="">{t.any}</option>{['General', 'OBC', 'SC', 'ST', 'EWS'].map(c => <option key={c}>{c}</option>)}</select></label>
            {(['isStudent', 'ownsLand', 'hasDisability'] as const).map(k => <label className="optional-select" key={k}>{fieldName(k)}<select disabled={loading} value={profile[k] === undefined ? '' : String(profile[k])} onChange={e => update(k, e.target.value === '' ? undefined : e.target.value === 'true')}><option value="">{t.any}</option><option value="true">{tri(language, 'Yes', 'हाँ', 'అవును')}</option><option value="false">{tri(language, 'No', 'नहीं', 'కాదు')}</option></select></label>)}
          </details>
          <button className="primary profile-submit" disabled={loading} type="submit">{t.find}<Icon name="arrow" size={17}/></button>
        </form>
        <p className="privacy"><Icon name="lock" size={15}/><span>{t.privacy}</span></p>
        <div className="sidebar-bottom"><div className="little-flower">✳</div><p>{tri(language, 'Support exists.', 'सहायता मौजूद है।', 'సహాయం ఉంది.')}<br/><strong>{tri(language, 'Let’s help you find it.', 'आइए इसे खोजने में मदद करें।', 'దీన్ని కనుగొనడంలో సహాయిద్దాం.')}</strong></p><button className="reset" onClick={reset}><Icon name="refresh" size={15}/>{t.reset}</button></div>
      </aside>

      <main className="main">
        <section className="hero">
          <div className="hero-copy"><div className="eyebrow"><span/>{t.eyebrow}</div><h1>{t.title}<br/><em>{t.title2}</em></h1><p>{t.intro}</p></div>
          <div className="door-art" aria-hidden="true"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><span className="art-star star-one">✳</span><span className="art-star star-two">✦</span><div className="door-shadow"/><div className="door-frame"><div className="door-light"/><div className="door-panel"><span/></div></div><div className="art-leaf leaf-one"/><div className="art-leaf leaf-two"/><div className="art-ground"/></div>
        </section>


        <section className="conversation" aria-label={t.nav}>
          <div className="conversation-top">
            <div className="assistant-identity"><span className="assistant-icon"><Icon name="spark" size={18}/></span><div><strong>Knock assistant</strong><span><i/> {tri(language, 'Here to help, in your language', 'आपकी भाषा में सहायता', 'మీ భాషలో సహాయం')}</span></div></div>
            <span className="mode-badge"><span/>{mode === 'demo' ? t.demo : 'Live · Cline'}</span>
          </div>
          <div className="message-area">
            <div className="welcome-message"><h3>{t.welcome} <span className="wave">✺</span></h3><p>{t.welcomeSub}</p></div>
            {messages.length === 0 && <div className="prompt-list">{t.prompts.map((p, i) => <button key={p} type="button" disabled={loading} onClick={() => setText(p)}><span className="prompt-icon"><Icon name={['leaf', 'spark', 'lock'][i]} size={16}/></span>{p}<span className="prompt-arrow">↗</span></button>)}<p className="demo-guidance">{tri(language, 'In demo mode, use the profile form for matching; messages are not used to infer personal details.', 'डेमो मोड में मिलान के लिए प्रोफ़ाइल फ़ॉर्म भरें; संदेश से निजी जानकारी नहीं निकाली जाती।', 'డెమో మోడ్‌లో సరిపోలిక కోసం ప్రొఫైల్ ఫారమ్‌ను వాడండి; సందేశం నుంచి వ్యక్తిగత వివరాలు తీసుకోబడవు.')}</p></div>}
            {messages.map((m, i) => <div className={`message ${m.role}`} key={i}><span className="message-label">{m.role === 'user' ? tri(language, 'YOU', 'आप', 'మీరు') : 'KNOCK'}</span><p>{m.content}</p></div>)}
            {loading && <div className="loading" role="status"><span/><span/><span/>{t.working}</div>}
            <div ref={bottom}/>
          </div>

          {trace.length > 0 && <details className="trace" open><summary><Icon name="spark" size={14}/>{t.trace}<span>{trace.length} steps</span></summary><ol>{trace.map((item, i) => <li key={i}><span className="trace-check"><Icon name="check" size={12}/></span><code>{item.tool}</code><span>{item.summary}</span></li>)}</ol></details>}

          <div className="composer-wrap">
            {error && <p role="alert" className="error">{error}</p>}
            <form className="composer" onSubmit={e => { e.preventDefault(); void send(); }}>
              <textarea rows={1} aria-label={t.ask} placeholder={t.ask} value={text} disabled={loading} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(); } }}/>
              <div className="composer-buttons">
                <button type="submit" className="send-button" disabled={loading || !text.trim()} aria-label={t.send}><Icon name="arrow" size={21}/></button>
              </div>
            </form>
            <div className="composer-note"><span>{tri(language, 'Your words. Your language. Your next step.', 'आपके शब्द। आपकी भाषा। आपका अगला कदम।', 'మీ మాటలు. మీ భాష. మీ తదుపరి అడుగు.')}</span><span>English · हिंदी · తెలుగు · தமிழ் · ಕನ್ನಡ</span></div>
          </div>
        </section>


        <section className="opportunities">
          <div className="section-heading"><div><span className="overline">A PATH FORWARD</span><h2>{t.results}{searched && <span className="count">{shown.length}</span>}</h2><p>{t.resultsSub}</p></div><span className="section-icon"><Icon name="leaf" size={25}/></span></div>
          {!searched
            ? <div className="empty-results"><div className="empty-icon"><Icon name="leaf" size={27}/></div><div><h3>{t.empty}</h3><p>{t.emptySub}</p></div><span className="empty-path" aria-hidden="true">···············<Icon name="arrow" size={19}/></span></div>
            : <>
                <div className="result-filters">
                  <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>{t.likely} ({matches.filter(m => m.status !== 'not_eligible').length})</button>
                  <button className={filter === 'not' ? 'active' : ''} onClick={() => setFilter('not')}>{t.not_eligible} ({matches.filter(m => m.status === 'not_eligible').length})</button>
                  {authUser && <button className={filter === 'saved' ? 'active' : ''} onClick={() => setFilter('saved')}>{t.saved} ({savedCount})</button>}
                  {authUser && <button className={filter === 'applied' ? 'active' : ''} onClick={() => setFilter('applied')}>{t.applied} ({appliedCount})</button>}
                </div>
                <div className="scheme-grid">
                  {shown.map(m => (
                    <article className="scheme-card" key={m.scheme.id}>
                      <div className="scheme-top"><span className={`status ${m.status}`}>{t[m.status]}</span><Icon name="leaf" size={18}/></div>
                      <h3>{m.scheme.name}</h3>
                      <p className="scheme-description">{m.scheme.description}</p>
                      <div className="benefit"><Icon name="spark" size={17}/><p>{m.scheme.benefit}</p></div>
                      <ul className="reasons">{m.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
                      {m.scheme.coverage === 'partial' && <p className="partial-note">{t.warning}</p>}
                      {m.missingFields.length > 0 && <p className="missing"><b>{t.missing}:</b> {m.missingFields.map(fieldName).join(', ')}</p>}
                      <details className="scheme-details"><summary>{t.documents} &amp; {t.steps}<span>+</span></summary><h4>{t.documents}</h4><ul>{m.scheme.documents.map((d, i) => <li key={i}>{d}</li>)}</ul><h4>{t.steps}</h4><ol>{m.scheme.steps.map((s, i) => <li key={i}>{s}</li>)}</ol></details>
                      {authUser && <div className="scheme-actions">
                        <button type="button" className={`scheme-action ${appliedList[m.scheme.id] === 'saved' ? 'on' : ''}`} onClick={() => void toggleSchemeStatus(m.scheme.id, 'saved')} aria-pressed={appliedList[m.scheme.id] === 'saved'}><Icon name="bookmark" size={13}/>{appliedList[m.scheme.id] === 'saved' ? t.saved : t.saveForLater}</button>
                        <button type="button" className={`scheme-action ${appliedList[m.scheme.id] === 'applied' ? 'on applied' : ''}`} onClick={() => void toggleSchemeStatus(m.scheme.id, 'applied')} aria-pressed={appliedList[m.scheme.id] === 'applied'}><Icon name="check" size={13}/>{appliedList[m.scheme.id] === 'applied' ? t.applied : t.markApplied}</button>
                      </div>}
                      <div className="scheme-footer">{/^https?:\/\//i.test(m.scheme.source_url) && <a href={m.scheme.source_url} target="_blank" rel="noopener noreferrer">{t.official}<Icon name="external" size={14}/></a>}<span>{t.verified}: {m.scheme.last_verified || t.unverified}</span></div>
                    </article>
                  ))}
                </div>
                {shown.length === 0 && <div className="empty-results"><Icon name="leaf"/><p>{filter === 'saved' ? t.savedEmpty : filter === 'applied' ? t.appliedEmpty : tri(language, 'No schemes in this view. Review your details or try the other filter.', 'इस दृश्य में कोई योजना नहीं। अपनी जानकारी जाँचें या दूसरा फ़िल्टर आज़माएं।', 'ఈ వీక్షణలో పథకాలు లేవు. మీ వివరాలు సరిచూడండి లేదా వేరే ఫిల్టర్ ప్రయత్నించండి.')}</p></div>}
              </>}
        </section>


        <footer className="main-footer">
          <span className="footer-mark"><Icon name="lock" size={14}/>{mode === 'demo' ? t.demoSub : 'Cline-powered guidance'}</span>
          <p>{t.warning}</p>
          <div><span>Built with care. For everyone.</span><span className="india-dots"><i/><i/><i/></span><span>knock.</span></div>
        </footer>

        {settingsOpen && authUser && (
          <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={t.accountSettings} onClick={e => { if (e.target === e.currentTarget) setSettingsOpen(false); }}>
            <div className="modal-card">
              <button type="button" className="modal-close" onClick={() => setSettingsOpen(false)} aria-label="Close">×</button>
              <h2 className="auth-title">{t.accountSettings}</h2>
              <p className="modal-identity">{authUser.name} · {authUser.email}</p>
              <label className="auth-field">{t.displayName}<input value={settingsName} onChange={e => setSettingsName(e.target.value)} maxLength={60}/></label>
              <button type="button" className="auth-submit" disabled={settingsBusy || !settingsName.trim()} onClick={() => void updateName()}><Icon name="user" size={14}/>{t.updateName}</button>
              <div className="modal-divider"/>
              <label className="auth-field">{t.currentPassword}<input type="password" value={settingsCurrentPassword} onChange={e => setSettingsCurrentPassword(e.target.value)} autoComplete="current-password"/></label>
              <label className="auth-field">{t.newPassword}<input type="password" value={settingsNewPassword} onChange={e => setSettingsNewPassword(e.target.value)} autoComplete="new-password" placeholder="••••••••"/></label>
              {settingsError && <p className="auth-error" role="alert">{settingsError}</p>}
              {settingsNote && <p className="account-sync"><Icon name="check" size={12}/>{settingsNote}</p>}
              <button type="button" className="auth-submit" disabled={settingsBusy || !settingsCurrentPassword || settingsNewPassword.length < 8} onClick={() => void changePassword()}><Icon name="lock" size={14}/>{t.updatePassword}</button>
            </div>
          </div>
        )}
      </main>
    </div>
  </div>;
}