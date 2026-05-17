# PHASE-6-PAYMENTS.md — Paystack Billing & Plan Gating

> Read AGENTS.md + concerns/PAYMENTS.md before starting.
> Do not start until Phase 5 is complete.

---

## Goal

Wire Paystack subscriptions, enforce plan limits, handle webhook events.

---

## Packages To Install

```bash
npm install paystack
```

---

## Build Order

### Section 1 — DB schema
- [ ] `lib/db/schema/subscriptions.ts`
- [ ] Run migration

### Section 2 — Paystack client
- [ ] `lib/paystack/client.ts`

### Section 3 — API routes
- [ ] `app/api/billing/subscribe/route.ts`
- [ ] `app/api/billing/portal/route.ts`
- [ ] `app/api/webhooks/paystack/route.ts`

### Section 4 — Plan gating
- [ ] Update `lib/constants/plans.ts`
- [ ] `lib/hooks/usePlan.ts`
- [ ] `components/shared/PlanGate.tsx`
- [ ] `components/shared/UpgradePrompt.tsx`

### Section 5 — Page
- [ ] `app/(dashboard)/settings/billing/page.tsx`

---

## Definition of Done — Phase 6

- [ ] Shop can subscribe via Paystack
- [ ] Webhook updates plan in DB
- [ ] Starter plan blocks >500 products
- [ ] AI features blocked on Starter (PlanGate)
- [ ] Billing page shows current plan
- [ ] `npm run build` passes
