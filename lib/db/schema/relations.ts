import { relations } from 'drizzle-orm'
import { shops } from './shops'
import { staff } from './staff'
import { categories } from './categories'
import { suppliers } from './suppliers'
import { products } from './products'
import { customers } from './customers'
import { sales, saleItems } from './sales'
import { bankAccounts } from './bankAccounts'

export const shopsRelations = relations(shops, ({ many }) => ({
  staff:        many(staff),
  categories:   many(categories),
  suppliers:    many(suppliers),
  products:     many(products),
  customers:    many(customers),
  sales:        many(sales),
  bankAccounts: many(bankAccounts),
}))

export const bankAccountsRelations = relations(bankAccounts, ({ one }) => ({
  shop: one(shops, { fields: [bankAccounts.shopId], references: [shops.id] }),
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  shop:     one(shops, { fields: [categories.shopId], references: [shops.id] }),
  products: many(products),
}))

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  shop:     one(shops, { fields: [suppliers.shopId], references: [shops.id] }),
  products: many(products),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  shop:      one(shops,      { fields: [products.shopId],     references: [shops.id] }),
  category:  one(categories, { fields: [products.categoryId], references: [categories.id] }),
  supplier:  one(suppliers,  { fields: [products.supplierId], references: [suppliers.id] }),
  saleItems: many(saleItems),
}))

export const staffRelations = relations(staff, ({ one, many }) => ({
  shop:  one(shops, { fields: [staff.shopId], references: [shops.id] }),
  sales: many(sales),
}))

export const customersRelations = relations(customers, ({ one, many }) => ({
  shop:  one(shops, { fields: [customers.shopId], references: [shops.id] }),
  sales: many(sales),
}))

export const salesRelations = relations(sales, ({ one, many }) => ({
  shop:     one(shops,     { fields: [sales.shopId],     references: [shops.id] }),
  staff:    one(staff,     { fields: [sales.staffId],    references: [staff.id] }),
  customer: one(customers, { fields: [sales.customerId], references: [customers.id] }),
  items:    many(saleItems),
}))

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale:    one(sales,    { fields: [saleItems.saleId],    references: [sales.id] }),
  product: one(products, { fields: [saleItems.productId], references: [products.id] }),
}))
