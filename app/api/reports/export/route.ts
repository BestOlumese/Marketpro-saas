import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getShopId } from '@/lib/clerk/helpers'
import { getPlanForShop } from '@/lib/db/queries/limits'
import { planHasAccess } from '@/lib/constants/plans'
import { getSalesForExport } from '@/lib/db/queries/reports'
import { dateRangeSchema } from '@/lib/validations/report.schema'
import { logger } from '@/lib/logger'
import { formatDate } from '@/lib/utils/formatters'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await requireRole(['owner', 'manager', 'accountant'])
    const shopId = await getShopId()

    const plan = await getPlanForShop(shopId)
    if (!planHasAccess(plan, 'growth')) {
      return new NextResponse('Upgrade to Growth to export reports.', { status: 403 })
    }

    const { searchParams } = req.nextUrl
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

    const rows = await getSalesForExport(shopId, parsed.data.from, parsed.data.to)

    const header = ['Date', 'Sale ID', 'Staff', 'Items', 'Subtotal (₦)', 'Discount (%)', 'Total (₦)', 'Payment'].join(',')

    const lines = rows.map((s) => {
      const staffName = s.staff?.name ?? 'Unknown'
      const itemNames = s.items.map((i) => `${i.name} x${i.quantity}`).join('; ')
      return [
        formatDate(s.createdAt),
        s.id,
        staffName,
        `"${itemNames}"`,
        (s.subtotal / 100).toFixed(2),
        s.discount,
        (s.total / 100).toFixed(2),
        s.paymentMethod,
      ].join(',')
    })

    const csv = [header, ...lines].join('\n')
    const filename = `sales-${parsed.data.from}-to-${parsed.data.to}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type':        'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg === 'UNAUTHORISED') return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 403 })
    logger.error('GET /api/reports/export', err)
    return NextResponse.json({ success: false, error: 'Failed to export' }, { status: 500 })
  }
}
