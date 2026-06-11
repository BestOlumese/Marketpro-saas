import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getShopId } from '@/lib/clerk/helpers'
import { getPlanForShop } from '@/lib/db/queries/limits'
import { planHasAccess } from '@/lib/constants/plans'
import { getTopProducts } from '@/lib/db/queries/reports'
import { dateRangeSchema } from '@/lib/validations/report.schema'
import { logger } from '@/lib/logger'
import type { ApiResponse } from '@/types'
import type { TopProduct } from '@/lib/db/queries/reports'

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<TopProduct[]>>> {
  try {
    await requireRole(['owner', 'manager', 'accountant'])
    const shopId = await getShopId()

    const plan = await getPlanForShop(shopId)
    if (!planHasAccess(plan, 'growth')) {
      return NextResponse.json({ success: false, error: 'Upgrade to Growth to access full reports.', code: 'PLAN_REQUIRED' }, { status: 403 })
    }

    const { searchParams } = req.nextUrl
    const parsed = dateRangeSchema.safeParse({
      from:  searchParams.get('from'),
      to:    searchParams.get('to'),
      limit: searchParams.get('limit') ?? '10',
    })
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 }
      )
    }

    const data = await getTopProducts(shopId, parsed.data.from, parsed.data.to, parsed.data.limit)
    return NextResponse.json({ success: true, data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg === 'UNAUTHORISED') return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 403 })
    logger.error('GET /api/reports/products', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch top products' }, { status: 500 })
  }
}
