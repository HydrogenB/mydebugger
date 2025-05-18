# MyDebugger Project Structure

This document outlines the professional architecture and organization of the MyDebugger project.

## Directory Structure

```
mydebugger/
├── api/                   # Server-side API endpoints
│   ├── index.js           # API entry point
│   ├── controllers/       # API route controllers
│   ├── services/          # Business logic services
│   ├── middleware/        # API middleware functions
│   ├── utils/             # Server utility functions
│   └── types/             # TypeScript types for API
│
├── public/                # Static assets
│   ├── favicon.svg        # Site favicon
│   └── assets/            # Other static files
│
├── src/                   # Frontend source code
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   ├── index.css          # Global styles
│   │
│   ├── app/               # Core application logic
│   │   ├── routes.tsx     # Application routing
│   │   └── providers/     # Global providers
│   │
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Shared components
│   │   └── layouts/       # Layout components
│   │
│   ├── context/           # React context providers
│   │
│   ├── design-system/     # Design system architecture
│   │   ├── components/    # UI components by category
│   │   ├── foundations/   # Design tokens and styles
│   │   └── hooks/         # Design system hooks
│   │
│   ├── features/          # Feature-specific components
│   │   └── [feature-name]/# Individual feature modules
│   │
│   ├── hooks/             # Custom React hooks
│   │
│   ├── pages/             # Page components
│   │
│   ├── shared/            # Shared utilities and constants
│   │
│   ├── tools/                # Developer tools implementations
│   │   ├── index.ts          # Tools registry
│   │   └── [tool-name]/      # Individual tool modules
│   │       ├── index.ts      # Tool entry point
│   │       ├── [ToolName].tsx # Main tool component
│   │       ├── types.ts      # Type definitions
│   │       ├── components/   # Tool-specific components
│   │       ├── hooks/        # Tool-specific hooks
│   │       └── utils/        # Tool-specific utilities
│   │
│   ├── types/             # TypeScript type definitions
│   │
│   └── utils/             # Utility functions
│
├── config/                # Configuration files
│   ├── jest/              # Jest configuration
│   └── vite/              # Vite configuration
│
└── scripts/               # Build and utility scripts
```

## Code Organization Principles

1. **Feature-Based**: Group code by feature rather than by type
2. **Single Responsibility**: Each file should have a single responsibility
3. **Encapsulation**: Features should be self-contained with their own components and utilities
4. **Scalability**: Structure should support easy addition of new features/tools
5. **DRY (Don't Repeat Yourself)**: Shared code should be extracted into reusable modules

## Tool Structure

Each tool follows a consistent structure:

```
src/tools/[tool-name]/
├── index.ts              # Main export & registration
├── [ToolName].tsx        # Main tool component
├── components/           # Tool-specific components
├── hooks/                # Tool-specific hooks
├── utils/                # Tool-specific utilities
└── types.ts              # Tool-specific type definitions
```
