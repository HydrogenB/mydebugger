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
