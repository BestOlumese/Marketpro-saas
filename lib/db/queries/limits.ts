import { eq, and, isNull, count } from 'drizzle-orm'
import { db } from '@/lib/db'
import { shops, products, staff } from '@/lib/db/schema'
import { PLANS } from '@/lib/constants/plans'
import type { PlanName } from '@/lib/constants/plans'

export async function getPlanForShop(shopId: string): Promise<PlanName> {
  const shop = await db.query.shops.findFirst({
    where: eq(shops.id, shopId),
    columns: { plan: true },
  })
  return (shop?.plan ?? 'starter') as PlanName
}

export async function countActiveProducts(shopId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(products)
    .where(and(eq(products.shopId, shopId), isNull(products.deletedAt)))
  return row?.value ?? 0
}

export async function countActiveStaff(shopId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(staff)
    .where(and(eq(staff.shopId, shopId), isNull(staff.deletedAt)))
  return row?.value ?? 0
}

export async function checkProductLimit(shopId: string): Promise<{
  allowed: boolean
  current: number
  max: number | typeof Infinity
}> {
  const plan = await getPlanForShop(shopId)
  const max  = PLANS[plan].maxProducts
  if (max === Infinity) return { allowed: true, current: 0, max: Infinity }
  const current = await countActiveProducts(shopId)
  return { allowed: current < max, current, max }
}

export async function checkStaffLimit(shopId: string): Promise<{
  allowed: boolean
  current: number
  max: number | typeof Infinity
}> {
  const plan = await getPlanForShop(shopId)
  const max  = PLANS[plan].maxStaff
  if (max === Infinity) return { allowed: true, current: 0, max: Infinity }
  const current = await countActiveStaff(shopId)
  return { allowed: current < max, current, max }
}
