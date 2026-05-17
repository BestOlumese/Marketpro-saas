import { relations } from 'drizzle-orm'
import { shops } from './shops'
import { staff } from './staff'
import { categories } from './categories'
import { suppliers } from './suppliers'
import { products } from './products'

export const shopsRelations = relations(shops, ({ many }) => ({
  staff:      many(staff),
  categories: many(categories),
  suppliers:  many(suppliers),
  products:   many(products),
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  shop:     one(shops, { fields: [categories.shopId], references: [shops.id] }),
  products: many(products),
}))

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  shop:     one(shops, { fields: [suppliers.shopId], references: [shops.id] }),
  products: many(products),
}))

export const productsRelations = relations(products, ({ one }) => ({
  shop:     one(shops,      { fields: [products.shopId],     references: [shops.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  supplier: one(suppliers,  { fields: [products.supplierId], references: [suppliers.id] }),
}))

export const staffRelations = relations(staff, ({ one }) => ({
  shop: one(shops, { fields: [staff.shopId], references: [shops.id] }),
}))
