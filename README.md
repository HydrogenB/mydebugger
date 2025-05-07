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
│   └── favicon.svg
├── src/
│   ├── App.tsx            # Main application with routing
│   ├── main.tsx           # Application entry point
│   ├── assets/            # Images, icons, and other assets
│   ├── context/           # React context providers
│   │   └── ThemeContext.tsx
│   ├── layout/            # Layout components
│   │   ├── Header.tsx     # App header with navigation
│   │   └── Footer.tsx     # App footer with links
│   ├── pages/             # Main pages
│   │   ├── Home.tsx       # Landing page with tool listings
│   │   └── NotFound.tsx   # 404 page
│   └── tools/             # Tool modules
│       ├── index.ts       # Tool registry (central configuration)
│       ├── clickjacking/  # Clickjacking testing tools
│       ├── components/    # Reusable UI components
│       ├── components-demo/ # Component demonstrations
│       ├── dns/           # DNS lookup tools
│       ├── headers/       # HTTP headers analysis
│       ├── jwt/           # JWT decoder and tools
│       ├── jwtplayground/ # JWT interactive playground
│       ├── linktracer/    # Link and device tracing tools
│       ├── qrcode/        # QR code generator
│       ├── regex/         # Regular expression testing
│       └── url/           # URL encoding/decoding tools
├── index.html             # HTML entry point
├── package.json           # Project dependencies and scripts
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.js     # TailwindCSS configuration
├── tsconfig.json          # TypeScript configuration
├── tsconfig.node.json     # TypeScript Node configuration
└── vite.config.ts         # Vite build configuration
```

## 🧪 Component Library

The project includes a comprehensive component library located in `src/tools/components/`. These components are built with accessibility, reusability, and TypeScript type safety in mind.

### Core Components

| Component | Description | Location |
|-----------|-------------|----------|
| Accordion | Collapsible content panels | `components/Accordion.tsx` |
| Alert | User notifications | `components/Alert.tsx` |
| Button | Customizable action buttons | `components/Button.tsx` |
| Card | Content container with various styles | `components/Card.tsx` |
| DataTable | Interactive data tables | `components/DataTable.tsx` |
| Form | Form controls and validation | `components/Form.tsx` |
| InfoBox | Contextual information display | `components/InfoBox.tsx` |
| Modal | Dialog windows | `components/Modal.tsx` |
| OtpInput | One-time password input with autofill | `components/OtpInput.tsx` |
| Tabs | Content organization with tabs | `components/TabGroup.tsx` |
| TextInput | Text input fields | `components/TextInput.tsx` |
| Tooltip | Contextual help tooltips | `components/Tooltip.tsx` |

The components can be viewed and tested in the Components Demo section of the application at `src/tools/components-demo/`.

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

### Adding New Components

1. Create a new component file in `src/tools/components/`
2. Follow the existing patterns for props, TypeScript interfaces, and styling
3. Add exports to `src/tools/components/index.ts`
4. Create demonstration examples in `src/tools/components-demo/`

### Adding New Tools

1. Create a new directory in `src/tools/`
2. Implement your tool component as the main export
3. Add the tool definition to `src/tools/index.ts` with required metadata:
   ```typescript
   {
     id: 'unique-id',
     title: 'Tool Name',
     description: 'Short description of the tool',
     route: '/route-path',
     category: 'Category Name',
     component: lazy(() => import('./path/to/Component')),
     icon: IconComponent
   }
   ```

### Code Style and Conventions

- Use TypeScript for type safety
- Follow React functional component patterns with hooks
- Use TailwindCSS for styling
- Implement accessibility best practices
- Write meaningful component prop interfaces
- Include JSDoc comments for components
- Follow responsive design patterns

## 🧠 Design System

The application uses a consistent design system based on TailwindCSS:

- **Colors**: Uses a defined color palette with primary, secondary, and accent colors
- **Typography**: Consistent font usage with defined heading sizes
- **Spacing**: Standard spacing scale for margins and padding
- **Shadows**: Consistent elevation system for depth
- **Borders**: Standard border radiuses and widths
- **Dark Mode**: Supports light and dark mode via ThemeContext

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