# Repository Guidelines

## Project Context & Mission
MyDebugger ships as a front-end only application hosted on Vercel's free tier, so every feature must stay edge-safe and stateless. The project is open source by design: contributors are encouraged to propose new debugging tools, extend existing ones, and adopt the suite in their own workflows. We push the limits of what the browser can deliver with polished UI/UX, so every change should elevate responsiveness, accessibility, and developer delight.

## Project Structure & Module Organization
Source code lives inside `src/`, with domain-specific tools under `src/tools/<tool-name>` and shared primitives in `src/components`, `src/shared`, and `src/utils`. Application shell and routing utilities sit in `src/app` and `src/layout`. End-to-end specs reside in `__tests__/`, while public assets (icons, audio, static JSON) are in `public/` and `asset/`. Keep generated bundles in `dist/`; anything outside these locations should be treated as build artifacts and excluded from commits.

## Build, Test, and Development Commands
Run `pnpm install` once after cloning. Use `pnpm dev` for the Vite development server at `http://localhost:5173`. Ship-ready builds come from `pnpm build`; preview the output with `pnpm preview`. Quality gates use `pnpm lint`, `pnpm typecheck`, and `pnpm test:coverage`. For a full preflight sweep, run `pnpm check`, which chains linting, type safety, and coverage.

## Coding Style & Naming Conventions
This codebase is TypeScript-first with strict ESM. Follow the Airbnb TypeScript ESLint profile and auto-format with Prettier (2-space indent, 100-character line target). Use PascalCase for React components, camelCase for hooks and utilities, and kebab-case for tool route folders. Compose Tailwind classes via `clsx` or dedicated helpers; avoid inline styles unless absolutely necessary. Always include the MIT header comment in new TypeScript files.

## Testing Guidelines
Jest with React Testing Library powers the suite. Co-locate unit specs inside `__tests__/` using the `*.test.ts[x]` suffix; integration specs end in `.integration.test.tsx`. Maintain >=90% line and branch coverage (`pnpm test:coverage`). Mock browser APIs thoughtfully and prefer lightweight fakes in `__tests__/helpers`. Tests should assert user-facing behavior (roles, labels, ARIA attributes) rather than implementation details.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `chore:` ...) as used across recent history. Each PR must include a concise summary, linked Linear or GitHub issue, screenshots or recordings for UI-visible changes, and notes on test coverage. Rebase onto `main` before requesting review, ensure `pnpm check` passes locally, and flag any follow-up tasks with TODOs or explicit checklist items.

## Security & Operational Notes
This project deploys to Vercel; keep the repo stateless and avoid storing secrets or PII in code or commits. Rely on browser-native APIs only when they are edge-safe and feature-detect before use. Run `pnpm security` before releases to surface dependency and licensing risks.
