# DB.md — Database Guidelines

> Official docs: https://orm.drizzle.team/docs/overview | https://neon.tech/docs

---

## Stack

- **Neon Postgres** — serverless Postgres, connection pooling enabled
- **Drizzle ORM** — TypeScript-native, schema-first
- **drizzle-kit** — CLI for migrations

---

## Connection Setup

```typescript
// lib/db/index.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

- Never import `db` in a component. Only in API routes, server actions, or `lib/db/queries/`.
- Use pooler URL for the app. Use direct URL only for migrations.

---

## Schema Rules

One file per domain in `lib/db/schema/`. All exported from `lib/db/schema/index.ts`.

```typescript
// lib/db/schema/products.ts
import { pgTable, uuid, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { shops } from './shops'

export const productStatusEnum = pgEnum('product_status', ['active', 'inactive', 'out_of_stock'])

export const products = pgTable('products', {
  id:          uuid('id').defaultRandom().primaryKey(),
  shopId:      uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),
  name:        text('name').notNull(),
  barcode:     text('barcode'),
  price:       integer('price').notNull(),       // KOBO — never float
  costPrice:   integer('cost_price').notNull(),   // KOBO
  stock:       integer('stock').notNull().default(0),
  lowStockAt:  integer('low_stock_at').notNull().default(5),
  status:      productStatusEnum('status').default('active'),
  expiresAt:   timestamp('expires_at'),
  deletedAt:   timestamp('deleted_at'),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
  updatedAt:   timestamp('updated_at').defaultNow().notNull(),
})

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
```

**MONEY RULE: Always store prices in kobo (integer). ₦1,500 = 150000 kobo. Never use float for money.**

---

## Query Pattern

All queries in `lib/db/queries/` — one file per domain.

```typescript
// lib/db/queries/products.ts
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq, and, lt } from 'drizzle-orm'

export async function getProductsByShop(shopId: string) {
  return db.select().from(products).where(
    and(eq(products.shopId, shopId), isNull(products.deletedAt))
  )
}
```

- Never write raw SQL strings. Always use Drizzle query builder.
- Never put `db.select()` directly in an API route or component.
- Every query MUST filter by `shopId`.

---

## Multi-Tenancy — Non-Negotiable

Every table with shop data MUST have `shopId`. Every query MUST filter by it.

```typescript
// CORRECT
where(eq(products.shopId, shopId))

// WRONG — never query without shop scope
db.select().from(products)
```

---

## Migrations

```bash
npx drizzle-kit generate    # after schema change
npx drizzle-kit migrate     # apply to Neon
npx drizzle-kit push        # early dev only, before real users
```

Never edit generated migration files. Never run `push` after real users exist.

---

## drizzle.config.ts

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './lib/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
})
```

---

## Soft Deletes

- `products` — soft delete with `deletedAt`
- `staff` — soft delete with `deletedAt`
- `sales` — never delete
- Categories, draft items — hard delete is fine
