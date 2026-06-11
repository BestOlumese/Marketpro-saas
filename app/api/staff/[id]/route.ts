import { NextResponse } from 'next/server'
import { getShopId, requireRole } from '@/lib/clerk/helpers'
import { getStaffWithSales } from '@/lib/db/queries/staff'
import { logger } from '@/lib/logger'
import type { ApiResponse, StaffWithRelations } from '@/types'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<StaffWithRelations>>> {
  try {
    await requireRole(['owner', 'manager'])
    const shopId = await getShopId()
    const { id } = await params

    const member = await getStaffWithSales(id, shopId)
    if (!member) {
      return NextResponse.json({ success: false, error: 'Staff member not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: member as StaffWithRelations })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORISED' || err.message === 'UNAUTHORIZED')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    if (err instanceof Error && err.message === 'SHOP_NOT_FOUND') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    logger.error('GET /api/staff/[id] failed', err)
    return NextResponse.json({ success: false, error: 'Failed to load staff member' }, { status: 500 })
  }
}
