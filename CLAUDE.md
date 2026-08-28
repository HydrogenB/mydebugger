# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context & Mission

MyDebugger is a suite of client-side developer/debugging tools ("MyDebugger") shipped as a front-end-only React app hosted on Vercel's free tier. Every feature must stay edge-safe and stateless — no server-side persistence, no PII in code or commits. It's open source; contributors add new debugging tools and extend existing ones. Push the limits of what the browser can do, with polished UI/UX (responsiveness, accessibility, developer delight).

Package manager is **pnpm** (see `pnpm-lock.yaml`); a `package-lock.json` also exists but pnpm is canonical.

## Commands

```bash
pnpm install              # install deps
pnpm dev                  # Vite dev server at http://localhost:5173 (vite.config.ts sets port 3000, but dev server actually serves on 5173)
pnpm build                # production build (vite build) -> dist/
pnpm build:vercel         # Vercel-specific build via vercel-build.js
pnpm preview              # preview the production build

pnpm lint                 # eslint, max-warnings 0
pnpm lint:fix
pnpm typecheck            # tsc --noEmit
pnpm test                 # jest
pnpm test:watch
pnpm test:coverage        # jest --coverage (target >=90% line/branch)
pnpm test:unit            # jest --testPathPattern=__tests__
pnpm test:integration     # jest --testPathPattern=integration
pnpm check                # lint && typecheck && test:coverage (full local preflight)
pnpm check:ci             # lint && typecheck && test:ci

pnpm security             # pnpm audit --audit-level high + license-checker summary
```

Run a single test file: `pnpm jest __tests__/tools.jwt.analyzer.test.ts`
Run tests matching a name: `pnpm jest -t "some test name"`

Test suite: Jest + React Testing Library, jsdom environment, transformed via Babel (`babel.config.cjs`), not ts-jest directly. Specs live in `__tests__/*.test.ts[x]` (flat directory, filenames prefixed by area, e.g. `tools.<tool>.test.ts`), integration specs end in `.integration.test.tsx`. Assert user-facing behavior (roles/labels/ARIA), not implementation details.

## Architecture

**Two deployables in one repo:**
1. A Vite + React SPA (`src/`) — this is the actual product, a single-page app with client-side routing.
2. Vercel serverless functions (`api/*.js`) — thin backend used only where something truly cannot run in the browser (e.g. server-side header/device probing). `api/index.js` re-exports handlers from `api/audit-tools.js`, `api/probe-router.js`, `api/headless-runner.js`, `api/utility-tools.js`, `api/deep-link-chain.js`. `vercel.json` rewrites `/api/*` to these functions and falls back everything else to `index.html` (SPA routing).

**Tool registry drives the whole app.** `src/tools/index.ts` exports `toolRegistry: Tool[]`, the single source of truth for every tool: id, route, title/description, category, icon, lazy-loaded `component`, and metadata (keywords, related tools, SEO learnMoreUrl). `src/app/routes.tsx` maps over this registry to generate one `<Route>` per tool automatically — **adding a tool means adding one entry to `toolRegistry`, not touching the router.** The homepage, category browsing, "related tools" links, and SEO all read from this same registry (helpers: `getTools`, `getToolByRoute`, `getToolsByCategory`, `getRelatedTools`, `getPopularTools`, `getNewTools`).

Each tool is a self-contained folder under `src/tools/<tool-name>/`, lazy-imported via `React.lazy()` from the registry so each tool is its own code-split chunk (see `manualChunks` in `vite.config.ts` for a couple of explicitly split chunks). Internal layout varies by tool complexity — a `page.tsx`/`index.ts` entry point plus optional `components/`, `lib/`, `utils/`, `workers/`, `context/`, even a tool-local `routes.tsx` for multi-view tools (e.g. `src/tools/jwt/` has its own sub-router and a crypto Web Worker).

Shared code:
- `src/design-system/` — the UI component library and design tokens (foundations: colors/typography/spacing/animations/layout; components by category: inputs/layout/navigation/feedback/display/overlays/typography; icons; theme + toast context/providers). Prefer these over ad hoc styling.
- `src/shared/` — cross-tool components/hooks/utils not tied to the design system.
- `src/components/`, `src/utils/`, `src/layout/` — app shell, header/footer, other shared primitives.
- `src/context/` — global React context.
- Path aliases are defined in `vite.config.ts` and `tsconfig.json`: `@`, `@app`, `@tools`, `@design-system`, `@layout`, `@pages`, `@components`, `@services`, `@types`, `@shared`, `@features`, `@api`.

`TrackedTool` (`src/app/TrackedTool.tsx`) wraps each tool route for analytics tracking; tools don't need to instrument themselves.

## Coding Style

TypeScript-first, strict ESM. Airbnb TypeScript ESLint profile + Prettier (2-space indent, ~100-character line target). PascalCase for React components, camelCase for hooks/utilities, kebab-case for tool route folders. Compose Tailwind classes via `clsx`/helpers rather than inline styles. New TypeScript files should include the MIT header comment (`© <year> MyDebugger Contributors – MIT License`), matching existing files.

## Commit & PR Guidelines

Conventional Commits (`feat:`, `fix:`, `chore:`...). PRs need a concise summary, linked issue, screenshots/recordings for UI changes, and test coverage notes. Rebase onto `main` before review; ensure `pnpm check` passes locally.

## Notes

- Keep everything stateless/edge-safe — this deploys to Vercel's free tier with no persistent backend. Prefer browser-native APIs, feature-detected before use, over new dependencies.
- `typecheck_errors*.txt` files at the repo root are stale scratch output from past typecheck runs, not authoritative — re-run `pnpm typecheck` for current state.
