import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { verifyWebhookSignature } from '@/lib/paystack/client'
import { db } from '@/lib/db'
import { shops, subscriptions } from '@/lib/db/schema'
import { logger } from '@/lib/logger'
import type { PlanName } from '@/lib/constants/plans'

// ─── Paystack event shapes ────────────────────────────────────────────────────

interface PaystackCustomer {
  id: number
  customer_code: string
  email: string
}

interface PaystackPlan {
  plan_code: string
  name: string
}

interface SubscriptionData {
  subscription_code: string
  email_token: string
  status: string
  next_payment_date: string | null
  customer: PaystackCustomer
  plan: PaystackPlan
  metadata?: { shopId?: string; planName?: string }
  createdAt: string
}

interface ChargeData {
  reference: string
  customer: PaystackCustomer
  metadata?: { shopId?: string; planName?: string }
  plan?: PaystackPlan
  amount: number
}

interface PaystackEvent {
  event: string
  data: SubscriptionData | ChargeData
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function planFromCode(planCode: string): PlanName {
  const growth = process.env.PAYSTACK_PLAN_GROWTH
  const pro    = process.env.PAYSTACK_PLAN_PRO
  if (planCode === pro)    return 'pro'
  if (planCode === growth) return 'growth'
  return 'starter'
}

async function findShopBySubscriptionCode(subCode: string): Promise<string | null> {
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.paystackSubCode, subCode),
    columns: { shopId: true },
  })
  return sub?.shopId ?? null
}

async function upsertSubscription(params: {
  shopId: string
  subCode: string
  customerCode: string
  customerEmail: string
  planName: PlanName
  status: string
  nextPaymentDate: string | null
}) {
  const existing = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.paystackSubCode, params.subCode),
  })

  const periodEnd = params.nextPaymentDate ? new Date(params.nextPaymentDate) : null
  const now = new Date()

  if (existing) {
    await db.update(subscriptions)
      .set({
        status: params.status as 'active' | 'non_renewing' | 'attention' | 'cancelled' | 'inactive',
        currentPeriodEnd: periodEnd ?? undefined,
        updatedAt: now,
      })
      .where(eq(subscriptions.id, existing.id))
  } else {
    await db.insert(subscriptions).values({
      shopId:                params.shopId,
      paystackSubCode:       params.subCode,
      paystackCustomerCode:  params.customerCode,
      paystackCustomerEmail: params.customerEmail,
      planName:              params.planName,
      status: params.status as 'active' | 'non_renewing' | 'attention' | 'cancelled' | 'inactive',
      currentPeriodStart:    now,
      currentPeriodEnd:      periodEnd ?? undefined,
    })
  }
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text()
  const signature = req.headers.get('x-paystack-signature') ?? ''

  if (!verifyWebhookSignature(rawBody, signature)) {
    logger.warn('Paystack webhook signature mismatch')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: PaystackEvent
  try {
    event = JSON.parse(rawBody) as PaystackEvent
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  logger.info('Paystack webhook received', { event: event.event })

  try {
    switch (event.event) {

      case 'charge.success': {
        const data = event.data as ChargeData
        const shopId = data.metadata?.shopId
        const planName = (data.metadata?.planName ?? 'starter') as PlanName
        if (!shopId) break

        await db.update(shops)
          .set({ plan: planName, planStatus: 'active', updatedAt: new Date() })
          .where(eq(shops.id, shopId))

        logger.info('charge.success — plan activated', { shopId, planName })
        break
      }

      case 'subscription.create': {
        const data = event.data as SubscriptionData
        const planName = planFromCode(data.plan.plan_code)
        // Find shopId from metadata or from existing subscription record
        const shopId = (data.metadata?.shopId) ?? await findShopBySubscriptionCode(data.subscription_code)
        if (!shopId) {
          logger.warn('subscription.create — no shopId found', { subCode: data.subscription_code })
          break
        }

        await upsertSubscription({
          shopId,
          subCode:       data.subscription_code,
          customerCode:  data.customer.customer_code,
          customerEmail: data.customer.email,
          planName,
          status:        'active',
          nextPaymentDate: data.next_payment_date,
        })

        await db.update(shops)
          .set({ plan: planName, planStatus: 'active', paystackSubId: data.subscription_code, updatedAt: new Date() })
          .where(eq(shops.id, shopId))

        logger.info('subscription.create processed', { shopId, planName })
        break
      }

      case 'subscription.disable': {
        // Fired when subscription is cancelled — access continues until period end.
        // Do not downgrade yet; mark as non_renewing and wait for not_renew event.
        const data = event.data as SubscriptionData
        const shopId = await findShopBySubscriptionCode(data.subscription_code)
        if (!shopId) break

        await db.update(subscriptions)
          .set({ status: 'non_renewing', cancelledAt: new Date(), updatedAt: new Date() })
          .where(eq(subscriptions.paystackSubCode, data.subscription_code))

        await db.update(shops)
          .set({ planStatus: 'cancelled', updatedAt: new Date() })
          .where(eq(shops.id, shopId))

        logger.info('subscription.disable — marked non_renewing, access continues until period end', { shopId })
        break
      }

      case 'subscription.not_renew': {
        // Fired when the period ends and the subscription will not renew.
        // This is the correct moment to downgrade to starter.
        const data = event.data as SubscriptionData
        const shopId = await findShopBySubscriptionCode(data.subscription_code)
        if (!shopId) break

        await db.update(subscriptions)
          .set({ status: 'inactive', updatedAt: new Date() })
          .where(eq(subscriptions.paystackSubCode, data.subscription_code))

        await db.update(shops)
          .set({ plan: 'starter', planStatus: 'active', updatedAt: new Date() })
          .where(eq(shops.id, shopId))

        logger.info('subscription.not_renew — downgraded to starter', { shopId })
        break
      }

      case 'invoice.payment_failed': {
        const data = event.data as SubscriptionData
        const shopId = await findShopBySubscriptionCode(data.subscription_code)
        logger.warn('invoice.payment_failed', { shopId, subCode: data.subscription_code })

        if (shopId) {
          await db.update(shops)
            .set({ planStatus: 'past_due', updatedAt: new Date() })
            .where(eq(shops.id, shopId))
        }
        break
      }

      default:
        logger.info('Unhandled Paystack event', { event: event.event })
    }
  } catch (err) {
    logger.error(`Webhook handler failed for ${event.event}`, err)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
