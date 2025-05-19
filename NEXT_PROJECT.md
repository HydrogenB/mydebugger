# Next.js Project Structure

This project is built with Next.js and follows these conventions:

## Directory Structure

- `/pages`: Contains all routes and API endpoints
  - `_app.js`: Custom App component for global styles and layouts
  - `_document.js`: Custom Document for modifying the initial HTML document
  - `index.js`: Home page
  - `/api`: API routes (serverless functions)

- `/public`: Static assets like images and fonts

- `/src`: Source code
  - `/app`: Application logic and providers
  - `/components`: Reusable UI components
  - `/design-system`: Design system components and styles
  - `/hooks`: Custom React hooks
  - `/layout`: Layout components like Header and Footer
  - `/utils`: Utility functions

## Development

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint checks

## Deployment

This project is deployed to Vercel and configured for stateless deployments.

### Build Configuration

- `next.config.js`: Contains Next.js configuration settings
  - ESLint and TypeScript errors are ignored during builds
  - Images are configured for static optimization
  - Source maps are disabled in production for better performance

### Vercel Deployment

- `vercel.json`: Contains Vercel-specific configuration
  - Specifies the Next.js framework
  - Sets custom installation and build commands
  - Configures the output directory for static exports
  - Defines routing rules and API handlers

### Build Scripts

- `npm run build:vercel`: Runs the enhanced Vercel build script
- `vercel-next-build.js`: Custom build script with:
  - Cross-platform compatibility (Windows/Unix)
  - Multiple build attempt strategies
  - Error handling and fallback mechanisms
  - Environment variable configuration
