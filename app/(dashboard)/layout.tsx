import { Suspense } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq, and, isNull } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { staff, shops, member } from '@/lib/db/schema'
import { AppShell } from '@/components/shared/AppShell'
import { SyncOnMount } from '@/components/shared/SyncOnMount'
import { WelcomeToast } from '@/components/shared/WelcomeToast'
import { logger } from '@/lib/logger'
import { ROUTES } from '@/lib/constants/routes'
import { canAccessRoute, ROLE_DEFAULT_ROUTE } from '@/lib/constants/roles'
import type { UserRole } from '@/types'

function mapBARole(baRole: string): UserRole {
  if (baRole === 'owner')             return 'owner'
  if (baRole === 'admin')             return 'manager'
  if (baRole === 'accountant')        return 'accountant'
  if (baRole === 'inventory_manager') return 'inventory_manager'
  return 'cashier'
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({ headers: reqHeaders })
  if (!session?.user) redirect(ROUTES.SIGN_IN)

  // Primary check: user already has a staff record
  let staffMember = await db.query.staff.findFirst({
    where: and(eq(staff.userId, session.user.id), isNull(staff.deletedAt)),
  })

  // Fallback: user was invited via BA — check org membership and auto-create staff record
  if (!staffMember) {
    try {
      const baMembership = await db.query.member.findFirst({
        where: eq(member.userId, session.user.id),
      })

      if (baMembership) {
        const shop = await db.query.shops.findFirst({
          where: eq(shops.betterAuthOrgId, baMembership.organizationId),
        })

        if (shop) {
          await db.insert(staff).values({
            shopId:  shop.id,
            userId:  session.user.id,
            name:    session.user.name,
            email:   session.user.email,
            role:    mapBARole(baMembership.role),
          })
          staffMember = await db.query.staff.findFirst({
            where: and(eq(staff.userId, session.user.id), isNull(staff.deletedAt)),
          })
          logger.info('Staff record auto-created from BA membership', { userId: session.user.id })
        }
      }
    } catch (err) {
      logger.error('BA membership fallback failed', err)
    }

    if (!staffMember) redirect(ROUTES.ONBOARDING)
  }

  // ── Role-based route protection ─────────────────────────────────────────────
  const h = await headers()
  const pathname = h.get('x-pathname') ?? '/'
  const role = staffMember.role as UserRole

  if (!canAccessRoute(role, pathname)) {
    // Redirect to profile page if blocked path is under /settings, else to role default
    const target = pathname.startsWith('/settings')
      ? ROUTES.SETTINGS_PROFILE
      : ROLE_DEFAULT_ROUTE[role]
    redirect(target)
  }

  // Owner-only: billing page
  if (pathname.startsWith(ROUTES.SETTINGS_BILLING) && role !== 'owner') {
    redirect(ROUTES.SETTINGS)
  }

  // Owner + manager only: team settings
  if (pathname.startsWith(ROUTES.SETTINGS_TEAM) && role !== 'owner' && role !== 'manager') {
    redirect(ROUTES.SETTINGS_PROFILE)
  }
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <AppShell>
      <SyncOnMount />
      <Suspense>
        <WelcomeToast />
      </Suspense>
      {children}
    </AppShell>
  )
}
