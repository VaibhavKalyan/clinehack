# Knock — welfare navigation, with a human in control

A Next.js / TypeScript prototype implementing the architecture in `mdfile.md`. Cline is used both to build the app and, with credentials, as the runtime conversation agent. Eligibility screening is deterministic TypeScript, not model-generated decisions.

## Run locally

Requires Node 22+.

```sh
cd /home/capsicle/clinehack
npm install
cp .env.example .env.local
npm run dev
```

Open localhost port 3000. With no `CLINE_API_KEY`, the app is an explicitly labeled demo: fill in the profile form, then send a message to run screening. Demo mode does **not** extract facts from free-form messages. With a Cline API key in `.env.local`, restart the server for live extraction and multilingual conversation. `CLINE_MODEL` is configurable; provider availability and billing depend on your account.

## Efficient development pipeline

```sh
npm run validate:data  # required fields, rules, sources and verification freshness
npm test              # deterministic boundary cases and API validation/demo tests
npm run typecheck
npm run build
# all of the above:
npm run check
```

Independent UI and rules/data work use a shared contract in `lib/contracts.ts`. The backend connects those contracts to five restricted Cline tools: `update_profile`, `get_missing_fields`, `match_schemes`, `get_scheme_details`, and `missing_docs_help`. No shell or filesystem tools are exposed to the runtime agent. Result cards are always recomputed from the rules engine, never parsed from model prose.

## Architecture

- `app/page.tsx`: responsive multilingual conversation, profile editor, result cards, voice and read-aloud, auto-location, account chip and profile strip.
- `app/api/chat/route.ts`: bounded JSON requests, schema validation, same-origin checks, concurrency limit and no-store responses.
- `app/api/auth/*` + `app/api/profile`: sign-up/sign-in/sign-out/session and profile sync. Sessions are random 256-bit tokens in httpOnly cookies; passwords are scrypt-hashed; per-process throttling; same-origin and bounded bodies on every route.
- `app/api/applications` + `app/api/account` + `app/api/auth/password`: per-account scheme tracking (Saved/Applied, validated against the catalog), display-name update, and password change with re-authentication — a password change signs out all other sessions.
- `lib/db.ts`: account database on Node's built-in SQLite (`node:sqlite`, zero external services). Stores accounts (email + scrypt hash + name) and each account's profile + language. Conversation text is never stored. Data lives in the gitignored `.data/` directory.
- `app/api/location/route.ts`: bounded reverse-geocoding/IP proxy for auto-location (validated coordinates, timeouts, no logging of coordinates or IPs).
- `lib/chat.ts`: fresh, request-scoped Cline agent, five domain tools, timeout and clearly separated demo path. Live replies are normalised to clean plain text (`lib/text.ts`) for the chat bubble and read-aloud — no markdown, headings or emoji — and the prompt forbids echoing profile details or duplicating the scheme cards.
- `lib/eligibility.ts`: deterministic rule evaluation, unknown-field tracking, ranking and explanations.
- `lib/i18n.ts`: typed, data-driven UI strings. English is the complete base; the other seven languages fall back to English for any missing key. Add a language by adding one code and one dictionary.
- `lib/tts.ts`: enhanced browser text-to-speech — async voice loading, best-voice selection per locale, rate control, play/stop. Provider-agnostic seam so a cloud TTS can be added later.
- `lib/location.ts`: geolocation → state/district with IP and offline nearest-state fallbacks; the user always confirms before it is applied.
- `lib/storage.ts`: only non-personal device preferences (language, voice, speed) in `localStorage`. Profiles sync to your account server-side — no JSON files, no manual export/import.
- `data/schemes.json`: curated catalog of 31 central and state schemes — national scholarships (NSP), PM YASASVI, INSPIRE, state scholarship portals (UP, Telangana, Karnataka, Maharashtra), NSAP pensions, plus farmer, worker, health and housing schemes. Official links only, required documents and application guidance.
- `public/sw.js` + `app/manifest.ts`: offline app shell and PWA installability (maskable icon, shortcuts).
- `tests/`: reproducible rule, request and feature tests.

## Trust, privacy and limitations

- This is a **prototype**, not a government service or official eligibility determination. The catalog now covers 31 central and state schemes, but it is still far from exhaustive — many states have their own portals, and new schemes launch each year. All current rules have partial coverage; exclusions, household checks and official determinations are not fully modeled.
- `last_verified: null` means the scheme has not completed a full policy audit. Official source links are supplied for verification. Ranking is modeled-rule completeness, **not** an approval probability.
- Accounts store email, a scrypt password hash, your display name and the profile/language you save — in a local SQLite file (`.data/`, gitignored). **Conversation text and chat history are never stored on the server.** Matching requests carry the profile and a bounded history only. Live mode still sends conversation/profile data to the configured Cline provider. Do not enter identity numbers, bank details, OTPs or document images.
- Browser speech recognition is feature-detected, requires browser support/permission and may send audio to a browser vendor. Text entry remains available. Read-aloud uses an enhanced browser TTS layer (`lib/tts.ts`) with best-voice selection and rate control, but voice quality still depends on the voices installed on the device; some languages may fall back to a default voice (a hint is shown). Scheme descriptions and rule explanations are currently English.
- Auto-location uses the browser Geolocation API, then a reverse-geocoding/IP proxy (`app/api/location`). Precise coordinates are sent only to that same-origin proxy and are never stored or logged. IP-based lookup is approximate and the result is always shown for you to confirm or edit. If you decline, state/district can be entered manually.
- Your profile, language and preferences auto-sync to your account whenever you are signed in — there are no save buttons and no JSON export/import. "Explore without an account" keeps everything in the current session only. Non-personal voice preferences also cache in this browser's `localStorage`.
- A web manifest and offline service worker are included (`public/sw.js`), which precache the app shell and never cache `/api/` responses (those can contain personal data). This is a best-effort offline shell, not full offline functionality, and a complete installability audit is still recommended before release.
- Live LLM behavior requires credentials and must be manually acceptance-tested. The automated suite does not make paid model calls.
- Before public deployment: add authentication, distributed rate limiting and spend controls, privacy/consent review, policy-data review, provider retention review, deployment-origin configuration and dependency remediation. Current concurrency control is per process, not distributed protection.
- Dependency audit during implementation reported transitive SDK-chain advisories. Do not treat this build as production security-approved; run `npm audit` and review upstream fixes before deployment. No blind overrides were applied.

## Demo flow

1. Create an account (name, email, password) or choose **Explore without an account**; pick your language right on the sign-in screen.
2. Your avatar appears top-right — tap it for your account menu (sync status, install app, sign out); the sidebar greets you by name and shows sync state.
3. Tap **Detect my location** to pre-fill your state and district (confirm the chip), or enter age, state, district, income and occupation manually.
4. Send a message. Inspect preliminary cards and the actual tool trace. Use **Read aloud** (with voice + speed controls) to hear responses.
5. On any card, **Save for later** or **Mark as applied** — the Saved and Applied tabs track them on your account, and the account menu shows the counts.
6. Open a card's official source and document/application checklist. Profile edits auto-save to your account — no buttons, no files.
7. **Account settings** (avatar menu) lets you update your display name and change your password; a password change signs out other devices.
8. For live mode, configure the key and describe the profile naturally; verify extracted facts before acting on results.