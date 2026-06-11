'use client'

import { useCurrentShop } from '@/lib/hooks/useCurrentShop'
import { PLANS, PLAN_ORDER, planHasAccess } from '@/lib/constants/plans'
import type { PlanName } from '@/lib/constants/plans'

export interface PlanInfo {
  plan: PlanName
  limits: typeof PLANS[PlanName]
  isStarter: boolean
  isGrowth: boolean
  isPro: boolean
  hasAccess: (required: PlanName) => boolean
  isLoaded: boolean
}

export function usePlan(): PlanInfo {
  const { shop, isLoaded } = useCurrentShop()
  const plan: PlanName = (shop?.plan as PlanName | undefined) ?? 'starter'

  return {
    plan,
    limits:    PLANS[plan],
    isStarter: plan === 'starter',
    isGrowth:  plan === 'growth',
    isPro:     plan === 'pro',
    hasAccess: (required: PlanName) => planHasAccess(plan, required),
    isLoaded,
  }
}
