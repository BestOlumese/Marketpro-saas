# PHASE-1-FOUNDATION.md — Project Setup & Foundation

> Read AGENTS.md first, then this file.
> Do not start any Phase 2 work until Phase 1 is complete and confirmed.

---

## Goal

Bootstrap MarketPro with a working skeleton: auth, database, folder structure, deployment config, and a visible dashboard shell. No real features yet.

---

## Packages To Install

```bash
# Create app
npx create-next-app@latest marketpro \
  --typescript --tailwind --eslint --app \
  --src-dir=no --import-alias="@/*"

# Dependencies
npm install @clerk/nextjs
npm install drizzle-orm @neondatabase/serverless
npm install drizzle-kit --save-dev
npm install zod
npm install @tanstack/react-query
npm install zustand
npm install dexie
npm install lucide-react

# shadcn
npx shadcn@latest init
npx shadcn@latest add button input label card badge dialog sheet sonner dropdown-menu separator skeleton tooltip table form select textarea
```

Do not install anything not listed above. Ask first.

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
DATABASE_URL=
DATABASE_URL_UNPOOLED=
```

---

## Build Order — Work Section By Section, Confirm Each

### Section 1 — Config files
- [ ] `next.config.ts`
- [ ] `drizzle.config.ts`
- [ ] `.env.example` (all vars listed, values blank)
- [ ] `tsconfig.json` (confirm strict: true)
- [ ] `app/globals.css` (Tailwind v4 @theme tokens)

### Section 2 — Types & constants
- [ ] `types/index.ts` — ApiSuccess, ApiError, ApiResponse, UserRole
- [ ] `lib/constants/routes.ts`
- [ ] `lib/constants/copy.ts`
- [ ] `lib/constants/plans.ts`
- [ ] `lib/logger.ts`
- [ ] `lib/utils/formatters.ts` — formatCurrency, formatDate, formatNumber

### Section 3 — Database
- [ ] `lib/db/index.ts`
- [ ] `lib/db/schema/shops.ts`
- [ ] `lib/db/schema/staff.ts`
- [ ] `lib/db/schema/index.ts`
- [ ] Run `npx drizzle-kit push` to create tables

### Section 4 — Auth
- [ ] `proxy.ts` no longer middleware.ts
- [ ] `lib/clerk/helpers.ts`
- [ ] `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- [ ] `app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- [ ] `app/api/webhooks/clerk/route.ts`

### Section 5 — App shell
- [ ] `app/layout.tsx` (ClerkProvider + QueryProvider + Toaster)
- [ ] `app/(dashboard)/layout.tsx` (sidebar + topbar)
- [ ] `app/(dashboard)/dashboard/page.tsx` (placeholder metrics)
- [ ] `app/offline/page.tsx`
- [ ] `app/not-found.tsx`
- [ ] `app/page.tsx` (landing page with smooth scroll navigation, and sections for features, pricing,FAQ, login, signup, contact)
- [ ] `app/onboarding/page.tsx`
- [ ] `app/api/onboarding/route.ts`

### Section 6 — Shared components
- [ ] `components/shared/AppShell.tsx`
- [ ] `components/shared/PageHeader.tsx`
- [ ] `components/shared/OfflineBanner.tsx`
- [ ] `components/shared/QueryProvider.tsx`

### Section 7 — Providers & hooks
- [ ] `store/offlineStore.ts`
- [ ] `lib/hooks/useOnlineStatus.ts`
- [ ] `lib/hooks/useCurrentShop.ts`
- [ ] `lib/hooks/useUserRole.ts`
- [ ] `lib/dexie/db.ts`

---

## Sidebar Nav Items

```typescript
const navItems = [
  { label: 'Dashboard',  href: '/dashboard',           icon: LayoutDashboard },
  { label: 'POS',        href: '/dashboard/pos',        icon: ShoppingCart },
  { label: 'Inventory',  href: '/dashboard/inventory',  icon: Package },
  { label: 'Reports',    href: '/dashboard/reports',    icon: BarChart3 },
  { label: 'Staff',      href: '/dashboard/staff',      icon: Users },
  { label: 'Suppliers',  href: '/dashboard/suppliers',  icon: Truck },
  { label: 'AI',         href: '/dashboard/ai',         icon: Sparkles },
  { label: 'Settings',   href: '/dashboard/settings',   icon: Settings },
]
```

---

## Definition of Done — Phase 1

- [ ] `npm run build` passes with zero TypeScript errors
- [ ] `npm run lint` passes with zero errors
- [ ] Sign up creates a Clerk user and shop record in Neon
- [ ] Sign in redirects to `/dashboard`
- [ ] Sidebar renders all nav items
- [ ] `/offline` page renders
- [ ] Protected routes redirect to `/sign-in` when signed out
- [ ] DB connection confirmed
- [ ] Deployed to DigitalOcean App Platform

---

## DigitalOcean Deployment

- Build command: `npm run build`
- Run command: `npm start`
- Node version: 20.x
- Set all env vars in DO dashboard
- Do NOT use DO managed database — Neon is the DB

---

## What NOT To Build In Phase 1

No product forms. No POS. No reports. No payments. No AI. No WhatsApp.
If you are building any of those, stop — you are in the wrong phase.
