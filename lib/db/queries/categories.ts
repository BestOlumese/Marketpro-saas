import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import type { NewCategory } from '@/lib/db/schema'

export async function getCategoriesByShop(shopId: string) {
  return db
    .select()
    .from(categories)
    .where(eq(categories.shopId, shopId))
    .orderBy(asc(categories.name))
}

export async function createCategory(data: NewCategory) {
  const [category] = await db.insert(categories).values(data).returning()
  return category
}

export async function updateCategory(shopId: string, categoryId: string, data: { name: string }) {
  const [category] = await db
    .update(categories)
    .set({ name: data.name })
    .where(and(eq(categories.id, categoryId), eq(categories.shopId, shopId)))
    .returning()
  return category
}

export async function deleteCategory(shopId: string, categoryId: string) {
  const [category] = await db
    .delete(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.shopId, shopId)))
    .returning()
  return category
}
