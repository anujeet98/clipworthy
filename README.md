# Clipworthy

Paste a YouTube link, get the viral moments — funniest, most quotable, most
share-worthy segments with exact timestamps.

Built incrementally on free tiers. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
for the design and roadmap.

## Status

**v1 — timestamps only.** Reads the transcript and returns ranked moments with
hooks and deep links. No video processing yet.

## Local setup

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4, token-based design system (`src/app/globals.css`)
- Anthropic SDK (Claude) for moment detection
- Zod for boundary validation

## Project layout

| Path | Purpose |
| --- | --- |
| `src/app/` | Routes and the single API endpoint (`api/moments`) |
| `src/lib/` | Framework-agnostic domain logic (the real code) |
| `src/lib/moments/` | Detection pipeline, prompt, shared schema |
| `src/lib/youtube/` | URL parsing, transcript, metadata |
| `src/components/ui/` | Design-system primitives — compose, don't fork |
| `src/components/moments/` | Feature components |
| `docs/` | Architecture and roadmap |

## Contributing / tracking

Work is tracked in **GitHub Issues** (also serves as the project memory).
Labels: \`v1\`\`v2\`\`v3\` for roadmap phase, \`type:feature\`\`type:bug\`\`type:chore\`,
\`area:pipeline\`\`area:ui\`\`area:infra\`\`area:docs\`.
