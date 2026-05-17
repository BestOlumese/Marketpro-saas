import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getShopId } from '@/lib/clerk/helpers'
import { getProductById, updateProduct, softDeleteProduct } from '@/lib/db/queries/products'
import { updateProductSchema } from '@/lib/validations/product.schema'
import type { ApiResponse, ProductWithRelations, Product } from '@/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  _req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<ProductWithRelations>>> {
  try {
    await requireRole(['org:admin', 'org:manager', 'org:cashier'])
    const shopId = await getShopId()
    const { id } = await params
    const product = await getProductById(shopId, id)
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: product as ProductWithRelations })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Product>>> {
  try {
    await requireRole(['org:admin', 'org:manager'])
    const shopId = await getShopId()
    const { id } = await params
    const body: unknown = await req.json()
    const parsed = updateProductSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 }
      )
    }
    const product = await updateProduct(shopId, id, {
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
    })
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: product })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Product>>> {
  try {
    await requireRole(['org:admin', 'org:manager'])
    const shopId = await getShopId()
    const { id } = await params
    const product = await softDeleteProduct(shopId, id)
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: product })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
