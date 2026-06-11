import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/clerk/helpers'
import { createSale } from '@/lib/db/queries/sales'
import { createSaleSchema } from '@/lib/validations/sale.schema'
import { logger } from '@/lib/logger'
import type { ApiResponse } from '@/types'
import type { SaleWithItems } from '@/lib/db/queries/sales'

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<SaleWithItems>>> {
  try {
    const ctx = await getAuthContext()

    const body: unknown = await req.json()
    const parsed = createSaleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 },
      )
    }

    const sale = await createSale(ctx.shopId, {
      staffId:       ctx.staffId,
      customerId:    parsed.data.customerId ?? null,
      paymentMethod: parsed.data.paymentMethod,
      discount:      parsed.data.discount,
      note:          parsed.data.note ?? null,
      items:         parsed.data.items,
    })

    return NextResponse.json({ success: true, data: sale }, { status: 201 })
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'UNAUTHORIZED' || err.message === 'UNAUTHORISED') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }
      if (err.message === 'SHOP_NOT_FOUND') {
        return NextResponse.json({ success: false, error: 'Shop not found' }, { status: 404 })
      }
    }
    logger.error('POST /api/pos/sale failed', err)
    return NextResponse.json(
      { success: false, error: 'Failed to process sale' },
      { status: 500 },
    )
  }
}
