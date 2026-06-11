import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getShopId } from '@/lib/clerk/helpers'
import { voidSale } from '@/lib/db/queries/sales'
import { voidSaleSchema } from '@/lib/validations/sale.schema'
import type { ApiResponse } from '@/types'

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<{ saleId: string }>>> {
  try {
    await requireRole(['owner', 'manager'])
    const shopId = await getShopId()

    const body: unknown = await req.json()
    const parsed = voidSaleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 }
      )
    }

    await voidSale(shopId, parsed.data.saleId)
    return NextResponse.json({ success: true, data: { saleId: parsed.data.saleId } })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to void sale' },
      { status: 500 }
    )
  }
}
