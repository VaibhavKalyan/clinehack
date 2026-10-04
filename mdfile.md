Cline plays two roles here, and your PPT should show both clearly:

Build-time: Cline (IDE extension or CLI) writes, tests and debugs the code.
Run-time: the Cline SDK powers the agent inside the product.

Judges asked how Cline is "central", and the second role is the stronger answer. Cline is the product's brain as well as your dev tool.

1. System architecture
┌──────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js PWA, Tailwind)                        │
│  Mic (Web Speech API hi-IN/te-IN) → transcript (editable)│
│  Profile confirmation chips · Result cards · Read-aloud  │
└───────────────┬──────────────────────────────────────────┘
                │ POST /api/chat  (text + language + session)
                ▼
┌──────────────────────────────────────────────────────────┐
│  BACKEND (Node 22, Next.js API route)                    │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  CLINE SDK AGENT  (@cline/sdk)                     │  │
│  │  System prompt: "Welfare navigator. Reply in the   │  │
│  │  user's language. NEVER decide eligibility yourself│  │
│  │  — always call tools."                             │  │
│  │                                                    │  │
│  │  Custom tools (createTool):                        │  │
│  │   • update_profile(fields)  → session state        │  │
│  │   • get_missing_fields()    → next question        │  │
│  │   • match_schemes(profile)  → rules engine         │  │
│  │   • get_scheme_details(id)  → docs + steps + URL   │  │
│  │   • missing_docs_help(docs) → where to get them    │  │
│  └───────────────┬────────────────────────────────────┘  │
│                  ▼                                       │
│  ┌──────────────────────┐   ┌─────────────────────────┐  │
│  │ Eligibility engine   │◄──│ data/schemes.json (~30) │  │
│  │ (deterministic TS)   │   │ source_url, last_verified│ │
│  │ Eligible/Likely/Not  │   └─────────────────────────┘  │
│  │ + ranking score      │                                │
│  └──────────────────────┘                                │
└──────────────────────────────────────────────────────────┘
                │
                ▼
      Structured JSON → UI cards → speechSynthesis (TTS)

Why this is strong:

The SDK agent handles the multilingual conversation: extracting profile fields from one-breath Hinglish, deciding what to ask next, and explaining results.
Eligibility decisions live in code that the agent calls as a tool, which removes hallucinated eligibility, the biggest trust risk.
Tool calls give you a visible trace ("Agent called match_schemes → 7 results"), which makes a good demo and slide visual.
2. How Cline is used
A. Build-time (dev pipeline)
Stage	Cline usage
Planning	Plan mode to design folder structure, schema and API contracts before coding
Scaffolding	Act mode generates the Next.js app, voice component and i18n files
Rules	A .clinerules file with project conventions (TypeScript strict, "never put eligibility logic in prompts", schema location)
Data pipeline	Headless CLI (cline "...") validates schemes.json against a JSON schema and flags missing fields or stale last_verified dates
Testing	Cline writes unit tests for the eligibility engine (e.g. 40 profile → expected scheme cases) and loops until they pass
Debugging	Cline reads terminal output, fixes failing builds, and handles Web Speech API edge cases
Parallel work	Cline's team and multi-agent mode, or Kanban, for splitting UI, backend and data tasks
CI	Headless Cline reviews PR diffs: git diff origin/main | cline "review"
B. Run-time (product)
@cline/sdk is installed in the backend (it requires Node 22+).
Start with the Agent class plus custom tools via createTool. It's lightweight and you control the tools. @cline/agents is also browser-compatible.
Move to ClineCore only if you need session persistence, scheduling or multi-agent teams. For the MVP, keep sessions in memory.
Roadmap use of the SDK: scheduled deadline reminders and a WhatsApp or Telegram channel (Cline supports connect telegram/slack).

I confirmed the package structure and the Agent and createTool exports from the docs, but SDK APIs are new. Before finalizing slides, check the exact method signatures at docs.cline.bot/sdk. Installing the Cline SDK skill (npx skills add cline/sdk-skill) gives Cline itself the correct API context while it codes.

3. Tech stack (slide-ready)
Layer	Choice
Frontend	Next.js, Tailwind, PWA manifest
Voice in/out	Web Speech API (STT), speechSynthesis (TTS); fallback: Sarvam/Bhashini
Agent runtime	Cline SDK (@cline/sdk)
LLM	Claude via Cline's provider gateway (Cline isn't locked to one provider)
Logic	TypeScript rules engine
Data	Static schemes.json with source and verification date
Dev tooling	Cline (IDE extension + CLI), GitHub, Vercel
