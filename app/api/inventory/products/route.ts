import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getShopId } from '@/lib/clerk/helpers'
import { getProductsByShop, createProduct } from '@/lib/db/queries/products'
import { productSchema } from '@/lib/validations/product.schema'
import type { ApiResponse, ProductWithRelations } from '@/types'
import type { Product } from '@/lib/db/schema'

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<ProductWithRelations[]>>> {
  try {
    await requireRole(['org:admin', 'org:manager', 'org:cashier'])
    const shopId = await getShopId()
    const search = req.nextUrl.searchParams.get('search') ?? undefined
    const data = await getProductsByShop(shopId, search)
    return NextResponse.json({ success: true, data: data as ProductWithRelations[] })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<Product>>> {
  try {
    await requireRole(['org:admin', 'org:manager'])
    const shopId = await getShopId()
    const body: unknown = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 }
      )
    }
    const product = await createProduct({
      ...parsed.data,
      shopId,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    })
    return NextResponse.json({ success: true, data: product }, { status: 201 })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
