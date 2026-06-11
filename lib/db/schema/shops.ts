import { pgTable, uuid, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const planEnum = pgEnum('plan_name', ['starter', 'growth', 'pro'])
export const planStatusEnum = pgEnum('plan_status', ['active', 'trialing', 'past_due', 'cancelled'])

export const shops = pgTable('shops', {
  id:              uuid('id').defaultRandom().primaryKey(),
  betterAuthOrgId: text('better_auth_org_id').unique(),
  ownerId:         text('owner_id').notNull(),
  name:          text('name').notNull(),
  plan:          planEnum('plan').notNull().default('starter'),
  planStatus:    planStatusEnum('plan_status').notNull().default('active'),
  paystackSubId:     text('paystack_sub_id'),
  aiQueriesUsed:     integer('ai_queries_used').notNull().default(0),
  aiQueriesResetAt:  timestamp('ai_queries_reset_at'),
  createdAt:         timestamp('created_at').defaultNow().notNull(),
  updatedAt:         timestamp('updated_at').defaultNow().notNull(),
})

export type Shop = typeof shops.$inferSelect
export type NewShop = typeof shops.$inferInsert
