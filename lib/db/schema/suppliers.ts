import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { shops } from './shops'

export const suppliers = pgTable('suppliers', {
  id:        uuid('id').defaultRandom().primaryKey(),
  shopId:    uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),
  name:      text('name').notNull(),
  phone:     text('phone'),
  email:     text('email'),
  notes:     text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Supplier = typeof suppliers.$inferSelect
export type NewSupplier = typeof suppliers.$inferInsert
