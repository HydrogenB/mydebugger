# MyDebugger

**MyDebugger** is a collection of free browser‑based debugging tools for developers, QA engineers and DevOps. Every utility runs entirely client side and is deployed statelessly to Vercel.

## Table of Contents
- [Feature Highlights](#feature-highlights)
- [Project Architecture](#project-architecture)
- [Directory Layout](#directory-layout)
- [Quick Start](#quick-start)
- [Common Scripts](#common-scripts)
- [Testing & Quality Gate](#testing--quality-gate)
- [Adding a New Tool](#adding-a-new-tool)
- [Contributing](#contributing)
- [License](#license)

## Feature Highlights
- **JWT Toolkit** – decode, build and verify JSON Web Tokens
- **URL Encoder / Decoder** – encode or decode URL components
- **HTTP Headers Analyzer** – inspect request and response headers
- **Regex Tester** – live test regular expressions
- **Deep-Link QR Generator** – create QR codes for links or deep links
- **Click Jacking Validator** – detect frame busting issues
- **Dynamic-Link Probe** – simulate app links on iOS and Android
- **Dynamic Link Tracker** – capture UTM parameters in an overlay
- **Deep Link Chain** – follow redirects and export the chain
- **Cookie Inspector** – view, filter and export cookies
- **Cache Inspector** – analyze browser caching behaviour
- **Storage Sync Debugger** – inspect `localStorage` and `sessionStorage`
- **Virtual Name Card** – generate a shareable vCard and QR code
- **Cookie Scope** – visualize `document.cookie` with duplicates detection
- **CORS Tester** – debug CORS preflight responses
- **Crypto Lab** – experiment with AES, RSA and GPG routines
- **Pentest Validator Suite** – run basic security checks for any site
- **Header Scanner** – report on common security headers
- **Pre-rendering & SEO Meta Tester** – see how bots render your page
- **Fetch & Render Tool** – capture DOM after JS execution
- **Web Permission Tester** – request and inspect browser permissions

Read more in [docs/tools.md](docs/tools.md).

## Project Architecture
The codebase follows the **Model → ViewModel → View** pattern:
- **Model** – pure TypeScript functions with no UI dependencies
- **ViewModel** – React hooks that bind models to UI state
- **View** – presentational components using Tailwind and Material UI

## Directory Layout
- **model/** – pure business logic
- **viewmodel/** – React hooks connecting models to views
- **view/** – presentational components styled with Tailwind and MUI
- **src/tools/** – individual tool implementations and routes

## Quick Start
1. Install **Node.js 18** and [**pnpm**](https://pnpm.io/) 8 or newer.
2. Clone this repository and install dependencies:
   ```bash
   pnpm install
   ```
3. Launch the development server:
   ```bash
   pnpm dev
   ```
4. Open <http://localhost:3000> and explore the tools under `/tools`.

## Common Scripts
```bash
pnpm build       # create a production build
pnpm preview     # locally preview the build
pnpm lint        # run ESLint
pnpm typecheck   # strict TypeScript checking
pnpm test        # run unit tests with coverage
```

## Testing & Quality Gate
Run the following commands before committing changes:
```bash
pnpm lint
pnpm typecheck
pnpm test --coverage
```

## Adding a New Tool
Use the built-in generator and follow the TODOs:
```bash
pnpm dlx hygen tool new --name=my-tool
```
This creates boilerplate under `model`, `viewmodel`, `view` and `src/tools` so you can focus on your tool logic.

## Contributing
Pull requests are welcome! For substantial changes, open an issue to discuss your idea first. Ensure `pnpm lint`, `pnpm typecheck` and `pnpm test` pass before pushing.

## License
MIT
