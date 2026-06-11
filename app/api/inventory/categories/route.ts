import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getShopId } from '@/lib/clerk/helpers'
import { getCategoriesByShop, createCategory } from '@/lib/db/queries/categories'
import { categorySchema } from '@/lib/validations/category.schema'
import type { ApiResponse } from '@/types'
import type { Category } from '@/lib/db/schema'

export async function GET(): Promise<NextResponse<ApiResponse<Category[]>>> {
  try {
    await requireRole(['owner', 'manager', 'accountant', 'inventory_manager', 'cashier'])
    const shopId = await getShopId()
    const data = await getCategoriesByShop(shopId)
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<Category>>> {
  try {
    await requireRole(['owner', 'manager', 'inventory_manager'])
    const shopId = await getShopId()
    const body: unknown = await req.json()
    const parsed = categorySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 }
      )
    }
    const category = await createCategory({ ...parsed.data, shopId })
    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
