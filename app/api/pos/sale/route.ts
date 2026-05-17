import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getShopId, getStaffId } from '@/lib/clerk/helpers'
import { createSale } from '@/lib/db/queries/sales'
import { createSaleSchema } from '@/lib/validations/sale.schema'
import type { ApiResponse } from '@/types'
import type { SaleWithItems } from '@/lib/db/queries/sales'

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<SaleWithItems>>> {
  try {
    await requireRole(['org:admin', 'org:manager', 'org:cashier'])
    const shopId  = await getShopId()
    const staffId = await getStaffId()

    const body: unknown = await req.json()
    const parsed = createSaleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 }
      )
    }

    const sale = await createSale(shopId, {
      staffId,
      customerId:    parsed.data.customerId ?? null,
      paymentMethod: parsed.data.paymentMethod,
      discount:      parsed.data.discount,
      note:          parsed.data.note ?? null,
      items:         parsed.data.items,
    })

    return NextResponse.json({ success: true, data: sale }, { status: 201 })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to process sale' },
      { status: 500 }
    )
  }
}
