# MyDebugger

A developer-focused toolkit for debugging, API testing, security analysis, encoding, decoding, and UI component demonstration.

## 📋 Project Overview

MyDebugger is a comprehensive web application built with React, TypeScript, and Vite that provides a collection of utility tools for developers. The application follows a modular architecture with a component-based approach, making it easy to extend with new tools and features.

### Core Purpose

- **Development Assistance**: Provide utilities for common development tasks
- **Security Testing**: Tools for analyzing security aspects of web applications
- **UI Component Library**: Showcase and test reusable UI components
- **API Debugging**: Tools for testing and analyzing API responses

## 🧩 Project Structure

```
mydebugger/
├── api/                   # API endpoints for server-side functionality
│   ├── clickjacking-analysis.js
│   ├── device-trace.js
│   ├── dns-lookup.js
│   ├── header-audit.js
│   ├── iframe-test.js
│   └── link-trace.js
├── public/                # Static assets
│   ├── _redirects         # Netlify/Vercel redirect rules
│   ├── debug.html         # Debug page for deployment troubleshooting
│   └── favicon.svg
├── src/
│   ├── App.tsx            # Main application with routing
│   ├── main.tsx           # Application entry point
│   ├── index.css          # Global styles
│   ├── context/           # React context providers
│   │   └── ThemeContext.tsx
│   ├── design-system/     # Design system architecture
│   │   ├── index.ts       # Main export file for design system
│   │   ├── foundations/   # Design tokens and base styles
│   │   │   ├── colors.ts  # Color tokens
│   │   │   ├── typography.ts # Typography definitions
│   │   │   ├── spacing.ts # Spacing scales
│   │   │   └── animations.ts # Animation definitions
│   │   ├── components/    # UI components organized by type
│   │   │   ├── feedback/  # Alerts, toasts, progress indicators
│   │   │   ├── inputs/    # Form controls and inputs
│   │   │   ├── layout/    # Layout components
│   │   │   ├── navigation/ # Navigation components
│   │   │   ├── overlays/  # Modals, drawers, tooltips
│   │   │   ├── typography/ # Text components
│   │   │   └── display/   # Cards, badges, etc.
│   │   ├── icons/         # Icon system
│   │   └── context/       # Design system contexts
│   ├── layout/            # Layout components
│   │   ├── Header.tsx     # App header with navigation
│   │   └── Footer.tsx     # App footer with links
│   ├── pages/             # Main pages
│   │   ├── Home.tsx       # Landing page with tool listings
│   │   └── NotFound.tsx   # 404 page
│   └── tools/             # Tool modules
│       ├── index.ts       # Tool registry (central configuration)
│       ├── RelatedTools.tsx # Related tools component
│       ├── clickjacking/  # Clickjacking testing tools
│       └── ... (other tool directories)
├── index.html             # HTML entry point
├── package.json           # Project dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── vercel.json            # Vercel-specific configuration
└── ... (other configuration files)
```

## 🎨 Design System

The project uses a comprehensive design system architecture for better component reuse and consistency. The design system is located in `src/design-system/` and follows a modular approach.

### Design System Architecture

#### 1. Foundations

The building blocks of the design system, defining the basic design tokens:

| Foundation | Description | File |
|------------|-------------|------|
| Colors | Color palette and utility functions | `foundations/colors.ts` |
| Typography | Font families, sizes, weights, and styles | `foundations/typography.ts` |
| Spacing | Spacing scale for consistent layout | `foundations/spacing.ts` |
| Animations | Animation keyframes and durations | `foundations/animations.ts` |

#### 2. Components

UI components organized by functional category:

| Category | Purpose | Components |
|----------|---------|------------|
| Inputs | User input elements | Button, ThemeToggle, TextInput, Form |
| Feedback | User feedback components | Alert, LoadingSpinner, Skeleton, Toast |
| Layout | Structural components | Card, ResponsiveContainer, ToolLayout, Grid, Collapsible |
| Display | Information display | Badge, InfoBox, ResponsiveImage |
| Overlays | Floating elements | Modal, Tooltip, Drawer |
| Navigation | Navigational elements | TabGroup, Tab, TabPanel |
| Typography | Text components | Text |

#### 3. Animation System

The design system includes a robust animation system with predefined keyframes and animations:

```tsx
// Available animations in the design system
- fadeIn/fadeOut
- slideInRight/slideInLeft/slideInUp/slideInDown
- bounceIn
- scaleIn/scaleOut
- tooltipFade(Down/Up/Left/Right)

// Animation usage example
<div className="animate-fade-in">Content that fades in</div>
<div className="animate-slide-in-right">Content that slides in from right</div>
```

#### 4. Theme System

A context-based theme system supports light and dark modes as well as color scheme customization:

```tsx
// Wrapping your application with the ThemeProvider
import { ThemeProvider } from '../../design-system/context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      {/* Your app content */}
    </ThemeProvider>
  );
}

// Using the theme in components
import { useTheme } from '../../design-system/context/ThemeContext';

function MyComponent() {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Switch to {isDark ? 'Light' : 'Dark'} Mode
    </button>
  );
}
```

### Using the Design System

All design system components and utilities can be imported from a single entry point:

```tsx
// Importing components from the main entry point
import { Button, Card, Alert, Badge, Modal } from '../../design-system';

// Or importing from specific component categories
import { Button } from '../../design-system/components/inputs';
import { Card } from '../../design-system/components/layout';
```

## 🧪 Component Library

The project uses a unified design system for all components across the application. The previously separate legacy component library has been fully migrated to the design system architecture.

### Core Components

| Component | Description | Location |
|-----------|-------------|----------|
| Button | Customizable action buttons | `design-system/components/inputs/Button.tsx` |
| Alert | User notifications | `design-system/components/feedback/Alert.tsx` |
| Card | Content container with various styles | `design-system/components/layout/Card.tsx` |
| Badge | Status indicators and counters | `design-system/components/display/Badge.tsx` |
| Modal | Dialog windows | `design-system/components/overlays/Modal.tsx` |
| TabGroup | Content organization with tabs | `design-system/components/navigation/TabGroup.tsx` |
| ThemeToggle | Theme switcher | `design-system/components/inputs/ThemeToggle.tsx` |
| LoadingSpinner | Loading indicator | `design-system/components/feedback/LoadingSpinner.tsx` |
| ToolLayout | Standard layout for tools | `design-system/components/layout/ToolLayout.tsx` |

The components can be viewed and tested in the Components Demo section of the application (`/components-demo`).

## 🚀 Available Tools

| Tool | Description | Path |
|------|-------------|------|
| JWT Toolkit | Comprehensive JWT tool suite (decode, build, inspect, verify, benchmark) | `tools/jwt/` |
| URL Encoder | Encode or decode URL components | `tools/url/` |
| QR Code Generator | Generate QR codes | `tools/qrcode/` |
| Regular Expression Tester | Test and debug regular expressions | `tools/regex/` |
| DNS Lookup | Query DNS records | `tools/dns/` |
| HTTP Headers Analyzer | Analyze HTTP headers | `tools/headers/` |
| Clickjacking Validator | Test for clickjacking vulnerabilities | `tools/clickjacking/` |
| Link Tracer | Trace link redirects | `tools/linktracer/` |
| Device Trace | Device information tracing | `tools/linktracer/DeviceTrace.tsx` |
| Components Demo | Showcase of UI components | `tools/components-demo/` |

### JWT Toolkit Structure

The JWT toolkit is a comprehensive tool with multiple features organized into a tabbed interface:

- **Decoder**: Decode and verify JWT tokens
- **Inspector**: Deep inspection and security analysis of tokens
- **Builder**: Create and sign new JWT tokens
- **JWKS**: JWKS tool and public key discovery
- **Benchmark**: Algorithm performance testing

## 💻 Development Guidelines

### Setting Up the Development Environment

1. **Prerequisites**
   - Node.js 14+
   - npm or yarn

2. **Installation**
   ```bash
   # Clone the repository
   git clone [repository-url]
   
   # Navigate to project directory
   cd mydebugger
   
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

### Adding New Components to the Design System

1. Identify the appropriate category for your component (inputs, feedback, layout, etc.)
2. Create a new component file in `src/design-system/components/[category]/`
3. Follow the design system patterns for props, TypeScript interfaces, and styling
4. Add exports to the category's index.ts file
5. Update the main design system index.ts if needed

### Component Design Principles

- **Consistency**: Follow established patterns for props and styling
- **Accessibility**: Ensure keyboard navigation, screen reader support, and proper ARIA attributes
- **Responsiveness**: Components should adapt to different screen sizes
- **Theme Support**: Support both light and dark modes
- **Reusability**: Design components for maximum reuse across the application
- **Documentation**: Include JSDoc comments and clear prop interfaces

### Adding New Tools

When adding new tools to the application:

1. Create a new directory under `src/tools/` for your tool
2. Create a main component file for your tool (e.g., `NewTool.tsx`)
3. Import components from the design system using the correct paths:
   ```tsx
   import { Card } from '../../design-system/components/layout';
   import { Button } from '../../design-system/components/inputs';
   import { LoadingSpinner } from '../../design-system/components/feedback';
   import { ToolLayout } from '../../design-system/components/layout';
   ```
4. Register your tool in `src/tools/index.ts` by adding it to the tools array
5. Include appropriate metadata, keywords, and related tools

### Code Style and Conventions

- Use TypeScript for type safety
- Follow React functional component patterns with hooks
- Use TailwindCSS for styling
- Implement accessibility best practices
- Write meaningful component prop interfaces
- Include JSDoc comments for components
- Follow responsive design patterns

## 🔍 Performance Considerations

- Components use React.memo where appropriate
- Lazy loading for tool components
- Optimized bundle size with code splitting
- Client-side caching for frequently accessed data
- Responsive image loading

## 🔐 Security Implementation

- Input validation and sanitization
- Secure handling of sensitive data (e.g., tokens)
- XSS protection measures
- CSRF protection
- Clickjacking protection testing
- Security headers analysis

## 🚀 Deployment

The project is configured for deployment on Vercel:

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Vercel Deployment Notes

- The build script uses `npx` to ensure proper path resolution in containerized environments:
  ```json
  "build": "npx tsc --noEmit && npx vite build"
  ```
- A `vercel.json` file is included in the project root to configure Vercel-specific settings
- The `public/debug.html` file is included to help troubleshoot deployment issues
- API routes in the `/api` directory are automatically deployed as serverless functions

### Deployment Troubleshooting

If you encounter issues during deployment:

1. Verify the build script in `package.json` is correct
2. Check for any path-related issues in imports (case sensitivity matters in deployment)
3. Ensure all dependencies are properly specified in package.json
4. Use the debug.html page to check for environment-specific issues

## 🤖 AI Agent Handover Reference

### Quick Start Instructions for AI Assistants

If you're an AI agent working on this codebase, here are some essential details to help you get started:

#### Project Overview

- **Project Type**: React + TypeScript + Vite application with a modular architecture
- **Primary Purpose**: Collection of developer tools with a unified design system
- **Key Technologies**:
  - React 18.2.0 with functional components and hooks
  - TypeScript 5.0.2 for type safety
  - Vite 4.4.5 for build tooling
  - TailwindCSS 3.3.3 for styling
  - React Router DOM 6.14.0 for routing
  - React Helmet for SEO management

#### Repository Organization

The project follows a structured organization:

1. **Core Files**:
   - `src/App.tsx`: Main routing configuration
   - `src/main.tsx`: Application entry point
   - `src/context/ThemeContext.tsx`: Theme handling (light/dark mode)
   - `src/design-system/index.ts`: Central export for design system components

2. **Design System**:
   - Located in `src/design-system/`
   - Component categories: display, feedback, inputs, layout, navigation, overlays, typography
   - Foundation definitions in `design-system/foundations/`
   - Tailwind integration for styling consistency

3. **Tools Implementation**:
   - Each tool has its own directory under `src/tools/`
   - Tools are registered in the central registry at `src/tools/index.ts`
   - JWT toolkit is the most complex tool with multiple components

4. **API Routes**:
   - API endpoints in `/api` directory 
   - Use serverless architecture that deploys on Vercel
   - Handle various backend functionality (DNS lookups, header analysis, etc.)

#### Recent Changes and Current Status

1. **Recently Fixed Issues**:
   - Fixed TypeScript errors in Form.tsx, BuilderWizard.tsx, and InspectorPane.tsx
   - Fixed JWT components to properly handle type definitions
   - Corrected build script in package.json for Vercel deployment (`npx tsc --noEmit && npx vite build`)

2. **Current Work**:
   - JWT Toolkit functionality is fully implemented with all features working
   - Component library is fully migrated to the design system architecture
   - Deployment configured for Vercel with appropriate optimizations

#### Development Environment Setup

1. **Prerequisites**:
   - Node.js 16+ (18+ recommended)
   - npm or yarn 

2. **Setup Commands**:
   ```bash
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   
   # Type check and build for production
   npm run build
   
   # Preview production build
   npm run preview
   ```

3. **Important Environment Variables**:
   - No sensitive environment variables are required for basic operation
   - If adding API integrations, follow the pattern in `/api` directory

#### Key Implementation Details

1. **Component Patterns**:
   - All components use functional pattern with hooks
   - Props interfaces are defined for each component
   - JSDoc comments document component usage
   - Dark mode support via `dark:` Tailwind variants
   - Tab navigation and accessibility attributes are implemented

2. **Data Flow**:
   - Context API for global state (theme, JWT data)
   - Props for component-to-component communication
   - Local state for component-specific data

3. **Common Patterns**:
   ```tsx
   // Component pattern
   interface ComponentProps {
     // Props definition with JSDoc
     /** Description of the prop */
     propName: PropType;
   }
   
   export const Component: React.FC<ComponentProps> = ({
     propName = defaultValue,
     // Other props
   }) => {
     // Implementation
     return (
       <div className="tailwind-classes dark:tailwind-dark-mode-classes">
         {/* Component content */}
       </div>
     );
   };
   ```

4. **Tool Registration Process**:
   - Create tool components in `/src/tools/[toolname]/`
   - Register in `/src/tools/index.ts` with proper metadata
   - Component must use ToolLayout for consistent UI

5. **Build and Deployment**:
   - Vite handles bundling and optimization
   - TypeScript checks run before build
   - Tailwind purges unused CSS in production
   - Vercel deployment is configured in vercel.json

#### Common Pitfalls and Solutions

1. **Design System Import Path**:
   - **Issue**: Inconsistent import paths for design system components
   - **Solution**: Always import from the appropriate path in `../../design-system/components/[category]`

2. **TypeScript Strictness**:
   - **Issue**: Type errors in complex components like TabGroup and JWT tools
   - **Solution**: Ensure all props are typed properly, especially when using Record/dictionary types

3. **Vercel Deployment Issues**:
   - **Issue**: Permission errors with direct binary path references
   - **Solution**: Use `npx` to run tools instead of direct paths in package.json scripts

4. **Component Layout Issues**:
   - **Issue**: Inconsistent layout in responsive views
   - **Solution**: Use the provided Grid, ResponsiveContainer, and layout components

#### File and Code Generation Guidelines

When generating code for this project, follow these patterns:

1. **Component Creation**:
   - Use TypeScript interfaces for props
   - Include JSDoc comments
   - Implement dark mode with Tailwind
   - Follow accessibility best practices (ARIA roles, keyboard navigation)

2. **Tool Development**:
   - Use ToolLayout with proper metadata
   - Implement responsive design for all screen sizes
   - Include loading states and error handling
   - Register tool in the central registry

3. **Context Development**:
   - Provide a context provider
   - Include a custom hook for accessing context
   - Type all context values and actions
   - Handle loading/error states

#### Critical Files to Understand

1. `src/design-system/index.ts` - Main design system exports
2. `src/tools/index.ts` - Tool registry and tool type definitions
3. `src/App.tsx` - Main routing configuration
4. `package.json` - Dependencies and build scripts
5. `tailwind.config.js` - Tailwind configuration and theme extensions

#### Project-Specific Terms and Concepts

1. **Tool**: A feature module that provides specific functionality
2. **Design System**: The unified component library and styling system
3. **ToolLayout**: The standard layout wrapper for all tools
4. **JWT Toolkit**: The comprehensive JWT tool with multiple tabs/features
5. **Foundation**: Base design tokens like colors, spacing, typography

By understanding these details, you should be able to efficiently work with this codebase and implement changes that align with the existing architecture and patterns.

## 📝 License

MIT