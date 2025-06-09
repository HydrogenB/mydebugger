# MyDebugger

A comprehensive web-based debugging and developer toolkit application.

## Overview

MyDebugger is a stateless application that provides a suite of specialized tools designed to streamline development workflows. The platform is built to be deployed on Vercel, requiring no database and ensuring each deployment stands as a clean slate.

This project embraces a cohesive design system. See [docs/design-philosophy.md](docs/design-philosophy.md) for guiding principles.

## Project Structure

The project follows the MVVM (Model-View-ViewModel) architecture pattern:

- **Model**: Pure domain logic & API calls (TypeScript) with no React/MUI dependencies
- **ViewModel**: Hooks that map Model to UI state & handlers
- **View**: Material UI components rendering props from ViewModel

## Tech Stack

- **Frontend**: React with Next.js
- **UI Framework**: Material UI v7
- **TypeScript**: For type safety
- **Deployment**: Vercel
- **State Management**: React hooks and context

## Running the Project

### Prerequisites

- Node.js (v18)
- [pnpm](https://pnpm.io/) (v8 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/mydebugger.git
   cd mydebugger
   ```

2. Install dependencies using pnpm:
   ```bash
   pnpm install
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Scripts

- `pnpm dev` – start the development server
- `pnpm build` – create a production build
- `pnpm preview` – preview the production build locally
- `pnpm lint` – run ESLint
- `pnpm typecheck` – run TypeScript in strict mode
- `pnpm test` – run the unit tests with coverage

## Deployment

The application is designed to be deployed on Vercel. Each deployment is stateless and represents a clean slate.

## License

ISC
