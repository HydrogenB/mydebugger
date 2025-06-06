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
- **Testing**: Jest and React Testing Library
- **Deployment**: Vercel
- **State Management**: React hooks and context

## Running the Project

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/mydebugger.git
   cd mydebugger
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the production version
- `npm start`: Start the production server
- `npm run lint`: Run the linter

## Deployment

The application is designed to be deployed on Vercel. Each deployment is stateless and represents a clean slate.

## Tool Categories

1. **Encoding** - Transform data between different encoding formats
2. **Security** - Tools for security testing, token validation, and encryption
3. **Testing** - Validate and test various network configurations and responses
4. **Utilities** - General purpose developer utilities
5. **Conversion** - Convert between different data formats
6. **Formatters** - Format and prettify code and data

## License

ISC
