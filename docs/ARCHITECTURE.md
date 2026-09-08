# Architecture

## Guiding principles

- **Thin HTTP, fat lib.** Route handlers only parse input and map errors. All
  domain logic lives in `src/lib/` and is framework-agnostic.
- **One design system.** Components consume tokens from `globals.css` via Tailwind
  utilities. No hard-coded colours. Primitives in `components/ui/`, feature
  components in `components/<feature>/`.
- **Typed contracts.** `src/lib/moments/schema.ts` is the single source of truth
  shared by the model, the API, and the UI. Zod validates every boundary.
- **Incremental, free-first.** Ship the smallest useful slice, host it on free
  tiers, and only add infrastructure when a feature forces it.

## v1 — timestamps only (current)

```
Browser
  │  POST /api/moments { url }
  ▼
src/app/api/moments/route.ts        ← HTTP adapter, error envelope
  ▼
src/lib/moments/find-moments.ts     ← orchestrator (the one entry point)
  ├── youtube/parse-url.ts          ← URL → 11-char video id
  ├── youtube/metadata.ts           ← oEmbed (no key): title, channel, thumb
  ├── youtube/transcript.ts         ← caption track → timed windows → chunks
  └── ai/anthropic.ts + moments/prompt.ts
                                    ← Claude tool-call per chunk → raw moments
  ▼
normaliseMoments()                  ← clamp, dedupe, rank, cap, add watch links
  ▼
MomentsResult (JSON) → components/moments/*
```

No database, no queue, no video download. Deployable on Vercel Hobby.
Only secret: `ANTHROPIC_API_KEY`.

### Known v1 limitations

- Videos with captions disabled are rejected (`NO_TRANSCRIPT`). Whisper fallback
  is deferred to v2.
- Per-timestamp thumbnails are not generated; the video's main thumbnail is used.
- `youtube-transcript` scrapes YouTube internals and can break without notice.
  Swap target: a transcription worker.

## Roadmap

| Version | Adds | New infra |
| --- | --- | --- |
| v1 | Moment timestamps + hooks | none (Vercel + Anthropic) |
| v2 | Downloadable raw cuts (yt-dlp + ffmpeg) | worker (Railway/Fly), object storage (R2), job store (Supabase/Postgres), queue |
| v3 | 9:16 reframe, burned-in captions, speaker punch-in | Whisper, possibly GPU worker |
| v4 | Accounts, saved projects, history | Auth (Clerk/Auth.js), Postgres |
| v5 | Payments, usage limits, plans | Stripe, metering |

The v1 pipeline becomes step 1 of v2: after `findMoments`, the user selects
moments and the API enqueues one render job per selection.

## Conventions

- Path alias `@/*` → `src/*`.
- Errors: throw `AppError` from `src/lib/errors.ts`; the route maps `code` +
  `status` to `{ error: { code, message } }`.
- Tests (once added): colocated `*.test.ts` next to the unit under test.
