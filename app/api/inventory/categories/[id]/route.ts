import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getShopId } from '@/lib/clerk/helpers'
import { updateCategory, deleteCategory } from '@/lib/db/queries/categories'
import { categorySchema } from '@/lib/validations/category.schema'
import type { ApiResponse, Category } from '@/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Category>>> {
  try {
    await requireRole(['org:admin', 'org:manager'])
    const shopId = await getShopId()
    const { id } = await params
    const body: unknown = await req.json()
    const parsed = categorySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 }
      )
    }
    const category = await updateCategory(shopId, id, parsed.data)
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: category })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Category>>> {
  try {
    await requireRole(['org:admin', 'org:manager'])
    const shopId = await getShopId()
    const { id } = await params
    const category = await deleteCategory(shopId, id)
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: category })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 })
  }
}
