import { NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { getAuthContext } from '@/lib/clerk/helpers'
import { closeShift, computeExpectedCash } from '@/lib/db/queries/shifts'
import { db } from '@/lib/db'
import { shifts } from '@/lib/db/schema'
import { closeShiftSchema } from '@/lib/validations/shift.schema'
import { logger } from '@/lib/logger'
import type { ApiResponse, Shift } from '@/types'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<Shift>>> {
  try {
    const ctx = await getAuthContext()
    const { id } = await params

    const shift = await db.query.shifts.findFirst({
      where: and(eq(shifts.id, id), eq(shifts.shopId, ctx.shopId), eq(shifts.status, 'open')),
    })

    if (!shift) {
      return NextResponse.json({ success: false, error: 'Open shift not found' }, { status: 404 })
    }

    if (ctx.role === 'cashier' && shift.staffId !== ctx.staffId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body: unknown = await req.json()
    const parsed = closeShiftSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 })
    }

    const expectedCash = await computeExpectedCash(
      id,
      shift.staffId,
      ctx.shopId,
      shift.openedAt,
      shift.openingCash,
    )

    const closed = await closeShift(id, ctx.shopId, parsed.data.closingCash, expectedCash, parsed.data.note)
    if (!closed) {
      return NextResponse.json({ success: false, error: 'Failed to close shift' }, { status: 500 })
    }

    logger.info('Shift closed', { shiftId: id, staffId: ctx.staffId, discrepancy: closed.discrepancy })
    return NextResponse.json({ success: true, data: closed })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'SHOP_NOT_FOUND')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    logger.error('POST /api/shifts/[id]/close failed', err)
    return NextResponse.json({ success: false, error: 'Failed to close shift' }, { status: 500 })
  }
}
