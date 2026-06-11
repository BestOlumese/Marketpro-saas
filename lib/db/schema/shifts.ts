import { pgTable, uuid, integer, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { shops } from './shops'
import { staff } from './staff'

export const shiftStatusEnum = pgEnum('shift_status', ['open', 'closed'])

export const shifts = pgTable('shifts', {
  id:           uuid('id').defaultRandom().primaryKey(),
  shopId:       uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),
  staffId:      uuid('staff_id').notNull().references(() => staff.id, { onDelete: 'cascade' }),
  status:       shiftStatusEnum('status').notNull().default('open'),
  openingCash:  integer('opening_cash').notNull().default(0),
  closingCash:  integer('closing_cash'),
  expectedCash: integer('expected_cash'),
  discrepancy:  integer('discrepancy'),
  note:         text('note'),
  openedAt:     timestamp('opened_at').defaultNow().notNull(),
  closedAt:     timestamp('closed_at'),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
  updatedAt:    timestamp('updated_at').defaultNow().notNull(),
})

export type Shift = typeof shifts.$inferSelect
export type NewShift = typeof shifts.$inferInsert
