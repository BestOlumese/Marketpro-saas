# AI.md — Claude API Integration

> Official docs: https://docs.anthropic.com/en/api/getting-started

---

## Model

Always use: `claude-sonnet-4-6`
Never use any other model string without asking the developer first.

---

## Environment Variables

```bash
ANTHROPIC_API_KEY=
```

---

## Client Setup

```typescript
// lib/anthropic/client.ts
import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})
```

---

## Streaming Pattern

```typescript
// app/api/ai/query/route.ts
import { anthropic } from '@/lib/anthropic/client'
import { SYSTEM_PROMPTS } from '@/lib/anthropic/prompts'

export async function POST(req: Request) {
  const { question, shopId } = await req.json()
  await requireRole(['org:admin', 'org:manager'])

  // 1. Check plan quota first
  // 2. Fetch sales context (last 30 days summary — no PII)
  // 3. Stream response

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPTS.queryAssistant(context),
    messages: [{ role: 'user', content: question }],
  })

  return new Response(stream.toReadableStream())
}
```

---

## Rules

- Always include shop sales context in system prompt — never raw PII
- Never send customer names or phone numbers to the API
- Always check plan quota before processing — reject if over limit
- Track usage: increment `aiQueriesUsed` in subscriptions table after each call
- Max tokens: 1024 for queries, 2048 for weekly digest
- Always wrap in try/catch

---

## Prompts — All In `lib/anthropic/prompts.ts`

Never write prompts inline in route files.

```typescript
// lib/anthropic/prompts.ts
export const SYSTEM_PROMPTS = {
  queryAssistant: (context: string) =>
    `You are a helpful business assistant for a Nigerian supermarket using MarketPro.
Answer questions about sales, inventory, and performance in clear simple English.
Format currency as Nigerian Naira (₦).
Shop data: ${context}`,

  demandForecast: (productData: string) =>
    `Analyse this product's sales history and predict restock needs.
Respond with: recommended_restock_quantity, next_stockout_date, confidence.
Product data: ${productData}`,

  weeklyDigest: (weekData: string) =>
    `Generate a friendly weekly business summary for a Nigerian shop owner.
Keep it short, use bullet points, highlight wins and concerns.
Data: ${weekData}`,
}
```

---

## Plan Quota Enforcement

```typescript
// Before every AI API call
const shop = await getShopSubscription(shopId)
const plan = PLANS[shop.plan]

if (plan.aiQueries !== Infinity && shop.aiQueriesUsed >= plan.aiQueries) {
  return NextResponse.json(
    { success: false, error: 'AI query limit reached. Upgrade to Pro for unlimited queries.' },
    { status: 403 }
  )
}
```
