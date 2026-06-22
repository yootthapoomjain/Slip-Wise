# SlipWise

A production-ready expense tracking PWA with receipt OCR scanning, budget tracking, reports/analytics, savings goals, and Clerk authentication (email + Google). Mobile-first, dark-mode-first, premium UI.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/slipwise run dev` — run the frontend (port 18350)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` — Clerk auth
- Required env: `VITE_CLERK_PUBLISHABLE_KEY` — Clerk frontend key
- Optional env: `VITE_CLERK_PROXY_URL` — Clerk proxy URL (for custom domains)
- Optional env: `SESSION_SECRET` — session signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS + shadcn/ui + Framer Motion + Recharts + Wouter
- Auth: Clerk (email + Google OAuth)
- OCR: Tesseract.js (receipt scanning)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — DB schema (profiles, expenses, categories, budgets, goals)
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/api-client-react/` — generated React Query hooks + Zod schemas
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/slipwise/src/` — React frontend
  - `pages/` — Dashboard, Expenses, Reports, Budgets, Goals, Settings
  - `components/` — AppLayout, ExpenseForm (with OCR), ThemeProvider, shadcn UI

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed React Query hooks used throughout the frontend
- Clerk auth proxy middleware on the API server validates JWT tokens on every protected route
- Default expense categories seeded lazily on first `/api/categories` GET per user
- Receipt images stored as base64 in `artifacts/api-server/uploads/` and served at `/api/receipts/files/:filename`
- `express.json({ limit: "10mb" })` to handle base64 image payloads for OCR

## Product

- **Dashboard** — hero stats (total spent, transactions, top category), spending pie chart, recent transactions
- **Expenses** — searchable/filterable list with swipe-to-delete; add/edit with receipt OCR scanning
- **Reports** — category breakdown pie chart, spending-over-time area chart
- **Budgets** — per-category monthly budget limits with progress bars and warning states
- **Goals** — savings goals with target amounts, deadlines, and contribution tracking
- **Settings** — Clerk user profile, theme toggler, logout

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `@clerk/react/internal` does not exist — use `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY` directly for the publishable key
- `@clerk/themes` and `tesseract.js` must be installed in the slipwise package (not the workspace root)
- Do NOT use `pnpm run dev` at workspace root — run workflows via `restart_workflow` instead

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for Clerk configuration
