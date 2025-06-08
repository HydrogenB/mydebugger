# Testing Structure

```
mydebugger/
├── src/                         # Application source code
│   ├── features/                # Feature modules
│   │   └── [feature]/           # Specific feature
│   │       ├── __tests__/       # Component tests for feature
│   │       │   ├── unit/        # Unit tests
│   │       │   └── integration/ # Integration tests
│   │       └── components/      # Feature components
│   └── shared/                  # Shared modules
│       └── design-system/       # Design system
│           └── components/      # Design system components
│               └── [category]/  # Component category
│                   ├── __tests__/ # Component tests
│                   └── [Component].tsx # Component
├── tests/                      # Global test utilities
│   ├── setup.ts               # Test setup
│   ├── mocks/                 # Global mocks
│   ├── fixtures/              # Test fixtures
│   └── utils/                 # Test utilities
├── jest.config.js             # Jest configuration
└── jest.setup.js              # Jest setup
```

## Testing Guidelines

1. **Unit Tests**: Test component props, rendering, and basic interactions
2. **Integration Tests**: Test component interactions with other components or services
3. **Test Organization**: Keep tests alongside the code they test
4. **Mocking**: Use mocks for external dependencies
5. **Test Utilities**: Utilize test utilities for common patterns
