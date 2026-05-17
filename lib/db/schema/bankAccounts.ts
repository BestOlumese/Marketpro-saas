import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'
import { shops } from './shops'

export const bankAccounts = pgTable('bank_accounts', {
  id:            uuid('id').defaultRandom().primaryKey(),
  shopId:        uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),
  bankName:      text('bank_name').notNull(),
  accountNumber: text('account_number').notNull(),
  accountName:   text('account_name').notNull(),
  isDefault:     boolean('is_default').notNull().default(false),
  createdAt:     timestamp('created_at').defaultNow().notNull(),
  updatedAt:     timestamp('updated_at').defaultNow().notNull(),
})

export type BankAccount    = typeof bankAccounts.$inferSelect
export type NewBankAccount = typeof bankAccounts.$inferInsert
