'use client'

import { UpgradePrompt } from '@/components/shared/UpgradePrompt'
import { usePlan } from '@/lib/hooks/usePlan'
import type { PlanName } from '@/lib/constants/plans'

interface PlanGateProps {
  requiredPlan: PlanName
  children: React.ReactNode
  fallback?: React.ReactNode
  description?: string
}

export function PlanGate({ requiredPlan, children, fallback, description }: PlanGateProps) {
  const { hasAccess, isLoaded } = usePlan()

  if (!isLoaded) return null

  if (!hasAccess(requiredPlan)) {
    return <>{fallback ?? <UpgradePrompt requiredPlan={requiredPlan} description={description} />}</>
  }

  return <>{children}</>
}
