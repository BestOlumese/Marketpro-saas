# AGENTS.md — MarketPro AI Development Instructions

> This is the root instruction file for Claude Code.
> Read this entire file before writing a single line of code.
> Then read the sub-doc for the current phase before starting work.

---

## What This App Is

MarketPro is a SaaS POS and inventory management platform built for small supermarkets and market shops in Nigeria and West Africa. It is a web app (PWA) built with Next.js 15, targeting shop owners, managers, and cashiers.

---

## The Golden Rules — Never Break These

1. **Never guess. If you are unsure about any requirement, any file location, any design decision, or any business logic — STOP and ask before writing code.**
2. **Never create a file that is not in the current phase doc.** If a file is not listed, ask first.
3. **Never install a package not listed in the current phase doc.** Ask first.
4. **Never modify a file outside the current phase scope** unless it is a direct import/export correction.
5. **Never use `any` in TypeScript.** Ever. If you cannot type something, ask.
6. **Never write inline styles.** All styling goes through Tailwind CSS v4 utility classes.
7. **Never use `console.log` in production code.** Use the logger utility defined in `lib/logger.ts`.
8. **Never hardcode strings that appear in the UI.** All UI text goes in `lib/constants/copy.ts`.
9. **Never commit code.** The developer commits manually.
10. **Always read the relevant sub-doc before starting any feature or concern.**

---

## Sub-Documents Index

Read the relevant sub-doc before starting any work in that area.

### Concern docs — always applicable
| File | Covers |
|------|--------|
| `concerns/STYLES.md` | Tailwind v4, shadcn/ui, design tokens, component patterns |
| `concerns/DB.md` | Neon Postgres, Drizzle ORM, schema rules, query patterns |
| `concerns/AUTH.md` | Clerk setup, roles, middleware, protected routes |
| `concerns/OFFLINE.md` | Dexie.js, what works offline, sync rules |
| `concerns/API.md` | Next.js API routes, server actions, error handling |
| `concerns/AI.md` | Claude API integration, prompts, streaming, usage rules |
| `concerns/PAYMENTS.md` | Paystack subscriptions, webhooks, plan gating |
| `concerns/TESTING.md` | Testing rules, what to test, how to structure tests |

### Phase docs — one at a time
| File | Phase |
|------|-------|
| `phases/PHASE-1-FOUNDATION.md` | Project setup, auth, DB, deploy skeleton |
| `phases/PHASE-2-INVENTORY.md` | Products, categories, suppliers, stock alerts |
| `phases/PHASE-3-POS.md` | Checkout, cart, payment methods, receipts |
| `phases/PHASE-4-REPORTS.md` | Sales reports, staff performance, exports |
| `phases/PHASE-5-STAFF.md` | Staff accounts, shifts, permissions |
| `phases/PHASE-6-PAYMENTS.md` | Paystack billing, plan tiers, webhooks |
| `phases/PHASE-7-AI.md` | Claude AI features, forecasting, assistant |
| `phases/PHASE-8-WHATSAPP.md` | WhatsApp receipts, alerts, digest |
| `phases/PHASE-9-POLISH.md` | PWA, performance, offline screen, final QA |

### Feature docs — reference when building that feature
| File | Feature |
|------|---------|
| `features/INVENTORY.md` | Full inventory feature spec |
| `features/POS.md` | Full POS checkout feature spec |
| `features/REPORTS.md` | Full reports feature spec |
| `features/STAFF.md` | Full staff management spec |
| `features/LOYALTY.md` | Customer loyalty / points system |
| `features/SUPPLIERS.md` | Supplier management spec |

---

## Tech Stack — Exact Versions

```
Framework:        Next.js 15 (App Router, TypeScript strict)
Language:         TypeScript 5.x — strict mode ON
Styling:          Tailwind CSS v4
Components:       shadcn/ui (latest)
Database:         Neon Postgres (serverless)
ORM:              Drizzle ORM + drizzle-kit
Auth:             Clerk (latest)
State (server):   TanStack Query v5
State (client):   Zustand v5
Offline:          Dexie.js v4
Payments:         Paystack
WhatsApp:         Twilio WhatsApp API
AI:               Anthropic Claude API (claude-sonnet-4-6)
Deployment:       DigitalOcean App Platform
```

When in doubt about a version, check the official docs URL provided in the relevant sub-doc. Do not assume a version from training data.

---

## Folder Structure — Absolute Law

```
marketpro/
├── AGENTS.md
├── concerns/
├── features/
├── phases/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── inventory/
│   │   ├── pos/
│   │   ├── reports/
│   │   ├── staff/
│   │   ├── suppliers/
│   │   ├── settings/
│   │   └── ai/
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── clerk/
│   │   │   └── paystack/
│   │   ├── inventory/
│   │   ├── pos/
│   │   ├── reports/
│   │   ├── ai/
│   │   └── whatsapp/
│   ├── offline/
│   ├── globals.css
│   ├── layout.tsx
│   └── not-found.tsx
├── components/
│   ├── ui/
│   ├── shared/
│   │   ├── AppShell.tsx
│   │   ├── PageHeader.tsx
│   │   ├── DataTable.tsx
│   │   ├── StatusBadge.tsx
│   │   └── OfflineBanner.tsx
│   ├── inventory/
│   ├── pos/
│   ├── reports/
│   ├── staff/
│   └── ai/
├── lib/
│   ├── db/
│   │   ├── index.ts
│   │   └── schema/
│   │       ├── index.ts
│   │       ├── shops.ts
│   │       ├── products.ts
│   │       ├── sales.ts
│   │       ├── staff.ts
│   │       ├── suppliers.ts
│   │       ├── inventory.ts
│   │       └── customers.ts
│   ├── dexie/
│   │   ├── db.ts
│   │   └── sync.ts
│   ├── clerk/
│   │   └── helpers.ts
│   ├── paystack/
│   │   └── client.ts
│   ├── anthropic/
│   │   └── client.ts
│   ├── twilio/
│   │   └── whatsapp.ts
│   ├── constants/
│   │   ├── copy.ts
│   │   ├── plans.ts
│   │   └── routes.ts
│   ├── hooks/
│   │   ├── useOnlineStatus.ts
│   │   ├── useCurrentShop.ts
│   │   └── useUserRole.ts
│   ├── validations/
│   ├── utils/
│   │   └── formatters.ts
│   └── logger.ts
├── store/
│   ├── cartStore.ts
│   ├── sessionStore.ts
│   └── offlineStore.ts
├── types/
│   └── index.ts
├── middleware.ts
├── drizzle.config.ts
├── next.config.ts
└── .env.example
```

**Rules:**
- Never create a folder or file outside this structure without asking.
- Never put business logic in a component. Components render. Logic lives in `lib/`.
- Never put DB queries in API routes directly. Queries go in `lib/db/queries/` files.
- `components/ui/` is owned by shadcn. Never edit those files manually.

---

## TypeScript Rules

- Strict mode is ON. No exceptions.
- No `any`. Use `unknown` and narrow, or define a proper type.
- All API route request/response bodies must have a Zod schema in `lib/validations/`.
- All Drizzle query results must be typed using `typeof schema.$inferSelect`.
- All server action return types must be explicitly declared.

```typescript
// CORRECT
const product: typeof products.$inferSelect = await db.query.products.findFirst(...)

// WRONG
const product: any = await db.query.products.findFirst(...)
```

---

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Components | PascalCase | `ProductCard.tsx` |
| Hooks | camelCase with `use` prefix | `useOnlineStatus.ts` |
| Utilities | camelCase | `formatCurrency.ts` |
| Zod schemas | camelCase with `Schema` suffix | `productSchema.ts` |
| Drizzle tables | camelCase plural | `products`, `saleItems` |
| API routes | kebab-case folders | `/api/sale-items/` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_PRODUCTS_STARTER` |
| Types/Interfaces | PascalCase | `type Product` |
| Zustand stores | camelCase with `Store` suffix | `cartStore.ts` |

---

## Standard API Response Type

```typescript
// types/index.ts
export type ApiSuccess<T> = { success: true; data: T }
export type ApiError = { success: false; error: string; code?: string }
export type ApiResponse<T> = ApiSuccess<T> | ApiError
```

---

## Error Handling Rules

- Every API route must return a typed error response, never throw unhandled.
- Every server action must be wrapped in try/catch.
- Client-side errors must be caught and shown via shadcn `toast` — never `alert()`.

---

## What To Do When Stuck

If you hit any of these situations, **stop and ask the developer**:

- A required package is not installed and not in the phase doc
- A type cannot be resolved without using `any`
- A file needs to be created that is not in the folder structure
- Business logic is unclear
- A third-party API behaves unexpectedly
- The design requirement is ambiguous
- You would need to modify a file from a previous phase to proceed

Do not attempt to solve these silently. State what you found, what you need, and wait.

---

## How To Start Each Session

1. Read `AGENTS.md` (this file)
2. Read the current phase doc from `phases/`
3. Read any concern docs relevant to the task
4. State what you are about to build and which files you will create/modify
5. Wait for confirmation before writing any code

---

*Current phase: PHASE-1-FOUNDATION*
