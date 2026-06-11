import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/clerk/helpers'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import type { ApiResponse } from '@/types'

const shiftSchema = z.object({
  action: z.enum(['open', 'close']),
})

interface ShiftResult {
  action: 'open' | 'close'
  shiftId: string | null
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<ShiftResult>>> {
  try {
    await requireRole(['owner', 'manager', 'cashier'])

    const body: unknown = await req.json()
    const parsed = shiftSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 }
      )
    }

    const shiftId = parsed.data.action === 'open' ? randomUUID() : null
    return NextResponse.json({ success: true, data: { action: parsed.data.action, shiftId } })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update shift' },
      { status: 500 }
    )
  }
}
