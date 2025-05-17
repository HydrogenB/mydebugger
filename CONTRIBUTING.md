# Contributing to MyDebugger

Thank you for considering contributing to MyDebugger! This document provides guidelines and instructions for contributing to this project.

## Project Structure

Please familiarize yourself with the [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) document, which outlines our architectural organization.

## Development Workflow

### Setting Up the Development Environment

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`

### Code Style and Standards

We follow these coding guidelines:

- Use TypeScript for all new code
- Follow the established project structure
- Write descriptive, concise comments
- Include type definitions for all functions and components
- Use functional components with hooks for React code
- Write unit tests for all new functionality

### Tool Structure

When creating or modifying a tool, follow this standard structure:

```
src/tools/[tool-name]/
├── index.ts              # Main export & registration
├── [ToolName].tsx        # Main tool component
├── types.ts              # Type definitions
├── components/           # Tool-specific components
├── hooks/                # Tool-specific hooks
└── utils/                # Tool-specific utilities
```

Each directory should include an `index.ts` file that exports all public members.

### Code Organization Principles

1. **Feature-Based**: Group code by feature rather than by type
2. **Single Responsibility**: Each file should have a single responsibility
3. **Encapsulation**: Features should be self-contained with their own components and utilities
4. **Scalability**: Structure should support easy addition of new features/tools
5. **DRY (Don't Repeat Yourself)**: Shared code should be extracted into reusable modules

## Testing

- Run tests with `npm test`
- Ensure all tests pass before submitting a pull request
- Add new tests for new features or bug fixes

## Pull Requests

1. Fork the repository
2. Create a new branch with a descriptive name
3. Make your changes
4. Run tests and ensure they pass
5. Submit a pull request with a clear description of your changes

## Scripts

We have provided several utility scripts to help maintain code quality:

- `npm run check-imports`: Checks for invalid imports
- `npm run check-tools`: Verifies tool structure conformance
- `npm run lint`: Runs ESLint to check code quality
- `npm run type-check`: Runs TypeScript compiler to check types

## Questions?

If you have any questions, feel free to open an issue or reach out to the maintainers.

Thank you for contributing to MyDebugger!
