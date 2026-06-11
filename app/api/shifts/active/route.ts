import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/clerk/helpers'
import { getActiveShift } from '@/lib/db/queries/shifts'
import { logger } from '@/lib/logger'
import type { ApiResponse, Shift } from '@/types'

export async function GET(): Promise<NextResponse<ApiResponse<Shift | null>>> {
  try {
    const ctx = await getAuthContext()
    const shift = await getActiveShift(ctx.staffId, ctx.shopId)
    return NextResponse.json({ success: true, data: shift ?? null })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'SHOP_NOT_FOUND')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    logger.error('GET /api/shifts/active failed', err)
    return NextResponse.json({ success: false, error: 'Failed to load active shift' }, { status: 500 })
  }
}
