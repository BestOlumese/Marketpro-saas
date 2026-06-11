import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { shops } from './shops'

export const staffRoleEnum = pgEnum('staff_role', ['owner', 'manager', 'accountant', 'inventory_manager', 'cashier'])

export const staff = pgTable('staff', {
  id:        uuid('id').defaultRandom().primaryKey(),
  shopId:    uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),
  userId:    text('user_id').notNull().unique(),
  name:      text('name').notNull(),
  email:     text('email').notNull(),
  role:      staffRoleEnum('role').notNull().default('cashier'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Staff = typeof staff.$inferSelect
export type NewStaff = typeof staff.$inferInsert
