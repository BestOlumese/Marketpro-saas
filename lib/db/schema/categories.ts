import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { shops } from './shops'

export const categories = pgTable('categories', {
  id:        uuid('id').defaultRandom().primaryKey(),
  shopId:    uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),
  name:      text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
