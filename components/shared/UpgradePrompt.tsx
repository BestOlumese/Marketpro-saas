'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BILLING } from '@/lib/constants/copy'
import { ROUTES } from '@/lib/constants/routes'
import type { PlanName } from '@/lib/constants/plans'

interface UpgradePromptProps {
  requiredPlan?: PlanName
  description?: string
}

const PLAN_LABELS: Record<PlanName, string> = {
  starter: BILLING.PLAN_STARTER,
  growth:  BILLING.PLAN_GROWTH,
  pro:     BILLING.PLAN_PRO,
}

export function UpgradePrompt({ requiredPlan = 'growth', description }: UpgradePromptProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-brand/20 bg-brand-light px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 mb-4">
        <Lock className="h-5 w-5 text-brand" />
      </div>
      <h3 className="text-sm font-semibold text-brand">{BILLING.UPGRADE_PROMPT_TITLE}</h3>
      <p className="mt-1.5 text-sm text-zinc-500 max-w-xs">
        {description ?? `${BILLING.UPGRADE_PROMPT_DESCRIPTION} Upgrade to ${PLAN_LABELS[requiredPlan]} to unlock it.`}
      </p>
      <Link
        href={ROUTES.SETTINGS_BILLING}
        className={cn(buttonVariants({ size: 'sm' }), 'mt-5 bg-brand hover:bg-brand-dark text-white')}
      >
        View plans
      </Link>
    </div>
  )
}
