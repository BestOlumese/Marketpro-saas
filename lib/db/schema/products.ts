import { pgTable, uuid, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { shops } from './shops'
import { categories } from './categories'
import { suppliers } from './suppliers'

export const productStatusEnum = pgEnum('product_status', ['active', 'inactive', 'out_of_stock'])

export const products = pgTable('products', {
  id:          uuid('id').defaultRandom().primaryKey(),
  shopId:      uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),
  categoryId:  uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  supplierId:  uuid('supplier_id').references(() => suppliers.id, { onDelete: 'set null' }),
  name:        text('name').notNull(),
  barcode:     text('barcode'),
  price:       integer('price').notNull(),            // kobo
  costPrice:   integer('cost_price').notNull(),       // kobo
  stock:       integer('stock').notNull().default(0),
  lowStockAt:  integer('low_stock_at').notNull().default(5),
  status:      productStatusEnum('status').notNull().default('active'),
  expiresAt:   timestamp('expires_at'),
  deletedAt:   timestamp('deleted_at'),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
  updatedAt:   timestamp('updated_at').defaultNow().notNull(),
})

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
