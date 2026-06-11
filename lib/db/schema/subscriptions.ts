import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { shops } from './shops'

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'non_renewing',
  'attention',
  'cancelled',
  'inactive',
])

export const subscriptions = pgTable('subscriptions', {
  id:                    uuid('id').defaultRandom().primaryKey(),
  shopId:                uuid('shop_id').notNull().references(() => shops.id, { onDelete: 'cascade' }),
  paystackSubCode:       text('paystack_sub_code').unique(),
  paystackCustomerCode:  text('paystack_customer_code'),
  paystackCustomerEmail: text('paystack_customer_email'),
  planName:              text('plan_name').notNull(),
  status:                subscriptionStatusEnum('status').notNull().default('inactive'),
  currentPeriodStart:    timestamp('current_period_start'),
  currentPeriodEnd:      timestamp('current_period_end'),
  cancelledAt:           timestamp('cancelled_at'),
  createdAt:             timestamp('created_at').defaultNow().notNull(),
  updatedAt:             timestamp('updated_at').defaultNow().notNull(),
})

export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert
