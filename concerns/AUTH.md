# AUTH.md — Authentication & Authorisation

> Official docs: https://clerk.com/docs/nextjs/get-started

---

## Stack: Clerk

Clerk handles all authentication. Do not build custom auth logic.

## Mental Model

```
Clerk Organisation = one Shop
Clerk User         = Owner / Manager / Cashier
Clerk Role         = org:admin | org:manager | org:cashier
```

---

## Environment Variables

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

---

## Middleware

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

---

## Role Helpers

```typescript
// lib/clerk/helpers.ts
import { auth } from '@clerk/nextjs/server'

export type UserRole = 'org:admin' | 'org:manager' | 'org:cashier'

export async function getCurrentRole(): Promise<UserRole | null> {
  const { sessionClaims } = await auth()
  return (sessionClaims?.org_role as UserRole) ?? null
}

export async function requireRole(allowed: UserRole[]): Promise<void> {
  const role = await getCurrentRole()
  if (!role || !allowed.includes(role)) {
    throw new Error('UNAUTHORISED')
  }
}

export async function getShopId(): Promise<string> {
  const { orgId } = await auth()
  if (!orgId) throw new Error('NO_ORG')
  return orgId
}
```

---

## Permission Matrix

| Action | admin | manager | cashier |
|--------|-------|---------|---------|
| Process sale | ✓ | ✓ | ✓ |
| View today's sales | ✓ | ✓ | ✓ |
| Edit products | ✓ | ✓ | ✗ |
| View all reports | ✓ | ✓ | ✗ |
| Manage staff | ✓ | ✗ | ✗ |
| Billing / settings | ✓ | ✗ | ✗ |
| AI features | ✓ | ✓ | ✗ |
| Void a sale | ✓ | ✓ | ✗ |

---

## Protecting API Routes

```typescript
export async function GET() {
  try {
    await requireRole(['org:admin', 'org:manager'])
    const shopId = await getShopId()
    // query...
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 403 })
  }
}
```

---

## Clerk Webhook — Sync to DB

Handle in `app/api/webhooks/clerk/route.ts`.

Events to handle:
- `organizationMembership.created` → create staff record
- `organizationMembership.deleted` → soft-delete staff record
- `organizationMembership.updated` → update role in DB
