import { NextResponse } from 'next/server'
import { requireRole, getShopId } from '@/lib/clerk/helpers'
import { getLowStockProducts } from '@/lib/db/queries/products'
import type { ApiResponse } from '@/types'
import type { Product } from '@/lib/db/schema'

export async function GET(): Promise<NextResponse<ApiResponse<Product[]>>> {
  try {
    await requireRole(['owner', 'manager', 'accountant', 'inventory_manager'])
    const shopId = await getShopId()
    const data = await getLowStockProducts(shopId)
    return NextResponse.json({ success: true, data: data as Product[] })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch low-stock products' },
      { status: 500 }
    )
  }
}
