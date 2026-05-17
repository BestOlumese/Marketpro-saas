import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { shops, staff } from '@/lib/db/schema'
import type { UserRole } from '@/types'

export async function getCurrentRole(): Promise<UserRole | null> {
  const { orgRole } = await auth()
  return (orgRole as UserRole) ?? null
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

  const shop = await db.query.shops.findFirst({
    where: eq(shops.clerkOrgId, orgId),
  })
  if (!shop) throw new Error('SHOP_NOT_FOUND')
  return shop.id
}

export async function getStaffId(): Promise<string | null> {
  const { userId } = await auth()
  if (!userId) return null

  const member = await db.query.staff.findFirst({
    where: eq(staff.clerkUserId, userId),
  })
  return member?.id ?? null
}
