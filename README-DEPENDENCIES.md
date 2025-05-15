# MyDebugger Dependencies Guide

## Core Dependencies

This project relies on several key dependencies:

| Package | Purpose | Usage |
|---------|---------|-------|
| React | UI library | Core framework for building the interface |
| TypeScript | Type safety | Adds static typing to JavaScript |
| Vite | Build tool | Fast development and optimized builds |
| React Router | Routing | Client-side routing between tools |
| TailwindCSS | Styling | Utility-first CSS framework |

## Special Import Notes

### @heroicons/react

When using Heroicons, you must:

1. Install the base package:
   ```bash
   npm install @heroicons/react
   ```

2. Import from the appropriate subpath:
   ```jsx
   // For outline icons
   import { BeakerIcon } from '@heroicons/react/24/outline';
   
   // For solid icons
   import { BeakerIcon } from '@heroicons/react/24/solid';
   ```

### Design System

Our design system components should be imported using these patterns:

```jsx
// Using the main design system entry point
import { Button, Card } from '@design-system';

// Using specific component categories
import { Button } from '@design-system/components/inputs';
import { Card } from '@design-system/components/layout';
```

## Installing All Dependencies

To install all project dependencies, run:

```bash
npm install
```

For development dependencies only:

```bash
npm install --only=dev
```

## Troubleshooting

If you encounter installation issues:

1. Check for incompatible peer dependencies
2. Clear your npm cache: `npm cache clean --force`
3. Delete node_modules and reinstall: `rm -rf node_modules && npm install`
4. Ensure your Node.js version is compatible (we recommend v16+)
