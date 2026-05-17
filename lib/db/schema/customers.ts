import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { shops } from './shops'

export const customers = pgTable('customers', {
  id:            uuid('id').defaultRandom().primaryKey(),
  shopId:        uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),
  name:          text('name').notNull(),
  phone:         text('phone'),
  email:         text('email'),
  loyaltyPoints: integer('loyalty_points').notNull().default(0),
  createdAt:     timestamp('created_at').defaultNow().notNull(),
  updatedAt:     timestamp('updated_at').defaultNow().notNull(),
})

export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert
