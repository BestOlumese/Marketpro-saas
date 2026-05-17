import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getShopId } from '@/lib/clerk/helpers'
import { getSuppliersByShop, createSupplier } from '@/lib/db/queries/suppliers'
import { supplierSchema } from '@/lib/validations/supplier.schema'
import type { ApiResponse } from '@/types'
import type { Supplier } from '@/lib/db/schema'

export async function GET(): Promise<NextResponse<ApiResponse<Supplier[]>>> {
  try {
    await requireRole(['org:admin', 'org:manager', 'org:cashier'])
    const shopId = await getShopId()
    const data = await getSuppliersByShop(shopId)
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suppliers' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<Supplier>>> {
  try {
    await requireRole(['org:admin', 'org:manager'])
    const shopId = await getShopId()
    const body: unknown = await req.json()
    const parsed = supplierSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 }
      )
    }
    const supplier = await createSupplier({ ...parsed.data, shopId })
    return NextResponse.json({ success: true, data: supplier }, { status: 201 })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create supplier' },
      { status: 500 }
    )
  }
}
