import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole, getAuthContext } from '@/lib/clerk/helpers'
import { getShopWithOrg } from '@/lib/auth/helpers'
import { initializeTransaction, planCodeForPlan } from '@/lib/paystack/client'
import { logger } from '@/lib/logger'
import type { ApiResponse } from '@/types'

const subscribeSchema = z.object({
  plan: z.enum(['growth', 'pro']),
})

// Plan amounts in kobo (₦9,900 and ₦19,900)
const PLAN_AMOUNTS_KOBO: Record<'growth' | 'pro', number> = {
  growth: 990000,
  pro:    1990000,
}

interface SubscribeResult {
  checkoutUrl: string
}

export async function POST(req: Request): Promise<NextResponse<ApiResponse<SubscribeResult>>> {
  try {
    await requireRole(['owner'])
    const ctx  = await getAuthContext()
    const shop = await getShopWithOrg()

    const body: unknown = await req.json()
    const parsed = subscribeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid plan selected' }, { status: 400 })
    }

    const plan     = parsed.data.plan
    const planCode = planCodeForPlan(plan)
    const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const data = await initializeTransaction({
      email:        ctx.userEmail,
      amount:       PLAN_AMOUNTS_KOBO[plan],
      plan:         planCode,
      callback_url: `${appUrl}/settings/billing?payment=success`,
      metadata: {
        shopId:   shop.id,
        planName: plan,
        userId:   ctx.userId,
      },
    })

    return NextResponse.json({ success: true, data: { checkoutUrl: data.authorization_url } })
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'UNAUTHORISED' || err.message === 'UNAUTHORIZED') {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
      }
      if (err.message.includes('plan code not set')) {
        return NextResponse.json(
          { success: false, error: 'Subscription plans are not configured yet.' },
          { status: 503 },
        )
      }
    }
    logger.error('POST /api/billing/subscribe failed', err)
    return NextResponse.json({ success: false, error: 'Failed to initialize subscription' }, { status: 500 })
  }
}
