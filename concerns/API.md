# API.md — API Routes & Server Actions

> Official docs: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

---

## When To Use What

| Situation | Use |
|-----------|-----|
| Form submit that mutates data | Server Action |
| Fetching data in a server component | Direct DB query |
| Fetching data from a client component | API route via TanStack Query |
| External webhook (Paystack, Clerk) | API route |
| POS sale submission | API route |

---

## API Route Pattern

```typescript
// app/api/inventory/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getShopId } from '@/lib/clerk/helpers'
import { getProductsByShop } from '@/lib/db/queries/products'
import { z } from 'zod'
import type { ApiResponse } from '@/types'

export async function GET(): Promise<NextResponse<ApiResponse<Product[]>>> {
  try {
    await requireRole(['org:admin', 'org:manager', 'org:cashier'])
    const shopId = await getShopId()
    const data = await getProductsByShop(shopId)
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
```

---

## Standard Response Type

```typescript
// types/index.ts
export type ApiSuccess<T> = { success: true; data: T }
export type ApiError = { success: false; error: string; code?: string }
export type ApiResponse<T> = ApiSuccess<T> | ApiError
```

---

## Server Actions Pattern

```typescript
// lib/actions/inventory.ts
'use server'
import { revalidatePath } from 'next/cache'
import { requireRole, getShopId } from '@/lib/clerk/helpers'

export async function createProductAction(formData: FormData) {
  await requireRole(['org:admin', 'org:manager'])
  const shopId = await getShopId()
  // validate + insert
  revalidatePath('/dashboard/inventory')
  return { success: true }
}
```

---

## TanStack Query Hook Pattern

```typescript
// lib/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query'
import type { ApiResponse, Product } from '@/types'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const res = await fetch('/api/inventory/products')
      const json: ApiResponse<Product[]> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    staleTime: 1000 * 60 * 5,
  })
}
```

---

## Validation — Zod

Every API input must be validated with Zod. Schemas in `lib/validations/[domain].schema.ts`.

```typescript
// lib/validations/product.schema.ts
import { z } from 'zod'

export const productSchema = z.object({
  name:       z.string().min(1).max(200),
  price:      z.number().int().positive(),   // kobo
  costPrice:  z.number().int().min(0),
  stock:      z.number().int().min(0),
  lowStockAt: z.number().int().min(0).default(5),
  barcode:    z.string().optional(),
})

export type ProductInput = z.infer<typeof productSchema>
```

---

## Webhook Security

All webhooks must verify signature before processing.
- Paystack: verify `x-paystack-signature` with HMAC SHA512
- Clerk: use `svix` library

Never process a webhook without signature verification.
