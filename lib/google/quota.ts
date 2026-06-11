import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { shops } from '@/lib/db/schema'
import { PLANS } from '@/lib/constants/plans'
import type { PlanName } from '@/lib/constants/plans'

interface QuotaResult {
  allowed: boolean
  used: number
  max: number | typeof Infinity
  error?: string
}

export async function checkAndIncrementAiQuota(shopId: string): Promise<QuotaResult> {
  const shop = await db.query.shops.findFirst({
    where: eq(shops.id, shopId),
    columns: { plan: true, aiQueriesUsed: true, aiQueriesResetAt: true },
  })

  if (!shop) return { allowed: false, used: 0, max: 0, error: 'Shop not found' }

  const plan = shop.plan as PlanName
  const max  = PLANS[plan].aiQueries

  if (max === 0) {
    return { allowed: false, used: 0, max: 0, error: 'AI features require a Growth or Pro plan.' }
  }

  const now     = new Date()
  const resetAt = shop.aiQueriesResetAt
  const needsReset = !resetAt || resetAt.getMonth() !== now.getMonth() || resetAt.getFullYear() !== now.getFullYear()

  const used = needsReset ? 0 : (shop.aiQueriesUsed ?? 0)

  if (max !== Infinity && used >= max) {
    return {
      allowed: false,
      used,
      max,
      error: `AI query limit reached (${used}/${max} this month). Upgrade to Pro for unlimited queries.`,
    }
  }

  await db.update(shops).set({
    aiQueriesUsed:    used + 1,
    aiQueriesResetAt: needsReset ? now : undefined,
    updatedAt:        now,
  }).where(eq(shops.id, shopId))

  return { allowed: true, used: used + 1, max }
}
