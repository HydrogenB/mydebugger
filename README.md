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
│   └── ... (other API files)
├── public/                # Static assets
│   └── favicon.svg
├── src/
│   ├── App.tsx            # Main application with routing
│   ├── main.tsx           # Application entry point
│   ├── assets/            # Images, icons, and other assets
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
│   │   │   └── display/   # Cards, tables, badges, etc.
│   │   ├── icons/         # Emoji-based icon system
│   │   ├── hooks/         # Shared component hooks
│   │   └── context/       # Design system contexts
│   ├── layout/            # Layout components
│   │   ├── Header.tsx     # App header with navigation
│   │   └── Footer.tsx     # App footer with links
│   ├── pages/             # Main pages
│   │   ├── Home.tsx       # Landing page with tool listings
│   │   └── NotFound.tsx   # 404 page
│   └── tools/             # Tool modules
│       ├── index.ts       # Tool registry (central configuration)
│       ├── clickjacking/  # Clickjacking testing tools
│       └── ... (other tool directories)
├── index.html             # HTML entry point
├── package.json           # Project dependencies and scripts
└── ... (configuration files)
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
| Feedback | User feedback components | Alert, LoadingSpinner |
| Layout | Structural components | Card, ResponsiveContainer, ToolLayout |
| Display | Information display | Badge, BadgeContainer |
| Overlays | Floating elements | Modal |
| Navigation | Navigational elements | TabGroup, Tab, TabPanel |

#### 3. Icon System

The design system uses an emoji-based icon system for consistency and ease of use:

```typescript
// Example usage of the icon system
import { getIcon } from '@/design-system/icons';

const infoIcon = getIcon('info');   // Returns ℹ️
const successIcon = getIcon('check'); // Returns ✓
```

#### 4. Theme System

A context-based theme system supports light and dark modes as well as color scheme customization:

```tsx
// Wrapping your application with the ThemeProvider
import { ThemeProvider } from '@/design-system/context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      {/* Your app content */}
    </ThemeProvider>
  );
}

// Using the theme in components
import { useTheme } from '@/design-system/context/ThemeContext';

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

All design system components and utilities can be imported from a single entry point:.

```tsx
// Importing components
import { Button, Card, Alert, Badge, Modal } from '@/design-system';

// Using foundation utilities
import { getColor } from '@/design-system';
const primaryColor = getColor('primary.500');
```

### Component Documentation

Each component in the design system follows a consistent pattern:

- TypeScript interfaces for props
- JSDoc comments for documentation
- Consistent prop naming conventions
- Support for emoji-based icons
- Dark mode compatibility
- Accessibility features

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

The components can be viewed and tested in the Components Demo section of the application.

## 🚀 Available Tools

| Tool | Description | Path |
|------|-------------|------|
| JWT Decoder | Decode and verify JSON Web Tokens | `tools/jwt/` |
| JWT Playground | Interactive JWT creation and testing | `tools/jwtplayground/` |
| URL Encoder | Encode or decode URL components | `tools/url/` |
| QR Code Generator | Generate QR codes | `tools/qrcode/` |
| Regular Expression Tester | Test and debug regular expressions | `tools/regex/` |
| DNS Lookup | Query DNS records | `tools/dns/` |
| HTTP Headers Analyzer | Analyze HTTP headers | `tools/headers/` |
| Clickjacking Validator | Test for clickjacking vulnerabilities | `tools/clickjacking/` |
| Link Tracer | Trace link redirects | `tools/linktracer/` |
| Device Trace | Device information tracing | `tools/linktracer/` |

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
4. Add emoji icon support where appropriate using the `getIcon` utility
5. Add exports to the category's index.ts file
6. Update the main design system index.ts if needed

### Component Design Principles

- **Consistency**: Follow established patterns for props and styling
- **Accessibility**: Ensure keyboard navigation, screen reader support, and proper ARIA attributes
- **Responsiveness**: Components should adapt to different screen sizes
- **Theme Support**: Support both light and dark modes
- **Icon System**: Use the emoji-based icon system for consistent visuals
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

## 🤖 AI Agent Handover Reference

### Quick Start Instructions for AI Assistants

If you're an AI agent working on this codebase, here are some tips to help you get started:

1. **Project Structure**: Familiarize yourself with the project structure above. All components are now in the design system.

2. **Component Usage**: When developing features, always use components from the design system:
   ```tsx
   // Import components from design system
   import { Button, Card } from '../../design-system';
   // Or from specific paths
   import { ToolLayout } from '../../design-system/components/layout';
   ```

3. **Understanding Tool Files**: Each tool has its own directory in `src/tools/` with a main component file. These components use the `ToolLayout` component from the design system.

4. **Important Context for AI**: 
   - The project has completed migration from a legacy component system to a unified design system
   - Always use components from `design-system/` and not from any legacy locations
   - Follow the established patterns for creating and documenting components
   - Use the emoji-based icon system for visual elements
   - Ensure theme support for all new components (light/dark mode)

5. **Getting Started Commands**:
   ```bash
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

### Important Files to Understand First

1. `src/design-system/index.ts` - Main export file for design system
2. `src/tools/index.ts` - Tool registry and configuration
3. `src/App.tsx` - Main application routing
4. `src/context/ThemeContext.tsx` - Theme context for light/dark mode

## 🧠 Design System Principles

The design system follows these core principles:

- **Consistency**: Uniform appearance and behavior across all components
- **Modularity**: Components can be used independently or combined
- **Flexibility**: Components adapt to different contexts and requirements
- **Maintainability**: Easy to update and extend
- **Performance**: Optimized for speed and minimal bundle size
- **Accessibility**: Follows WCAG guidelines for inclusive design

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

## 📝 License

MIT