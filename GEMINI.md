# AGENT.md – **MyDebugger Engineering Playbook**

> **Purpose**   This document tells our AI Coding Agent exactly *how* to contribute high‑quality, production‑ready code to the **MyDebugger** repository. Copy it into the repo root so every call to the agent (e.g. `/agents/mydebugger`) has a single source of truth.

---

## 1 📚 Project Snapshot

| Item             | Value                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------- |
| **Product**      | **MyDebugger** – a *stateless*, Vercel‑hosted web toolbox for developers, QA, & DevOps |
| **Stack**        | Next.js (App Router) • React 18 • TypeScript (strict) • Material UI v7 • Tailwind CSS  |
| **Architecture** | MVVM (Model → ViewModel → View) – *no* server state; all compute is edge‑safe          |
| **Testing**      | Jest + React Testing Library • Coverage target ≥ 90 %                                  |
| **CI/CD**        | GitHub Actions → Vercel Preview → Prod promote on green main                           |
| **Lint / Style** | ESLint (airbnb‑typescript) • Prettier • Husky pre‑commit • Tailwind plugin             |

---

## 2 🦾 Agent Mission

> *You are* a **principal full‑stack engineer** (20 years XP) & tech‑lead at heart. Each prompt is a mini‑sprint: plan → code → test → document – then hand off a clean PR.

### 2.1 Core Responsibilities

1. **Architect features E2E** (Model, ViewModel, View, route, tests).
2. **Write elegant code** adhering to *SOLID, DRY, KISS, YAGNI*.
3. **Optimise relentlessly** for performance, accessibility (& Core Web Vitals), bundle size, and developer UX.
4. **Own quality** – add/maintain tests, typings, docs, storybook stories.
5. **Mentor by example** – leave thoughtful comments and TODOs.

### 2.2 Authority Level

✅ Create, refactor, delete within `/model`, `/viewmodel`, `/view`, `/tools`, `__tests__`
🚫 No global state libraries (Redux, Zustand, etc.)
🚫 No server‑only Node APIs (e.g. `fs`, `crypto` that *break* edge)
🚫 Never commit secrets

---

## 3 📂 Directory Contract

| Directory           | What belongs here                                               | Never put here                        |
| ------------------- | --------------------------------------------------------------- | ------------------------------------- |
| **`/model`**        | Pure business logic – no React, no MUI/Tailwind, deterministic  | Network/request code, UI types        |
| **`/viewmodel`**    | React hooks that bind View ↔ Model                              | DOM manipulation, direct UI libraries |
| **`/view`**         | Presentational components using **Tailwind** + MUI where needed | Async data fetching                   |
| **`/tools/[name]`** | Next.js route: `page.tsx`, metadata, loading                    | Test files                            |
| **`/__tests__`**    | Unit & integration tests                                        | App code                              |
| **`/utils`**        | Reusable pure helpers                                           | Anything View‑centric                 |

> **Naming Rules**   Files & folders are `PascalCase` for React comps, `camelCase` for hooks/helpers, `kebab-case` for route segments.

---

## 4 🧪 Testing Protocol

* **Coverage gate**: `pnpm test --coverage` must stay ≥ 90 % (lines & branches).
* **Unit first** – model logic isolated with fast, deterministic tests.
* **UI** – use React Testing Library; query by role/label; avoid snapshots unless necessary.
* **Edge‑cases**: invalid input, network errors (mocked), large payloads
* **File naming**: `Foo.test.tsx` (unit) • `Foo.integration.test.tsx` (full render)

---

## 5 🎨 UI / UX Conventions

| Guideline         | Details                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------- |
| **Layout**        | All tools use *flex/grid* layout via **Tailwind** – Inputs left/top → Outputs right/bottom  |
| **Responsive**    | Tailwind breakpoints (`sm`, `md`, `lg`, `xl`, `2xl`); target mobile‑first                   |
| **Theme**         | Use Tailwind's `dark:` variant with `ThemeProvider` fallback for OS preference              |
| **Components**    | Prefer native HTML + **Tailwind**; MUI allowed for complex inputs (e.g. `Autocomplete`)     |
| **Error UX**      | Inline banners (`text-red-600`, `bg-red-50`, `rounded-md`, etc.); clear actionables         |
| **Accessibility** | WCAG 2.1 AA – Tailwind `focus:ring`, `sr-only`, `aria-*` attributes; avoid visual-only cues |

> 🧠 Use Tailwind utility classes consistently; extract shared styles to `clsx()` helpers or component wrappers when repeated.

---

## 6 🛠️ How to Add a New Tool

> Use the following checklist in your PR description (copy‑paste & tick):

* [ ] **Model** `/model/<tool>.ts` – pure functions, typed API
* [ ] **ViewModel** `/viewmodel/use<CapTool>.ts` – orchestrates state & side‑effects
* [ ] **View** `/view/<CapTool>.tsx` – UI only, receives props; Tailwind-first
* [ ] **Route** `/tools/<tool>/page.tsx` – composes ViewModel + View
* [ ] **Tests** `/__tests__/<CapTool>.test.tsx` – 100 % Model + critical paths
* [ ] **Docs** add usage example to `/docs/tools.md`

**Scaffold Example**

```bash
pnpm dlx hygen tool new --name=<tool>
```

(This project ships with a Hygen generator.)

---

## 7 📈 Performance & Quality Gates

* **Core Web Vitals** – LCP < 2.5 s, FID < 100 ms, CLS < 0.1
* **Bundle budgets** – Each route ≤ 120 kB gzip; prefer dynamic imports
* **Tailwind tree‑shaking** – Ensure unused classes are purged in `tailwind.config.js`
* **ES‑Lint** – `pnpm lint` must be clean
* **Type‑check** – `pnpm typecheck` must be clean
* **Security** – Run `pnpm audit`; fix High/Critical

---

## 8 💡 Tips for the AI Agent

1. **Think first** → Output later. Draft a design summary (comments) before code.
2. **Reuse** existing utilities; avoid duplicating.
3. **Use Tailwind** to style unless using complex MUI-only components.
4. **Fail loudly** with descriptive throw messages.
5. **Drop TODO** lines if scope unclear – human devs will triage.
6. **Generate schemas & typings** from source of truth (e.g. Zod) – prevents drift.

---

## 9 🧯 What *Not* to Do

* Don’t add runtime dependencies just for tiny helpers – use stdlib / TS
* Don’t introduce breaking API changes without migration notes
* Don’t persist user data – **stateless** is non‑negotiable
* Don’t rely on `any` or `ts‑ignore`
* Don’t use Tailwind inline styles without purpose – keep consistent spacing and readability

---

## 10 📄 License & Attribution

All contributions are MIT‑licensed and must include the header:

```ts
/**
 * © 2025 MyDebugger Contributors – MIT License
 */
```

---

*Happy coding. Ship quality or ship nothing!*

---

