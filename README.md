# Slot Machine 5x4 - PixiJS

Professional slot machine implementation with clean architecture, TypeScript strict mode, and PixiJS.

## Tech Stack

- **Runtime**: TypeScript 5.7+ (strict mode)
- **Graphics**: PixiJS 8.5
- **Animation**: GSAP 3.12
- **Build**: Vite 6
- **Test**: Vitest 2
- **Lint/Format**: Biome 1.9
- **Package Manager**: pnpm 9

## Architecture

Modular clean architecture with clear separation of concerns:

```
src/
├── core/           # Base types, interfaces, constants (no dependencies)
├── domain/         # Business entities and rules (imports: core)
├── application/    # Use cases and services (imports: core, domain)
├── infrastructure/ # External services implementation (imports: core, domain, application)
├── presentation/   # PixiJS views and UI (imports: all)
├── config/         # Application configuration (imports: core)
└── tests/          # Test helpers and mocks
```

## Code Standards

- TypeScript `strict: true`
- No `any` types allowed
- Named exports only (no default exports)
- No barrel files (`index.ts` re-exports)
- Biome for linting and formatting

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Run tests
pnpm test

# Run tests with UI
pnpm test:ui

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint

# Format code
pnpm format

# Check and fix all issues
pnpm check
```

## Mobile Support

- Responsive design with `resizeTo: window`
- Auto density for retina displays
- Touch event handling
- Orientation change support

## Project Status

✅ Initial setup complete
⏳ Slot machine logic (pending)
⏳ Symbol animations (pending)
⏳ Win calculations (pending)
⏳ Sound system (pending)

## License

Private
