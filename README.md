# MyDebugger

A developer-focused toolset for debugging, encoding, decoding & demonstrating technical work.

## 🧩 Architecture

MyDebugger is built with a modular architecture that optimizes developer experience and SEO.

### Core Principles

- **Modular Tool System** - Each tool is an independent module with its own route, component, and metadata
- **Developer UX Focused** - Clear modules, minimal clicks to complete tasks
- **SEO Optimized** - Each tool has dedicated metadata for search engine visibility

### Directory Structure

```
src/
├── App.tsx                # Main application with routing
├── tools/                 # Tool modules
│   ├── index.ts           # Tool registry (central configuration)
│   ├── jwt/               # JWT Decoder tool
│   ├── url/               # URL Encoder tool
│   └── ...                # Other tool directories
├── layout/                # Layout components
│   ├── Header.tsx         # App header with navigation
│   └── Footer.tsx         # App footer with links
└── pages/                 # Main pages
    ├── Home.tsx           # Landing page with tool listings
    └── NotFound.tsx       # 404 page
```

## 🚀 Features

- **Tool Registry**: Centralized configuration of all tools
- **Lazy Loading**: Tools load only when needed for performance
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **SEO Optimization**: Each tool has dedicated meta tags 
- **Accessibility**: Semantic HTML and keyboard navigation
- **Fast Interactions**: Instant feedback on all user actions

## 📋 Available Tools

- **JWT Decoder** - Decode and verify JSON Web Tokens
- **URL Encoder/Decoder** - Encode or decode URL components
- **HTTP Headers Analyzer** - Analyze HTTP headers (coming soon)
- **Regex Tester** - Test and debug regular expressions (coming soon)
- **DNS Lookup Tool** - Query DNS records (coming soon)

## 🧠 UX Design Principles

- **Clear Modules**: Tools are organized by category
- **Minimal Clicks**: Users can accomplish tasks with minimal interaction
- **Descriptive Labels**: All tools have clear names and descriptions
- **Visual Grouping**: Tools are grouped by category
- **Fast Feedback**: All interactions provide immediate visual feedback
- **Consistent Structure**: All tools follow the same UI pattern
- **Learning Resources**: Each tool links to relevant documentation

## 🔍 SEO Implementation

Each tool includes:

- Optimized `<title>` with keywords and brand
- Descriptive `<meta>` tags
- OpenGraph/Twitter metadata
- Canonical tags
- Structured heading hierarchy
- Keyword-rich content

## 🛠️ Technical Stack

- **React** - UI library
- **TypeScript** - Type safety
- **React Router** - Routing with lazy loading
- **TailwindCSS** - Utility-first styling
- **Vite** - Build tool for fast development

## 💻 Development

### Prerequisites

- Node.js 14+
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Start development server
   ```
   npm run dev
   ```

### Adding a New Tool

1. Create a new directory in `src/tools/`
2. Implement your tool component
3. Add the tool definition to `src/tools/index.ts`
4. That's it! The routing and homepage listing are automatic

## 🚀 Deployment

The project is configured for deployment on Vercel:

```
npm run build
```

## 🧪 Performance Goals

- Time to First Byte (TTFB) < 100ms
- Largest Contentful Paint (LCP) < 2.5s
- Cumulative Layout Shift (CLS) < 0.1
- First Input Delay (FID) < 100ms

## 📊 Analytics

Events tracked:
- `tool_opened`
- `result_copied`
- `reset_clicked`
- `feedback_given`

## 🔐 Security Considerations

- No eval() usage
- Input sanitization
- Safe rendering of user input
- Sandboxed iframes for demos

## 📝 License

MIT