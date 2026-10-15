# Audio Business Card frontend

React client for the Audio Business Card services.

## Development

Requirements: Node.js 22+ and npm 10+.

```bash
npm install
copy .env.example .env.local
npm run dev
```

The development server runs on `http://localhost:5173`. Requests to `/api` are
proxied to the gateway at `http://localhost:8080`.

## Quality checks

```bash
npm run check
```

This runs linting, architecture boundary validation, TypeScript checking,
component tests, and a production build.

See [docs/architecture.md](docs/architecture.md) before adding a feature.
