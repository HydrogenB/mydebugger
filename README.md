# MyDebugger

MyDebugger is a stateless collection of browser-based utilities for developers, QA and DevOps. Each tool runs entirely client side and the project is deployed to Vercel with no persistent backend.

## Features

- **Crypto Lab** – experiment with AES, RSA and GPG routines
- **Cookie Inspector** – view, filter and export cookies
- **Cache Inspector** – analyze browser caching behaviour
- **Cookie Scope** – visualize `document.cookie` with duplicates detection
- **Pentest Validator Suite** – run basic security checks for any site
- **Storage Sync Debugger** – inspect `localStorage` and `sessionStorage`
- **Header Scanner** – report on common security headers
- **CORS Tester** – debug CORS preflight responses
- **Dynamic Link Tracker** – parse dynamic link parameters with an overlay
- **Deep Link Chain** – follow redirect chains and extract UTM params
- **Dynamic-Link Probe** – simulate app links on iOS and Android
- **Virtual Name Card** – generate a shareable vCard and QR code
- **Pre-rendering & SEO Meta Tester** – compare how bots render your page
- **Fetch & Render Tool** – capture DOM after JS execution
- **Deep-Link QR Generator** – build QR codes for links or deeplinks
- **URL Encoder / Decoder** – quickly encode or decode URLs

Read more in [docs/tools.md](docs/tools.md).

## Architecture

The codebase follows the **Model → ViewModel → View** pattern:

- **Model** – pure TypeScript functions with no UI dependencies
- **ViewModel** – React hooks that bind models to UI state
- **View** – presentational components using Tailwind and Material UI

## Getting Started

### Requirements

- Node.js 18
- [pnpm](https://pnpm.io/) 8+

### Installation

```bash
pnpm install
pnpm dev
```

Then open <http://localhost:3000>.

## Scripts

```bash
pnpm build       # create a production build
pnpm preview     # locally preview the build
pnpm lint        # run ESLint
pnpm typecheck   # strict TypeScript checking
pnpm test        # run unit tests with coverage
```

## Contributing

Pull requests are welcome! For substantial changes, please open an issue to discuss your idea first. Run `pnpm lint`, `pnpm typecheck` and `pnpm test` before pushing your changes.

## License

MIT

