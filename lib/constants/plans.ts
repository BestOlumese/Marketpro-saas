export const PLANS = {
  starter: {
    maxProducts: 500,
    maxStaff: 2,
    maxBranches: 1,
    aiQueries: 0,
    reports: 'basic' as const,
  },
  growth: {
    maxProducts: Infinity,
    maxStaff: Infinity,
    maxBranches: 3,
    aiQueries: 50,
    reports: 'full' as const,
  },
  pro: {
    maxProducts: Infinity,
    maxStaff: Infinity,
    maxBranches: Infinity,
    aiQueries: Infinity,
    reports: 'full' as const,
  },
} as const

export type PlanName = keyof typeof PLANS

export const PLAN_ORDER: Record<PlanName, number> = {
  starter: 0,
  growth: 1,
  pro: 2,
}

export function planHasAccess(userPlan: PlanName, requiredPlan: PlanName): boolean {
  return PLAN_ORDER[userPlan] >= PLAN_ORDER[requiredPlan]
}
