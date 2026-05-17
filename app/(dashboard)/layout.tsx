import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { shops, staff } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { clerkClient } from '@clerk/nextjs/server'
import { AppShell } from '@/components/shared/AppShell'
import { SyncOnMount } from '@/components/shared/SyncOnMount'
import { logger } from '@/lib/logger'
import { ROUTES } from '@/lib/constants/routes'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId, orgId } = await auth()
  if (!userId) redirect(ROUTES.SIGN_IN)
  if (!orgId) redirect('/sign-up/tasks/choose-organization')

  // Webhook fallback — create shop + staff if webhook missed it
  try {
    const client = await clerkClient()

    let shop = await db.query.shops.findFirst({
      where: eq(shops.clerkOrgId, orgId),
    })

    if (!shop) {
      const org = await client.organizations.getOrganization({ organizationId: orgId })
      const [newShop] = await db
        .insert(shops)
        .values({
          clerkOrgId: orgId,
          ownerId: userId,
          name: org.name,
          plan: 'starter',
          planStatus: 'active',
        })
        .returning()
      shop = newShop
      logger.info('Shop created via fallback', { orgId })
    }

    const existingStaff = await db.query.staff.findFirst({
      where: eq(staff.clerkUserId, userId),
    })

    if (!existingStaff && shop) {
      const user = await client.users.getUser(userId)
      const memberships = await client.organizations.getOrganizationMembershipList({
        organizationId: orgId,
      })
      const membership = memberships.data.find((m) => m.publicUserData?.userId === userId)
      const role = (membership?.role ?? 'org:admin') as 'org:admin' | 'org:manager' | 'org:cashier'
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
      const email = user.emailAddresses[0]?.emailAddress ?? ''

      await db.insert(staff).values({
        shopId: shop.id,
        clerkUserId: userId,
        name: fullName || email,
        email,
        role,
      })
      logger.info('Staff created via fallback', { userId })
    }
  } catch (error) {
    logger.error('Fallback init failed', error)
  }

  return (
    <AppShell>
      <SyncOnMount />
      {children}
    </AppShell>
  )
}
