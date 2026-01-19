# Bit by Design - Frontend

The React frontend for the Bit by Design competition platform.

## Tech Stack

- **[React 18](https://react.dev)** - UI library
- **[TanStack Router](https://tanstack.com/router)** - Type-safe file-based routing
- **[TanStack Query](https://tanstack.com/query)** - Server state management & caching
- **[Rsbuild](https://rsbuild.dev)** - Rust-powered build tool (faster than Vite)
- **[Tailwind CSS v4](https://tailwindcss.com)** - Utility-first CSS framework
- **[GSAP](https://gsap.com)** - Professional-grade animations
- **[Biome](https://biomejs.dev)** - Fast linter and formatter

## Prerequisites

- **[Bun](https://bun.sh)** (recommended) or Node.js 18+

## Development

### Install dependencies

```sh
bun install
```

### Start development server

```sh
bun run dev
```

This starts the dev server at http://localhost:3000 with hot module reloading.

> **Note**: The frontend dev server proxies API requests to the backend at http://localhost:5150. Make sure the Loco backend is running.

### Build for production

```sh
bun run build
```

The production build outputs to `dist/` and is served by the Loco backend.

### Preview production build

```sh
bun run preview
```

### Lint and format

```sh
bun run lint
```

## Project Structure

```
frontend/
├── src/
│   ├── routes/           # TanStack Router pages (file-based routing)
│   │   ├── __root.tsx   # Root layout
│   │   ├── index.tsx    # Home page (/)
│   │   ├── login.tsx    # Login page (/login)
│   │   └── about.tsx    # About page (/about)
│   ├── components/
│   │   ├── ui/          # Reusable UI components (Button, Input, Card, etc.)
│   │   ├── forms/       # Form components
│   │   ├── layouts/     # Layout components
│   │   ├── icons/       # SVG icon components
│   │   └── views/       # Page-specific view components
│   ├── hooks/           # Custom React hooks
│   ├── api/             # API client and TanStack Query hooks
│   ├── styles/          # Global CSS styles
│   └── assets/          # Static assets (images, fonts)
├── biome.json           # Biome linter/formatter config
├── rsbuild.config.ts    # Rsbuild bundler config
├── tsconfig.json        # TypeScript config
└── package.json
```

## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are automatically generated from files in `src/routes/`.

- `src/routes/index.tsx` → `/`
- `src/routes/login.tsx` → `/login`
- `src/routes/about.tsx` → `/about`

The route tree is auto-generated to `src/routeTree.gen.ts`.

## API Integration

API calls use [TanStack Query](https://tanstack.com/query) for caching and server state management. API hooks are in `src/api/`.

Example:

```tsx
import { useConfig } from "../api";

function MyComponent() {
	const { data, isLoading } = useConfig();
	// ...
}
```

## Styling

Uses Tailwind CSS v4 with PostCSS. Global styles are in `src/styles/index.css`.

## Animations

GSAP is used for animations. Animation logic is typically in custom hooks or component effects.

## Contributing

1. Follow existing code patterns
2. Run `bun run lint` before committing
3. Keep components small and focused
4. Use TypeScript strictly (no `any` types)
