import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { requireRole, getShopId } from '@/lib/clerk/helpers'
import { fetchSubscription, disableSubscription } from '@/lib/paystack/client'
import { db } from '@/lib/db'
import { shops, subscriptions } from '@/lib/db/schema'
import { logger } from '@/lib/logger'
import type { ApiResponse } from '@/types'
import type { Subscription } from '@/lib/db/schema'

interface PortalData {
  plan: string
  planStatus: string
  subscription: Subscription | null
}

export async function GET(): Promise<NextResponse<ApiResponse<PortalData>>> {
  try {
    await requireRole(['owner'])
    const shopId = await getShopId()

    const shop = await db.query.shops.findFirst({
      where: eq(shops.id, shopId),
      columns: { plan: true, planStatus: true },
    })

    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.shopId, shopId),
      orderBy: (s, { desc }) => [desc(s.createdAt)],
    })

    return NextResponse.json({
      success: true,
      data: {
        plan: shop?.plan ?? 'starter',
        planStatus: shop?.planStatus ?? 'active',
        subscription: subscription ?? null,
      },
    })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORISED' || err.message === 'UNAUTHORIZED')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    logger.error('GET /api/billing/portal failed', err)
    return NextResponse.json({ success: false, error: 'Failed to load billing info' }, { status: 500 })
  }
}

export async function DELETE(): Promise<NextResponse<ApiResponse<null>>> {
  try {
    await requireRole(['owner'])
    const shopId = await getShopId()

    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.shopId, shopId),
      orderBy: (s, { desc }) => [desc(s.createdAt)],
    })

    if (!subscription?.paystackSubCode) {
      return NextResponse.json({ success: false, error: 'No active subscription found' }, { status: 404 })
    }

    // Fetch the email token needed to disable
    const sub = await fetchSubscription(subscription.paystackSubCode)
    await disableSubscription({ code: subscription.paystackSubCode, token: sub.email_token })

    // Mark as non-renewing — plan stays active until currentPeriodEnd.
    // The actual downgrade happens when subscription.not_renew fires.
    await db.update(shops)
      .set({ planStatus: 'cancelled', updatedAt: new Date() })
      .where(eq(shops.id, shopId))
    await db.update(subscriptions)
      .set({ status: 'non_renewing', cancelledAt: new Date(), updatedAt: new Date() })
      .where(eq(subscriptions.shopId, shopId))

    logger.info('Subscription cancelled', { shopId })
    return NextResponse.json({ success: true, data: null })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORISED' || err.message === 'UNAUTHORIZED')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    logger.error('DELETE /api/billing/portal failed', err)
    return NextResponse.json({ success: false, error: 'Failed to cancel subscription' }, { status: 500 })
  }
}
