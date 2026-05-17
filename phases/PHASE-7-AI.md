# PHASE-7-AI.md — AI Features

> Read AGENTS.md + concerns/AI.md before starting.
> Do not start until Phase 6 is complete.

---

## Goal

Claude API integration: natural language query, demand forecasting, anomaly detection, pricing suggestions, weekly digest.

---

## Packages To Install

```bash
npm install @anthropic-ai/sdk
```

---

## Build Order

### Section 1 — Claude client & prompts
- [ ] `lib/anthropic/client.ts`
- [ ] `lib/anthropic/prompts.ts`

### Section 2 — API routes
- [ ] `app/api/ai/query/route.ts` (streaming)
- [ ] `app/api/ai/forecast/route.ts`
- [ ] `app/api/ai/anomalies/route.ts`
- [ ] `app/api/ai/pricing/route.ts`
- [ ] `app/api/ai/digest/route.ts`

### Section 3 — Components
- [ ] `components/ai/AIChatPanel.tsx`
- [ ] `components/ai/AIMessage.tsx`
- [ ] `components/ai/ForecastCard.tsx`
- [ ] `components/ai/AnomalyAlert.tsx`
- [ ] `components/ai/PricingSuggestion.tsx`

### Section 4 — Page
- [ ] `app/(dashboard)/ai/page.tsx`

---

## Definition of Done — Phase 7

- [ ] Natural language query streams response
- [ ] Demand forecast works per product
- [ ] Anomaly detection flags unusual discounts
- [ ] AI blocked on Starter plan
- [ ] Query count tracked per shop per month
- [ ] `npm run build` passes
