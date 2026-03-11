# Omega Nova - Project Conventions

## Architecture
- **Monorepo**: Turborepo with npm workspaces
- **Backend**: NestJS + TypeScript (`apps/api`)
- **Frontend**: React + Vite + TypeScript (`apps/web`)
- **Shared**: Types, constants, utils (`packages/shared` → `@omega-nova/shared`)
- **Database**: PostgreSQL + TypeORM
- **Auth**: BetterAuth with PostgreSQL (session-based, mounted as NestJS middleware)

## Current Milestone: M1 — Foundation & Infrastructure (9 days)
- NestJS backend with BetterAuth auth (login, register, session management)
- PostgreSQL connected + schema migrated
- Redis configured for simulation job queue (ready for Phase 2)
- Secrets management — no credentials exposed
- React + Vite frontend shell deployed to Vercel
- Full design system replicated (pixel-perfect match to old project)
- Auth flow working end-to-end (frontend → backend → database)
- Dev and staging environments live

## Code Style
- **TypeScript strict mode** everywhere
- **Classes with decorators** — NestJS modules, controllers, services, guards
- **Pattern**: Module → Controller → Service → TypeORM Repository
- **Naming**: PascalCase for classes/interfaces, camelCase for methods/variables
- **Imports**: Use `@omega-nova/shared` for shared types, never relative cross-package imports

## Backend Patterns (`apps/api`)

### NestJS Module Structure
```
src/
├── main.ts                    (NestJS bootstrap, CORS, global prefix /api)
├── app.module.ts              (root module, TypeORM, Config, all feature modules)
├── health.controller.ts       (GET /api/health)
├── config/
│   ├── auth.ts                (BetterAuth config — session-based, email+password)
│   ├── env.ts                 (legacy env loader used by auth.ts)
│   ├── env.validation.ts      (Zod schema for NestJS ConfigModule)
│   └── openai.ts              (OpenAI client)
├── entities/                   (14 TypeORM entity classes — unchanged from Express)
├── database/
│   ├── data-source.ts         (TypeORM DataSource — used by auth.ts databaseHooks)
│   └── seed.ts                (data seeding script)
├── utils/
│   └── id.ts                  (createId() — cuid-like ID generation)
├── modules/
│   ├── auth/                   (BetterAuth middleware + global guards)
│   ├── users/                  (user CRUD, role/module management)
│   ├── ogwi/                   (OGWI scores, historical, forecast, trigger update)
│   ├── simulations/            (AI simulations via OpenAI Assistants API)
│   ├── early-warning/          (regional risk scores)
│   ├── knowledge/              (knowledge base articles, search)
│   ├── agents/                 (background agent config, audit logs)
│   ├── notifications/          (user notifications)
│   ├── admin/                  (stats, audit logs — admin only)
│   └── scheduler/              (@nestjs/schedule cron jobs)
└── common/
    ├── guards/                 (AuthGuard, RolesGuard, ModuleGuard)
    ├── decorators/             (@Public, @Roles, @RequireModule, @CurrentUser)
    ├── filters/                (HttpExceptionFilter)
    └── interceptors/           (LoggingInterceptor)
```

### Guard Chain (replaces Express middleware)
```
Request → CORS (NestJS) → AuthGuard (BetterAuth session) → RolesGuard → ModuleGuard → Controller → HttpExceptionFilter
```

### Auth Flow
- BetterAuth mounted as NestJS middleware at `/api/auth/*`
- Global `AuthGuard` checks session via `auth.api.getSession()` for all routes
- Routes decorated with `@Public()` skip auth
- Routes decorated with `@Roles('ADMIN')` require specific role
- Routes decorated with `@RequireModule('ogwi')` require module access
- `@CurrentUser()` decorator extracts user from request

### Error Handling
- NestJS built-in exceptions: `NotFoundException`, `ForbiddenException`, `UnauthorizedException`, etc.
- Global `HttpExceptionFilter` catches all exceptions, returns JSON `{ error, message, statusCode }`
- Never expose stack traces in production

## Frontend Patterns (`apps/web`)
- **Routing**: TanStack Router (file-based, type-safe)
- **State**: TanStack React Query for server state, React context for auth
- **UI**: shadcn/ui components + Tailwind CSS
- **Charts**: Recharts for OGWI visualizations
- **API calls**: Centralized API client with auth headers (credentials: include)
- **Auth client**: BetterAuth React SDK (`useSession`, `signIn`, `signUp`, `signOut`)

## Database
- **TypeORM entities** at `apps/api/src/entities/`
- **DataSource config** at `apps/api/src/database/data-source.ts`
- Synchronize: enabled in development (`synchronize: true`)
- Seed: `npm run db:seed` from `apps/api`
- **14 entities**: User, Session, Account, Verification, OgwiHistoricalData, Osd12Composite, Simulation, KnowledgeBaseArticle, EarlyWarningData, AgentConfig, AgentAuditLog, Notification, AuditLog, ClientCompany

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
- `npm run dev` — Start all apps in dev mode (NestJS API on 3001, Vite on 5173)
- `npm run build` — Build all packages
- `cd apps/api && npm run db:seed` — Seed database
- `docker-compose up postgres` — Start PostgreSQL only
- `cd apps/api && npx tsc --noEmit` — Type-check backend

## API Routes (all under /api prefix)
```
GET    /health                      — Health check (@Public)
AUTH   /auth/*                      — BetterAuth handles (signup, signin, signout, session, password reset)
GET    /users/me                    — Current user
PATCH  /users/me                    — Update profile
GET    /users                       — List all users (ADMIN)
PATCH  /users/:id/role              — Update user role (ADMIN)
PATCH  /users/:id/modules           — Update assigned modules (ADMIN)
GET    /ogwi/current                — Current OGWI score (requires ogwi module)
GET    /ogwi/historical             — Historical OGWI data
GET    /ogwi/forecast               — OGWI forecast
POST   /ogwi/update                 — Trigger manual OGWI update (ADMIN)
GET    /simulations                 — List simulations (requires simulations module)
POST   /simulations                 — Create simulation
GET    /simulations/:id             — Get simulation details
POST   /simulations/:id/continue    — Continue simulation thread
GET    /early-warning/current       — Early warning current (requires early-warning module)
GET    /early-warning/history       — Early warning history
GET    /knowledge/search            — Search knowledge base (requires knowledge-base module)
GET    /knowledge/articles          — List all articles
POST   /knowledge/articles          — Create article (ADMIN)
GET    /agents                      — List agents (ADMIN)
POST   /agents/:id/toggle           — Toggle agent on/off (ADMIN)
POST   /agents/:id/run              — Manually run agent (ADMIN)
GET    /agents/:id/audit            — Get agent audit logs (ADMIN)
GET    /notifications               — List user notifications
PATCH  /notifications/:id/read      — Mark notification as read
GET    /admin/stats                 — Admin statistics (ADMIN)
GET    /admin/audit-logs            — Admin audit logs (ADMIN)
```

## Reference Project
- **Always reference `omega-nova-old`** for UI design, features, and user flows
- We are rebuilding the same product with a new tech stack
- The UI must be pixel-perfect match to the old project (dark military/defense theme)
- Old project path: `E:/Mercury sols/omega-nova/omega-nova-old/ask-omega-nova/`

## UI Components
- **shadcn/ui** components in `apps/web/src/components/ui/`
- `components.json` configured at `apps/web/components.json`
- Always use shadcn/ui components (Button, Card, Input, Label, Badge, Progress, etc.)
- Import from `@/components/ui/<component>`

## Session Continuity
- Check `omega-nova-progress.md` at start of every session
- Update it at the end of every session with: what was done, what's next

## Express Backup
- Old Express code backed up at `apps/api/src-express-backup/`
- Git branch `express-backup` also preserves the full Express state
