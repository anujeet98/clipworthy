# Contributing

## Branch & review workflow

`main` is protected: no direct pushes, linear history, PR required.

1. Branch from `main`: `feat/…`, `fix/…`, `chore/…`, or `docs/…`.
2. Make the change. Keep the PR scoped to one issue where possible.
3. Before pushing, run the full check locally:
   ```bash
   npm run lint && npm run typecheck && npm test && npm run build
   ```
4. Open a PR (`gh pr create`), reference the issue with `Closes #N`.
5. **Wait for review.** Do not merge until the reviewer approves.
6. After approval: squash-merge and delete the branch.

CI (`.github/workflows/ci.yml`) runs the same four checks on every PR.

## Code standards

- **Thin HTTP, fat lib.** Route handlers parse input and map errors only. Domain
  logic lives in `src/lib/` and stays framework-agnostic.
- **Typed boundaries.** Validate every external input with Zod. Throw `AppError`
  (`src/lib/errors.ts`) for anything the client should see.
- **One design system.** Use tokens from `globals.css` via Tailwind utilities.
  No hard-coded colours. Extend `components/ui/` primitives; don't fork them.
- **Tests colocated.** `foo.ts` → `foo.test.ts` beside it. Cover pure logic;
  mock the model call.
- **Document the "why".** File headers explain intent, not mechanics.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the system design and roadmap.

## Issue tracking

Work and project memory live in **GitHub Issues**. Labels: `v1`/`v2`/`v3`
(roadmap phase), `type:feature`/`type:bug`/`type:chore`,
`area:pipeline`/`area:ui`/`area:infra`/`area:docs`.
