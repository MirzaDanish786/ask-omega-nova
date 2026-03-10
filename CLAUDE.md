# Omega Nova - Project Conventions

## Architecture
- **Monorepo**: Turborepo with npm workspaces
- **Backend**: Express.js + TypeScript (`apps/api`)
- **Frontend**: React + Vite + TypeScript (`apps/web`)
- **Shared**: Types, constants, utils (`packages/shared` → `@omega-nova/shared`)
- **Database**: PostgreSQL + TypeORM
- **Auth**: BetterAuth with PostgreSQL adapter

## Code Style
- **TypeScript strict mode** everywhere
- **Classes with interfaces** — no loose functions for services/repos/controllers
- **Pattern**: Controller → Service → Repository → TypeORM
- **Naming**: PascalCase for classes/interfaces, camelCase for methods/variables
- **Imports**: Use `@omega-nova/shared` for shared types, never relative cross-package imports

## Backend Patterns (`apps/api`)
```
routes/         → Define Express routes, apply middleware
controllers/    → Parse request, call service, send response
services/       → Business logic, orchestration
repositories/   → Data access only (TypeORM queries)
entities/       → TypeORM entity classes with decorators
database/       → DataSource configuration, seed script
interfaces/     → IRepository, IService, IController contracts
middleware/     → Auth, RBAC, validation, error handling
config/        → Environment, auth, OpenAI setup
utils/         → ID generation, helpers
```

### Middleware Chain
```
Request → CORS → Logger → JSON → Rate Limiter → Auth → RBAC → Zod Validation → Controller → Error Handler
```

### Error Handling
- Always use `AppError` class with status code
- Global error handler catches all, returns JSON `{ error, message, statusCode }`
- Never expose stack traces in production

## Frontend Patterns (`apps/web`)
- **Routing**: TanStack Router (file-based, type-safe)
- **State**: TanStack React Query for server state, React context for auth
- **UI**: shadcn/ui components + Tailwind CSS
- **Charts**: Recharts for OGWI visualizations
- **API calls**: Centralized API client with auth headers

## Database
- **TypeORM entities** at `apps/api/src/entities/`
- **DataSource config** at `apps/api/src/database/data-source.ts`
- Synchronize: enabled in development (`synchronize: true`)
- Seed: `npm run db:seed` from `apps/api`

## Key Domain Concepts
- **OGWI**: Omega GlobalWatch Index (1-5 scale, crisis levels)
- **Simulations**: "Ask Omega" — AI-powered analysis via OpenAI Assistants API
- **Early Warning**: Regional risk scores (0-1 scale)
- **Knowledge Base**: Articles with keyword matching for context injection
- **Agents**: Background scheduled tasks (OGWI updates, cleanup)

## OGWI Thresholds
- ≥ 4.5 = CATASTROPHIC
- ≥ 4.0 = CRITICAL
- ≥ 3.5 = HIGH
- ≥ 2.5 = ELEVATED
- < 2.5 = STABLE

## Regional Variance (from global OGWI)
- Middle East: +0.4
- Africa: +0.35
- Americas: -0.2
- Europe: -0.15
- APAC: -0.05

## Commands
- `npm run dev` — Start all apps in dev mode
- `npm run build` — Build all packages
- `cd apps/api && npm run db:seed` — Seed database
- `docker-compose up postgres` — Start PostgreSQL only

## Reference Project
- **Always reference `omega-nova-old`** for UI design, features, and user flows
- We are rebuilding the same product with a new tech stack
- The UI should match the old project's look and feel (dark military/defense theme)
- Old project path: `E:/Mercury sols/omega-nova/omega-nova-old/ask-omega-nova/`

## UI Components
- **shadcn/ui** components in `apps/web/src/components/ui/`
- `components.json` configured at `apps/web/components.json`
- Always use shadcn/ui components (Button, Card, Input, Label, Badge, Progress, etc.)
- Import from `@/components/ui/<component>`

## Session Continuity
- Check `omega-nova-progress.md` at start of every session
- Update it at the end of every session with: what was done, what's next
