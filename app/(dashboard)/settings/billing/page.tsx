'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle2, Loader2, AlertCircle, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePlan } from '@/lib/hooks/usePlan'
import { BILLING } from '@/lib/constants/copy'
import { PLANS } from '@/lib/constants/plans'
import { formatCurrency } from '@/lib/utils/formatters'
import type { ApiResponse } from '@/types'
import type { Subscription } from '@/lib/db/schema'

interface PortalData {
  plan: string
  planStatus: string
  subscription: Subscription | null
}

const PLAN_PRICES: Record<string, string> = {
  starter: 'Free',
  growth:  '₦9,900/mo',
  pro:     '₦19,900/mo',
}

const STATUS_STYLES: Record<string, string> = {
  active:    'bg-brand-light text-brand border-brand/20',
  past_due:  'bg-amber-50 text-amber-700 border-amber-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  trialing:  'bg-blue-50 text-blue-700 border-blue-200',
}

const STATUS_LABELS: Record<string, string> = {
  active:    BILLING.STATUS_ACTIVE,
  past_due:  BILLING.STATUS_PAST_DUE,
  cancelled: BILLING.STATUS_CANCELLED,
  trialing:  BILLING.STATUS_TRIALING,
}

async function fetchPortal(): Promise<PortalData> {
  const res = await fetch('/api/billing/portal')
  const json: ApiResponse<PortalData> = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data
}

async function startCheckout(plan: 'growth' | 'pro'): Promise<string> {
  const res = await fetch('/api/billing/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  })
  const json: ApiResponse<{ checkoutUrl: string }> = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data.checkoutUrl
}

async function cancelSubscription(): Promise<void> {
  const res = await fetch('/api/billing/portal', { method: 'DELETE' })
  const json: ApiResponse<null> = await res.json()
  if (!json.success) throw new Error(json.error)
}

export default function BillingPage() {
  const qc = useQueryClient()
  const { plan: currentPlan } = usePlan()
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [upgradingTo, setUpgradingTo] = useState<'growth' | 'pro' | null>(null)

  const { data: portal, isLoading } = useQuery({
    queryKey: ['billing', 'portal'],
    queryFn: fetchPortal,
  })

  const upgradeMutation = useMutation({
    mutationFn: (plan: 'growth' | 'pro') => startCheckout(plan),
    onSuccess: (url) => {
      window.location.href = url
    },
    onError: (err: Error) => {
      toast.error(err.message || BILLING.SUBSCRIBE_ERROR)
      setUpgradingTo(null)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      toast.success(BILLING.CANCEL_SUCCESS)
      qc.invalidateQueries({ queryKey: ['billing'] })
      qc.invalidateQueries({ queryKey: ['me', 'shop'] })
      setConfirmCancel(false)
    },
    onError: (err: Error) => {
      toast.error(err.message || BILLING.CANCEL_ERROR)
    },
  })

  const planStatus = portal?.planStatus ?? 'active'
  const subscription = portal?.subscription

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-4 lg:p-6">
      <div>
        <h1 className="text-xl font-semibold text-brand">{BILLING.TITLE}</h1>
        <p className="mt-0.5 text-sm text-zinc-500">{BILLING.DESCRIPTION}</p>
      </div>

      {/* Current plan card */}
      <div className="rounded-lg border border-brand/20 bg-brand-light p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
              <Crown className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="text-xs text-brand/70">{BILLING.CURRENT_PLAN}</p>
              <p className="text-lg font-bold text-brand capitalize">{currentPlan}</p>
              <p className="text-sm text-brand/70">{PLAN_PRICES[currentPlan]}</p>
            </div>
          </div>
          <Badge variant="outline" className={STATUS_STYLES[planStatus] ?? STATUS_STYLES.active}>
            {STATUS_LABELS[planStatus] ?? planStatus}
          </Badge>
        </div>

        {subscription?.currentPeriodEnd && (
          <p className="mt-4 text-xs text-brand/70">
            {planStatus === 'cancelled' ? 'Access until' : BILLING.NEXT_BILLING}:{' '}
            <span className="font-medium">
              {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-NG', { dateStyle: 'medium' })}
            </span>
            {planStatus === 'cancelled' && (
              <span className="ml-1 text-zinc-500">— will downgrade to Starter after this date</span>
            )}
          </p>
        )}
      </div>

      {/* Usage */}
      {currentPlan === 'starter' && (
        <div className="rounded-lg border border-zinc-200 bg-white p-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-700">Plan limits</h2>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">{BILLING.USAGE_PRODUCTS}</span>
            <span className="font-medium text-zinc-900">{PLANS.starter.maxProducts} max</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">{BILLING.USAGE_STAFF}</span>
            <span className="font-medium text-zinc-900">{PLANS.starter.maxStaff} max</span>
          </div>
        </div>
      )}

      {/* Upgrade plans */}
      {currentPlan !== 'pro' && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-700">Available plans</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {(['growth', 'pro'] as const)
              .filter((p) => p !== currentPlan && !(currentPlan === 'growth' && p === 'growth'))
              .map((plan) => {
                const features = plan === 'growth' ? BILLING.PLAN_FEATURES_GROWTH : BILLING.PLAN_FEATURES_PRO
                const isLoading = upgradeMutation.isPending && upgradingTo === plan

                return (
                  <div
                    key={plan}
                    className={`rounded-lg border p-5 space-y-4 ${plan === 'growth' ? 'border-brand/30 bg-white' : 'border-brand bg-brand-light'}`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-zinc-900 capitalize">{plan}</p>
                        {plan === 'pro' && (
                          <Badge variant="outline" className="bg-brand text-white border-brand text-xs">Popular</Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-brand mt-1">{PLAN_PRICES[plan]}</p>
                    </div>
                    <ul className="space-y-2">
                      {features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-zinc-600">
                          <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full bg-brand hover:bg-brand-dark text-white"
                      disabled={upgradeMutation.isPending}
                      onClick={() => {
                        setUpgradingTo(plan)
                        upgradeMutation.mutate(plan)
                      }}
                    >
                      {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{BILLING.UPGRADING}</>
                      ) : (
                        plan === 'growth' ? BILLING.UPGRADE_TO_GROWTH : BILLING.UPGRADE_TO_PRO
                      )}
                    </Button>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Cancel */}
      {currentPlan !== 'starter' && (
        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-700 mb-1">Danger zone</h2>
          <p className="text-xs text-zinc-500 mb-4">
            Your plan stays active until the end of your billing period, then downgrades to Starter. No refunds for partial months.
          </p>

          {confirmCancel ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {BILLING.CANCEL_CONFIRM}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setConfirmCancel(false)}
                  disabled={cancelMutation.isPending}
                >
                  Keep subscription
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{BILLING.CANCELLING}</>
                  ) : BILLING.CANCEL_SUBSCRIPTION}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => setConfirmCancel(true)}
              disabled={isLoading}
            >
              {BILLING.CANCEL_SUBSCRIPTION}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
