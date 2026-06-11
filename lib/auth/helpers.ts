import { headers } from 'next/headers'
import { eq, and, isNull } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { shops, staff } from '@/lib/db/schema'
import type { UserRole } from '@/types'

async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

export interface AuthContext {
  userId: string
  userEmail: string
  staffId: string
  shopId: string
  role: UserRole
}

export async function getAuthContext(): Promise<AuthContext> {
  const session = await getSession()
  if (!session?.user) throw new Error('UNAUTHORIZED')

  const member = await db.query.staff.findFirst({
    where: and(eq(staff.userId, session.user.id), isNull(staff.deletedAt)),
    columns: { id: true, shopId: true, role: true },
  })

  if (!member) throw new Error('SHOP_NOT_FOUND')

  return {
    userId:    session.user.id,
    userEmail: session.user.email,
    staffId:   member.id,
    shopId:    member.shopId,
    role:      member.role as UserRole,
  }
}

export async function getCurrentRole(): Promise<UserRole | null> {
  const session = await getSession()
  if (!session?.user) return null

  const member = await db.query.staff.findFirst({
    where: and(eq(staff.userId, session.user.id), isNull(staff.deletedAt)),
    columns: { role: true },
  })

  return (member?.role as UserRole) ?? null
}

export async function requireRole(allowed: UserRole[]): Promise<void> {
  const role = await getCurrentRole()
  if (!role || !allowed.includes(role)) {
    throw new Error('UNAUTHORISED')
  }
}

export async function getShopId(): Promise<string> {
  const session = await getSession()
  if (!session?.user) throw new Error('UNAUTHORIZED')

  const member = await db.query.staff.findFirst({
    where: and(eq(staff.userId, session.user.id), isNull(staff.deletedAt)),
    columns: { shopId: true },
  })

  if (!member) throw new Error('SHOP_NOT_FOUND')
  return member.shopId
}

export async function getShopWithOrg() {
  const session = await getSession()
  if (!session?.user) throw new Error('UNAUTHORIZED')

  const member = await db.query.staff.findFirst({
    where: and(eq(staff.userId, session.user.id), isNull(staff.deletedAt)),
    with: { shop: true },
  })

  if (!member?.shop) throw new Error('SHOP_NOT_FOUND')
  return member.shop
}

export async function getStaffId(): Promise<string | null> {
  const session = await getSession()
  if (!session?.user) return null

  const member = await db.query.staff.findFirst({
    where: and(eq(staff.userId, session.user.id), isNull(staff.deletedAt)),
    columns: { id: true },
  })

  return member?.id ?? null
}
