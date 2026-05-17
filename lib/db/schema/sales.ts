import { pgTable, uuid, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { shops } from './shops'
import { staff } from './staff'
import { customers } from './customers'
import { products } from './products'

export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'transfer', 'card'])
export const saleStatusEnum = pgEnum('sale_status', ['completed', 'voided'])

export const sales = pgTable('sales', {
  id:            uuid('id').defaultRandom().primaryKey(),
  shopId:        uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),
  staffId:       uuid('staff_id').references(() => staff.id, { onDelete: 'set null' }),
  customerId:    uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  subtotal:      integer('subtotal').notNull(),        // kobo, before discount
  discount:      integer('discount').notNull().default(0), // percentage 0–100
  total:         integer('total').notNull(),           // kobo, after discount
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  status:        saleStatusEnum('status').notNull().default('completed'),
  note:          text('note'),
  createdAt:     timestamp('created_at').defaultNow().notNull(),
  updatedAt:     timestamp('updated_at').defaultNow().notNull(),
})

export const saleItems = pgTable('sale_items', {
  id:        uuid('id').defaultRandom().primaryKey(),
  saleId:    uuid('sale_id').notNull().references(() => sales.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  name:      text('name').notNull(),     // snapshot — never changes after sale
  price:     integer('price').notNull(), // kobo snapshot
  quantity:  integer('quantity').notNull(),
  subtotal:  integer('subtotal').notNull(), // kobo — price × quantity
})

export type Sale = typeof sales.$inferSelect
export type NewSale = typeof sales.$inferInsert
export type SaleItem = typeof saleItems.$inferSelect
export type NewSaleItem = typeof saleItems.$inferInsert
