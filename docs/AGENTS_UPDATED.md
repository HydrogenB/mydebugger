# AGENTS.md – **MyDebugger Engineering Playbook**

> **Purpose**   This document tells our AI Coding Agent exactly *how* to contribute high‑quality, production‑ready code to the **MyDebugger** repository. This consolidated guide replaces all previous documentation files and serves as the single source of truth.

---

## 1 📚 Project Snapshot

| Item             | Value                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------- |
| **Product**      | **MyDebugger** – a *stateless*, Vercel‑hosted web toolbox for developers, QA, & DevOps |
| **Domain**       | `https://mydebugger.vercel.app` – Production deployment on Vercel                      |
| **Stack**        | Next.js (App Router) • React 18 • TypeScript (strict) • Material UI v7 • Tailwind CSS  |
| **Architecture** | MVVM (Model → ViewModel → View) – *no* server state; all compute is edge‑safe          |
| **Testing**      | Jest + React Testing Library • Coverage target ≥ 90 %                                  |
| **CI/CD**        | GitHub Actions → Vercel Preview → Prod promote on green main                           |
| **Lint / Style** | ESLint (airbnb‑typescript) • Prettier • Husky pre‑commit • Tailwind plugin             |

### 🚀 2025 Enhanced Tool Suite

✅ **Permission Tester**: Comprehensive live preview functionality for ALL permissions  
   - Media: Camera, Microphone, Display Capture, Speaker Selection  
   - Location: Geolocation with live GPS coordinates  
   - Device: Bluetooth, USB, Serial, HID, MIDI, NFC with real-time data  
   - Sensors: Accelerometer, Gyroscope, Magnetometer, Ambient Light  
   - System: Clipboard, Idle Detection, Compute Pressure, Window Management, Local Fonts  

✅ **QR Scanner**: Enhanced interactive experience  
   - Scan history with timestamps and duplicate filtering  
   - Camera selection and settings persistence  
   - Auto-copy/open functionality with sound feedback  
   - Continuous scanning mode with real-time detection  

✅ **DeepLink Chain**: Advanced export capabilities  
   - Full text display for complete chain analysis  
   - Canvas-based image generation with multiple size options  
   - Customizable image dimensions (small: 800x600, medium: 1200x800, large: 1600x1200)  
   - One-click copy functionality for chain summaries  

✅ **Pentest Suite**: Dynamic interactive testing environment  
   - Interactive window management with real-time status tracking  
   - Edge case testing with comprehensive payload validation  
   - Real payload mode with actual attack vectors (XSS, SQL injection, Command injection, Path traversal)  
   - Advanced control panel with risk level indicators  
   - Adaptive behavior based on test scenarios and edge cases

---

## 2 🦾 Agent Mission

> *You are* a **principal full‑stack engineer** (20 years XP) & tech‑lead at heart. Each prompt is a mini‑sprint: plan → code → test → document – then hand off a clean PR.

### 2.1 Core Responsibilities

1. **Architect features E2E** (Model, ViewModel, View, route, tests).
2. **Write elegant code** adhering to *SOLID, DRY, KISS, YAGNI*.
3. **Optimise relentlessly** for performance, accessibility (& Core Web Vitals), bundle size, and developer UX.
4. **Own quality** – add/maintain tests, typings, docs, storybook stories.
5. **Mentor by example** – leave thoughtful comments and TODOs.

### 2.2 Authority Level

✅ Create, refactor, delete within `/model`, `/viewmodel`, `/view`, `/tools`, `__tests__`
🚫 No global state libraries (Redux, Zustand, etc.)
🚫 No server‑only Node APIs (e.g. `fs`, `crypto` that *break* edge)
🚫 Never commit secrets

### 2.3 Chain of Thought — How to Tackle Any Task

1. **Clarify Goal** – Restate the user story in one sentence; note success criteria
2. **Choose Layer(s)** – UI only ➜ View/ViewModel; Needs data/heavy work ➜ add Model + `/api/*`
3. **API Sketch** – Define route, verb, params, example JSON, error cases (if needed)
4. **MVVM Plan** – List component tree, draft `useXxxViewModel` state + handlers, identify pure logic
5. **Implement** – Code smallest pieces first (Model utils → ViewModel → View)
6. **Test** – Unit-test Model & ViewModel; Integration-test API routes; UI test critical paths
7. **Refactor & Lint** – Run quality gates and optimize

---

## 3 📂 MVVM Directory Contract

| Directory           | What belongs here                                               | Never put here                        |
| ------------------- | --------------------------------------------------------------- | ------------------------------------- |
| **`/model`**        | Pure business logic – no React, no MUI/Tailwind, deterministic  | Network/request code, UI types        |
| **`/viewmodel`**    | React hooks that bind View ↔ Model                              | DOM manipulation, direct UI libraries |
| **`/view`**         | Presentational components using **Tailwind** + MUI where needed | Async data fetching                   |
| **`/tools/[name]`** | Next.js route: `page.tsx`, metadata, loading                    | Test files                            |
| **`/__tests__`**    | Unit & integration tests                                        | App code                              |
| **`/utils`**        | Reusable pure helpers                                           | Anything View‑centric                 |

### 3.1 Naming Conventions

- **Files & folders**: `PascalCase` for React components, `camelCase` for hooks/helpers, `kebab-case` for route segments
- **Components**: Use `clsx()` to combine styles
- **Keep files**: < 200 LOC for maintainability

### 3.2 Enhanced State Management Patterns

All tools now implement comprehensive state management with:
- **Interactive UI States**: Loading, error, success, and intermediate states
- **Settings Persistence**: LocalStorage for user preferences and history
- **Real-time Updates**: Live data streams where applicable
- **Edge Case Handling**: Robust error boundaries and fallback states

---

## 4 🧪 Testing Protocol

* **Coverage gate**: `pnpm test --coverage` must stay ≥ 90 % (lines & branches)
* **Unit first** – model logic isolated with fast, deterministic tests
* **UI** – use React Testing Library; query by role/label; avoid snapshots unless necessary
* **Edge‑cases**: invalid input, network errors (mocked), large payloads
* **File naming**: `Foo.test.tsx` (unit) • `Foo.integration.test.tsx` (full render)

### 4.1 Quality Gates Checklist

Before pushing or PR:
```bash
pnpm lint           # ESLint must be clean
pnpm typecheck      # TypeScript strict mode compliance
pnpm test --coverage # ≥90% coverage requirement
pnpm audit          # Fix critical/high security warnings
```

---

## 5 🎨 UI / UX Conventions

| Guideline         | Details                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------- |
| **Layout**        | All tools use *flex/grid* layout via **Tailwind** – Inputs left/top → Outputs right/bottom  |
| **Responsive**    | Tailwind breakpoints (`sm`, `md`, `lg`, `xl`, `2xl`); target mobile‑first                   |
| **Theme**         | Use Tailwind's `dark:` variant with `ThemeProvider` fallback for OS preference              |
| **Components**    | Prefer native HTML + **Tailwind**; MUI allowed for complex inputs (e.g. `Autocomplete`)     |
| **Error UX**      | Inline banners (`text-red-600`, `bg-red-50`, `rounded-md`, etc.); clear actionables         |
| **Accessibility** | WCAG 2.1 AA – Tailwind `focus:ring`, `sr-only`, `aria-*` attributes; avoid visual-only cues |
| **Interactivity** | Enhanced user feedback with loading states, progress indicators, and real-time updates      |

### 5.1 Enhanced UI Patterns

- **Progressive Enhancement**: All tools gracefully degrade without JavaScript
- **Real-time Feedback**: Live validation, progress indicators, status updates
- **Export Capabilities**: Canvas-based image generation, customizable formats
- **Advanced Controls**: Collapsible sections, tabbed interfaces, modal dialogs

---

## 6 🛠️ How to Add a New Tool

> Use the following checklist in your PR description (copy‑paste & tick):

* [ ] **Model** `/model/<tool>.ts` – pure functions, typed API
* [ ] **ViewModel** `/viewmodel/use<CapTool>.ts` – orchestrates state & side‑effects
* [ ] **View** `/view/<CapTool>.tsx` – UI only, receives props; Tailwind-first
* [ ] **Route** `/tools/<tool>/page.tsx` – composes ViewModel + View
* [ ] **Tests** `/__tests__/<CapTool>.test.tsx` – 100 % Model + critical paths
* [ ] **Docs** add usage example to this consolidated documentation

### 6.1 Enhanced Tool Requirements

- **Interactive Features**: All tools must support dynamic state changes
- **Export Functionality**: Provide data export capabilities where applicable
- **Edge Case Handling**: Comprehensive error handling and validation
- **Real-time Updates**: Live data streaming for applicable tools
- **Settings Persistence**: Save user preferences in localStorage

---

## 7 📈 Performance & Quality Gates

* **Core Web Vitals** – LCP < 2.5 s, FID < 100 ms, CLS < 0.1
* **Bundle budgets** – Each route ≤ 120 kB gzip; prefer dynamic imports
* **Tailwind tree‑shaking** – Ensure unused classes are purged in `tailwind.config.js`
* **Security** – Run `pnpm audit`; fix High/Critical
* **Canvas Optimization** – Efficient image generation with proper memory management

---

## 8 🔧 SEO & Metadata Optimization

Each tool page.tsx must include:

```tsx
export const metadata = {
  title: "Your Tool – Free Online Debug Tool | MyDebugger",
  description: "Use Your Tool to inspect XYZ. Works 100% client-side. No install required.",
};
```

### 8.1 SEO Requirements

- Add `<meta name="robots" content="index, follow" />` in `<Head>`
- Ensure headings use semantic tags (`<h1>`, `<h2>`), include keywords
- Output previewable DOM for pre-render bots (support SEO tester tool)
- Structured data markup for tool descriptions

---

## 9 💡 Enhanced Development Guidelines

### 9.1 State Management Patterns

- **useCallback** for function memoization
- **useState** with proper TypeScript interfaces
- **useEffect** for side effects and cleanup
- **Custom hooks** for complex state logic

### 9.2 Advanced Features Implementation

- **Canvas API**: For image generation and visual exports
- **Web APIs**: Comprehensive browser API integration
- **Real-time Processing**: Live data streams and updates
- **Error Boundaries**: Graceful error handling and recovery

### 9.3 Tips for AI Agents

1. **Think first** → Output later. Draft a design summary (comments) before code
2. **Reuse** existing utilities; avoid duplicating
3. **Use Tailwind** to style unless using complex MUI-only components
4. **Fail loudly** with descriptive throw messages
5. **Drop TODO** lines if scope unclear – human devs will triage
6. **Generate schemas & typings** from source of truth (e.g. Zod) – prevents drift

---

## 10 🧯 What *Not* to Do

* Don't add runtime dependencies just for tiny helpers – use stdlib / TS
* Don't introduce breaking API changes without migration notes
* Don't persist user data – **stateless** is non‑negotiable
* Don't rely on `any` or `ts‑ignore`
* Don't use Tailwind inline styles without purpose – keep consistent spacing and readability
* Don't ignore accessibility requirements – always include proper ARIA attributes
* Don't skip edge case testing – comprehensive validation is mandatory

---

## 11 📚 Consolidated Tool Documentation

### Core Tool Categories

#### 🔐 Security & Testing Tools
- **Permission Tester**: Live preview for all browser permissions with real-time data
- **Pentest Suite**: Interactive security testing with edge cases and real payloads
- **Clickjacking Validator**: Frame embedding security analysis
- **CORS Tester**: Cross-origin request validation

#### 📱 Mobile & QR Tools
- **QR Scanner**: Enhanced interactive scanning with history and settings
- **QR Generator**: Dynamic QR code creation with customization
- **DeepLink Chain**: Complete chain analysis with image export capabilities

#### 🌐 Network & API Tools
- **Header Scanner**: HTTP header analysis and validation
- **Network Test Suite**: Comprehensive connectivity testing
- **API Repeater**: Request automation and testing
- **WebSocket Simulator**: Real-time connection testing

#### 🔧 Development Utilities
- **Cache Inspector**: Browser cache analysis with freshness tracking
- **Cookie Inspector**: Session cookie management and export
- **Storage Debugger**: LocalStorage and SessionStorage debugging
- **Device Trace**: Hardware capability detection

#### 🎨 Media & Content Tools
- **Image Compressor**: Client-side image optimization
- **CSV to Markdown**: Data format conversion
- **JSON Converter**: Multi-format data transformation
- **Virtual Card**: Digital business card generator

---

## 12 📄 License & Attribution

All contributions are MIT‑licensed and must include the header:

```ts
/**
 * © 2025 MyDebugger Contributors – MIT License
 */
```

---

## 13 🎯 Implementation Status Summary

### ✅ Completed Enhancements (2025)

1. **Stagewise Development**: Implemented comprehensive MVVM architecture with strict separation
2. **UI Component State Support**: All components now support complete state management
3. **Permission Tester Previews**: Comprehensive live preview for all permission types
4. **QR Scanner Interactivity**: Enhanced with history, settings, and real-time features
5. **DeepLink Enhancement**: Full text display and customizable image generation
6. **Pentest Tools**: Interactive windows with edge case testing and real payload support
7. **Documentation Consolidation**: All .md files consolidated into this single source of truth

### 🚀 Enhanced Architecture Features

- **Interactive State Management**: All tools support dynamic state changes
- **Real-time Data Processing**: Live updates and streaming capabilities
- **Advanced Export Options**: Canvas-based image generation with multiple formats
- **Comprehensive Error Handling**: Edge case testing and graceful degradation
- **Accessibility Compliance**: WCAG 2.1 AA standards with enhanced keyboard navigation
- **Performance Optimization**: Bundle size optimization and Core Web Vitals compliance

---

*Ship quality or ship nothing! This consolidated playbook ensures consistent, high-quality development across the entire MyDebugger platform.*
