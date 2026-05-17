import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq, and, isNull, lt, ilike, or } from 'drizzle-orm'
import type { NewProduct } from '@/lib/db/schema'

export async function getProductsByShop(shopId: string, search?: string) {
  if (search) {
    return db.query.products.findMany({
      where: and(
        eq(products.shopId, shopId),
        isNull(products.deletedAt),
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.barcode, `%${search}%`)
        )
      ),
      with: { category: true, supplier: true },
      orderBy: (p, { asc }) => [asc(p.name)],
    })
  }

  return db.query.products.findMany({
    where: and(eq(products.shopId, shopId), isNull(products.deletedAt)),
    with: { category: true, supplier: true },
    orderBy: (p, { asc }) => [asc(p.name)],
  })
}

export async function getProductById(shopId: string, productId: string) {
  return db.query.products.findFirst({
    where: and(
      eq(products.id, productId),
      eq(products.shopId, shopId),
      isNull(products.deletedAt)
    ),
    with: { category: true, supplier: true },
  })
}

export async function getLowStockProducts(shopId: string) {
  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.shopId, shopId),
        isNull(products.deletedAt),
        lt(products.stock, products.lowStockAt)
      )
    )
}

export async function createProduct(data: NewProduct) {
  const [product] = await db.insert(products).values(data).returning()
  return product
}

export async function updateProduct(
  shopId: string,
  productId: string,
  data: Partial<NewProduct>
) {
  const [product] = await db
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(products.id, productId), eq(products.shopId, shopId)))
    .returning()
  return product
}

export async function softDeleteProduct(shopId: string, productId: string) {
  const [product] = await db
    .update(products)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(products.id, productId), eq(products.shopId, shopId)))
    .returning()
  return product
}

export async function bulkCreateProducts(data: NewProduct[]) {
  if (data.length === 0) return []
  return db.insert(products).values(data).returning()
}
