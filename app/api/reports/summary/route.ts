import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getShopId } from '@/lib/clerk/helpers'
import { getSalesSummary, getDashboardMetrics } from '@/lib/db/queries/reports'
import { dateRangeSchema } from '@/lib/validations/report.schema'
import { logger } from '@/lib/logger'
import type { ApiResponse } from '@/types'
import type { SalesSummaryItem, DashboardMetrics } from '@/lib/db/queries/reports'

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<SalesSummaryItem[] | DashboardMetrics>>> {
  try {
    await requireRole(['org:admin', 'org:manager'])
    const shopId = await getShopId()

    const { searchParams } = req.nextUrl

    if (searchParams.get('dashboard') === '1') {
      const metrics = await getDashboardMetrics(shopId)
      return NextResponse.json({ success: true, data: metrics })
    }

    const parsed = dateRangeSchema.safeParse({
      from: searchParams.get('from'),
      to:   searchParams.get('to'),
    })
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 }
      )
    }

    const data = await getSalesSummary(shopId, parsed.data.from, parsed.data.to)
    return NextResponse.json({ success: true, data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg === 'UNAUTHORISED') return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 403 })
    logger.error('GET /api/reports/summary', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch summary' }, { status: 500 })
  }
}
