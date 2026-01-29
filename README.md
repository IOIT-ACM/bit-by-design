# Bit by Design

A design competition platform built with [Loco](https://loco.rs) (Rust) backend and React frontend.

## Overview

Bit by Design is a web application for hosting design competitions. Participants can submit their designs, and the community can vote on their favorites.

## Tech Stack

### Backend

- **[Loco](https://loco.rs)** - Rust web framework (Rails-like)
- **[SeaORM](https://www.sea-ql.org/SeaORM/)** - Async ORM for database operations
- **PostgreSQL** - Primary database
- **JWT** - Authentication

### Frontend

- **[React](https://react.dev)** - UI library
- **[TanStack Router](https://tanstack.com/router)** - Type-safe routing
- **[TanStack Query](https://tanstack.com/query)** - Data fetching & caching
- **[Rsbuild](https://rsbuild.dev)** - Rust-powered build tool
- **[Tailwind CSS v4](https://tailwindcss.com)** - Utility-first CSS
- **[GSAP](https://gsap.com)** - Animations

## Prerequisites

- **Rust** (stable) - [Install via rustup](https://rustup.rs)
- **Bun** (or Node.js 18+) - [Install Bun](https://bun.sh)
- **PostgreSQL** - Local instance or Docker
- **Docker** (optional) - For running PostgreSQL

## Getting Started

### 1. Clone the repository

```sh
git clone https://github.com/your-username/bit-by-design.git
cd bit-by-design
```

### 2. Set up environment variables

```sh
cp .env.example .development.env
```

Edit `.development.env` with your actual values:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)
- `MAILER_*` - SMTP configuration for emails

### 3. Start PostgreSQL

Using Docker:

```sh
docker run -d --name postgres \
  -e POSTGRES_USER=loco \
  -e POSTGRES_PASSWORD=loco \
  -e POSTGRES_DB=bit-by-design_development \
  -p 5432:5432 \
  postgres:16
```

### 4. Install dependencies

Backend:

```sh
cargo build
```

Frontend:

```sh
cd frontend
bun install
```

### 5. Run database migrations

```sh
cargo loco db migrate
```

### 6. Start the development servers

**Backend** (runs on http://localhost:5150):

```sh
cargo loco start
```

**Frontend** (runs on http://localhost:3000 with hot reload):

```sh
cd frontend
bun run dev
```

For production builds, the frontend is served directly by Loco:

```sh
cd frontend && bun run build
cd .. && cargo loco start
```

## Project Structure

```
bit-by-design/
├── src/                    # Rust backend source
│   ├── bin/               # CLI entry point
│   ├── controllers/       # HTTP request handlers
│   ├── models/            # Database models (SeaORM entities)
│   ├── views/             # Response serialization
│   ├── mailers/           # Email templates
│   ├── workers/           # Background job processors
│   └── tasks/             # CLI tasks
├── migration/             # Database migrations (SeaORM)
├── config/                # Environment configurations
│   ├── development.yaml   # Development settings
│   ├── test.yaml          # Test settings
│   └── production.yaml    # Production settings (gitignored)
├── frontend/              # React frontend
│   ├── src/
│   │   ├── routes/        # TanStack Router pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── api/           # API client & queries
│   │   └── styles/        # CSS styles
│   └── package.json
└── tests/                 # Integration tests
```

## Development

### Backend Commands

```sh
# Start the server
cargo loco start

# Run tests
cargo test

# Run linter
cargo clippy

# Generate a new controller
cargo loco generate controller <name>

# Generate a new model
cargo loco generate model <name>

# Run database migrations
cargo loco db migrate

# Rollback last migration
cargo loco db rollback

# Generate migration
cargo loco db generate migration <name>
```

### Frontend Commands

```sh
cd frontend

# Start dev server with hot reload
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Lint code
bun run lint
```

### Code Style

- **Rust**: Uses `rustfmt` with project settings (`.rustfmt.toml`)
- **TypeScript/React**: Uses [Biome](https://biomejs.dev) for formatting and linting

## Testing

```sh
# Run all backend tests
cargo test

# Run tests with output
cargo test -- --nocapture

# Run specific test
cargo test test_name
```

## Deployment

### Build for Production

1. Build the frontend:

   ```sh
   cd frontend && bun run build
   ```

2. Build the Rust binary:

   ```sh
   cargo build --release
   ```

3. The binary is at `target/release/bit_by_design-cli`

### Environment Variables

Ensure these are set in production:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secure random string (min 32 chars)
- `MAILER_*` - SMTP configuration
- `LOCO_ENV=production` - Sets production mode

### Running in Production

```sh
LOCO_ENV=production ./target/release/bit_by_design-cli start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Guidelines

- Follow existing code style (run `cargo fmt` and `bun run lint`)
- Write tests for new functionality
- Update documentation as needed
- Keep commits focused and atomic

## CI/CD

GitHub Actions runs on every push and PR:

- `rustfmt` - Code formatting check
- `clippy` - Rust linter with strict settings
- `test` - Full test suite with PostgreSQL

## License

This project is licensed under the MIT license. Check the LICENSE file.

## Acknowledgments

- [Loco.rs](https://loco.rs) - The Rust web framework powering the backend
- [TanStack](https://tanstack.com) - Router and Query libraries
- [Rsbuild](https://rsbuild.dev) - Fast Rust-based build tool
