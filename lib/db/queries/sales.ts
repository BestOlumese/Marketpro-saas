import { db } from '@/lib/db'
import { sales, saleItems, products } from '@/lib/db/schema'
import { eq, and, desc, gte, lte, sql, inArray } from 'drizzle-orm'
import type { NewSaleItem } from '@/lib/db/schema'

interface CreateSaleItem {
  productId: string
  name: string     // snapshot at time of sale
  price: number    // kobo snapshot
  quantity: number
}

interface CreateSaleInput {
  staffId: string | null
  customerId?: string | null
  paymentMethod: 'cash' | 'transfer' | 'card'
  discount: number   // 0–100 percentage
  note?: string | null
  items: CreateSaleItem[]
}

export interface SaleWithItems {
  id: string
  shopId: string
  staffId: string | null
  customerId: string | null
  subtotal: number
  discount: number
  total: number
  paymentMethod: 'cash' | 'transfer' | 'card'
  status: 'completed' | 'voided'
  note: string | null
  createdAt: Date
  updatedAt: Date
  items: Array<{
    id: string
    saleId: string
    productId: string | null
    name: string
    price: number
    quantity: number
    subtotal: number
  }>
}

export async function createSale(
  shopId: string,
  input: CreateSaleInput
): Promise<SaleWithItems> {
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const total = Math.round(subtotal * (1 - input.discount / 100))

  const [sale] = await db
    .insert(sales)
    .values({
      shopId,
      staffId: input.staffId,
      customerId: input.customerId ?? null,
      subtotal,
      discount: input.discount,
      total,
      paymentMethod: input.paymentMethod,
      status: 'completed',
      note: input.note ?? null,
    })
    .returning()

  if (!sale) throw new Error('Failed to insert sale')

  // Verify which product IDs still exist in the DB.
  // Products deleted server-side may still be in the client's local cache.
  // For deleted products: keep the name/price snapshot but set productId = null.
  const productIds = input.items.map((i) => i.productId)
  const existingRows = await db
    .select({ id: products.id })
    .from(products)
    .where(inArray(products.id, productIds))
  const existingIds = new Set(existingRows.map((r) => r.id))

  const itemRows: NewSaleItem[] = input.items.map((item) => ({
    saleId: sale.id,
    productId: existingIds.has(item.productId) ? item.productId : null,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    subtotal: item.price * item.quantity,
  }))

  const insertedItems = await db.insert(saleItems).values(itemRows).returning()

  // Decrement stock only for products that still exist
  await Promise.all(
    input.items
      .filter((item) => existingIds.has(item.productId))
      .map((item) =>
        db
          .update(products)
          .set({ stock: sql`${products.stock} - ${item.quantity}` })
          .where(and(eq(products.id, item.productId), eq(products.shopId, shopId)))
      )
  )

  return { ...sale, items: insertedItems }
}

export async function voidSale(shopId: string, saleId: string): Promise<void> {
  const [voided] = await db
    .update(sales)
    .set({ status: 'voided', updatedAt: new Date() })
    .where(and(eq(sales.id, saleId), eq(sales.shopId, shopId)))
    .returning()

  if (!voided) return

  const items = await db
    .select()
    .from(saleItems)
    .where(eq(saleItems.saleId, saleId))

  await Promise.all(
    items
      .filter((item) => item.productId !== null)
      .map((item) =>
        db
          .update(products)
          .set({ stock: sql`${products.stock} + ${item.quantity}` })
          .where(
            and(
              eq(products.id, item.productId!),
              eq(products.shopId, shopId)
            )
          )
      )
  )
}

export async function getSalesByShop(
  shopId: string,
  opts?: { from?: Date; to?: Date; limit?: number }
) {
  const conditions = [eq(sales.shopId, shopId)]
  if (opts?.from) conditions.push(gte(sales.createdAt, opts.from))
  if (opts?.to) conditions.push(lte(sales.createdAt, opts.to))

  return db.query.sales.findMany({
    where: and(...conditions),
    orderBy: [desc(sales.createdAt)],
    limit: opts?.limit ?? 100,
    with: { items: true, staff: true, customer: true },
  })
}

export async function getSaleById(shopId: string, saleId: string) {
  return db.query.sales.findFirst({
    where: and(eq(sales.id, saleId), eq(sales.shopId, shopId)),
    with: { items: true, staff: true, customer: true },
  })
}
