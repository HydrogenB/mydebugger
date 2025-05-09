# MyDebugger Project Structure

```
mydebugger/
├── public/                # Static assets
├── src/                   # Application source code
│   ├── app/               # Application-specific code
│   ├── features/          # Feature modules (replacing tools/)
│   ├── shared/            # Shared modules across features
│   ├── core/              # Core application logic
│   ├── pages/             # Top-level page components
│   ├── services/          # Service functions
│   └── types/             # Global TypeScript type definitions
├── api/                   # Serverless API functions (organized by domain)
├── config/                # Configuration files
├── scripts/               # Build and deployment scripts
└── tests/                 # Global test utilities and setups
```
