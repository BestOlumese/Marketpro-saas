import { db } from '@/lib/db'
import { suppliers } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import type { NewSupplier } from '@/lib/db/schema'

export async function getSuppliersByShop(shopId: string) {
  return db
    .select()
    .from(suppliers)
    .where(eq(suppliers.shopId, shopId))
    .orderBy(asc(suppliers.name))
}

export async function getSupplierById(shopId: string, supplierId: string) {
  return db.query.suppliers.findFirst({
    where: and(eq(suppliers.id, supplierId), eq(suppliers.shopId, shopId)),
  })
}

export async function createSupplier(data: NewSupplier) {
  const [supplier] = await db.insert(suppliers).values(data).returning()
  return supplier
}

export async function updateSupplier(
  shopId: string,
  supplierId: string,
  data: Partial<NewSupplier>
) {
  const [supplier] = await db
    .update(suppliers)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(suppliers.id, supplierId), eq(suppliers.shopId, shopId)))
    .returning()
  return supplier
}

export async function deleteSupplier(shopId: string, supplierId: string) {
  const [supplier] = await db
    .delete(suppliers)
    .where(and(eq(suppliers.id, supplierId), eq(suppliers.shopId, shopId)))
    .returning()
  return supplier
}
