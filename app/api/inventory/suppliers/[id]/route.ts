import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getShopId } from '@/lib/clerk/helpers'
import { updateSupplier, deleteSupplier } from '@/lib/db/queries/suppliers'
import { updateSupplierSchema } from '@/lib/validations/supplier.schema'
import type { ApiResponse, Supplier } from '@/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Supplier>>> {
  try {
    await requireRole(['owner', 'manager', 'inventory_manager'])
    const shopId = await getShopId()
    const { id } = await params
    const body: unknown = await req.json()
    const parsed = updateSupplierSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 }
      )
    }
    const supplier = await updateSupplier(shopId, id, parsed.data)
    if (!supplier) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: supplier })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update supplier' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Supplier>>> {
  try {
    await requireRole(['owner', 'manager', 'inventory_manager'])
    const shopId = await getShopId()
    const { id } = await params
    const supplier = await deleteSupplier(shopId, id)
    if (!supplier) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: supplier })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete supplier' }, { status: 500 })
  }
}
