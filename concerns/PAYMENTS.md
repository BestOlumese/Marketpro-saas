# PAYMENTS.md — Paystack Integration

> Official docs: https://paystack.com/docs/api | https://paystack.com/docs/payments/subscriptions

---

## Stack: Paystack

Paystack is the payment processor. Do not use Stripe.

---

## Environment Variables

```bash
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
PAYSTACK_WEBHOOK_SECRET=
PAYSTACK_PLAN_STARTER=PLN_xxx
PAYSTACK_PLAN_GROWTH=PLN_xxx
PAYSTACK_PLAN_PRO=PLN_xxx
```

Create plan codes in the Paystack dashboard before wiring them here.

---

## Webhook Verification

```typescript
import crypto from 'crypto'

function verifyPaystackWebhook(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')
  return hash === signature
}
```

Always verify before processing. Return 400 if verification fails.

---

## Events To Handle

| Event | Action |
|-------|--------|
| `charge.success` | Activate subscription in DB |
| `subscription.create` | Record subscription |
| `subscription.disable` | Downgrade to Starter |
| `subscription.not_renew` | Warn owner, downgrade after grace period |
| `invoice.payment_failed` | Log and notify owner |

---

## Plan Limits

```typescript
// lib/constants/plans.ts
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
```

---

## Plan Gate Component

```typescript
// components/shared/PlanGate.tsx
interface PlanGateProps {
  requiredPlan: 'growth' | 'pro'
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PlanGate({ requiredPlan, children, fallback }: PlanGateProps) {
  const { plan } = usePlan()
  const planOrder = { starter: 0, growth: 1, pro: 2 }
  const hasAccess = planOrder[plan] >= planOrder[requiredPlan]
  if (!hasAccess) return fallback ?? <UpgradePrompt />
  return <>{children}</>
}
```
