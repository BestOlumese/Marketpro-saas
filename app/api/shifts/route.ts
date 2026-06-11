import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/clerk/helpers'
import { getShiftHistory, getActiveShift, openShift } from '@/lib/db/queries/shifts'
import { openShiftSchema } from '@/lib/validations/shift.schema'
import { logger } from '@/lib/logger'
import type { ApiResponse, ShiftWithStaff, Shift } from '@/types'

export async function GET(): Promise<NextResponse<ApiResponse<ShiftWithStaff[]>>> {
  try {
    const ctx = await getAuthContext()

    const history = ctx.role === 'cashier'
      ? await getShiftHistory(ctx.shopId, ctx.staffId)
      : await getShiftHistory(ctx.shopId)

    return NextResponse.json({ success: true, data: history as ShiftWithStaff[] })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'SHOP_NOT_FOUND')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    logger.error('GET /api/shifts failed', err)
    return NextResponse.json({ success: false, error: 'Failed to load shifts' }, { status: 500 })
  }
}

export async function POST(req: Request): Promise<NextResponse<ApiResponse<Shift>>> {
  try {
    const ctx = await getAuthContext()

    const existing = await getActiveShift(ctx.staffId, ctx.shopId)
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You already have an open shift', code: 'SHIFT_ALREADY_OPEN' },
        { status: 409 },
      )
    }

    const body: unknown = await req.json()
    const parsed = openShiftSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 })
    }

    const shift = await openShift({ shopId: ctx.shopId, staffId: ctx.staffId, openingCash: parsed.data.openingCash })
    return NextResponse.json({ success: true, data: shift }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'SHOP_NOT_FOUND')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    logger.error('POST /api/shifts failed', err)
    return NextResponse.json({ success: false, error: 'Failed to open shift' }, { status: 500 })
  }
}
