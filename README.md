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

- `app/page.tsx`: responsive multilingual conversation, profile editor, result cards, voice and read-aloud.
- `app/api/chat/route.ts`: bounded JSON requests, schema validation, same-origin checks, concurrency limit and no-store responses.
- `lib/chat.ts`: fresh, request-scoped Cline agent, five domain tools, timeout and clearly separated demo path.
- `lib/eligibility.ts`: deterministic rule evaluation, unknown-field tracking, ranking and explanations.
- `data/schemes.json`: limited curated catalog, official links, required documents and application guidance.
- `tests/`: reproducible rule and request tests.

## Trust, privacy and limitations

- This is a **prototype**, not a government service or official eligibility determination. The initial catalog is deliberately smaller than the brief's target of ~30 schemes. All current rules have partial coverage; exclusions, household checks and official determinations are not fully modeled.
- `last_verified: null` means the scheme has not completed a full policy audit. Official source links are supplied for verification. Ranking is modeled-rule completeness, **not** an approval probability.
- Profile and bounded chat history travel with each request; there is no application database or cross-user server session. Refresh/reset discards client state. Live requests send conversation/profile data to the configured Cline provider. Do not enter identity numbers, bank details, OTPs or document images.
- Browser speech recognition is feature-detected, requires browser support/permission and may send audio to a browser vendor. Text entry remains available. Voice support depends on device language voices; scheme descriptions/rule explanations are currently English.
- A web manifest is included. Offline functionality/service worker and a full installability audit are **not** implemented.
- Live LLM behavior requires credentials and must be manually acceptance-tested. The automated suite does not make paid model calls.
- Before public deployment: add authentication, distributed rate limiting and spend controls, privacy/consent review, policy-data review, provider retention review, deployment-origin configuration and dependency remediation. Current concurrency control is per process, not distributed protection.
- Dependency audit during implementation reported transitive SDK-chain advisories. Do not treat this build as production security-approved; run `npm audit` and review upstream fixes before deployment. No blind overrides were applied.

## Demo flow

1. Choose English, Hindi or Telugu.
2. Enter and confirm age, state, yearly income in INR and occupation; add relevant optional facts.
3. Send a message. Inspect preliminary cards and the actual tool trace.
4. Open a card's official source and document/application checklist.
5. For live mode, configure the key and describe the profile naturally; verify extracted facts before acting on results.