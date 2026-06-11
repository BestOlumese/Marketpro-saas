import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import { requireRole, getShopId } from '@/lib/clerk/helpers'
import { bulkCreateProducts } from '@/lib/db/queries/products'
import { getCategoriesByShop } from '@/lib/db/queries/categories'
import { bulkProductRowSchema } from '@/lib/validations/product.schema'
import type { ApiResponse } from '@/types'
import type { NewProduct } from '@/lib/db/schema'

interface BulkResult {
  imported: number
  failed: number
  errors: Array<{ row: number; reason: string }>
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<BulkResult>>> {
  try {
    await requireRole(['owner', 'manager', 'inventory_manager'])
    const shopId = await getShopId()

    const formData = await req.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    const { data: rows } = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    })

    const categories = await getCategoriesByShop(shopId)
    const categoryMap = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]))

    const toInsert: NewProduct[] = []
    const errors: BulkResult['errors'] = []

    rows.forEach((row, index) => {
      const parsed = bulkProductRowSchema.safeParse(row)
      if (!parsed.success) {
        errors.push({
          row: index + 2,
          reason: parsed.error.issues[0]?.message ?? 'Invalid row',
        })
        return
      }

      const { name, barcode, price, cost_price, stock, low_stock_at, category, expiry_date } =
        parsed.data

      const categoryId = category ? (categoryMap.get(category.toLowerCase()) ?? null) : null
      const expiresAt =
        expiry_date && expiry_date.trim() !== '' ? new Date(expiry_date) : null

      toInsert.push({
        shopId,
        name,
        barcode: barcode ?? null,
        price: Math.round(price * 100),
        costPrice: Math.round(cost_price * 100),
        stock,
        lowStockAt: low_stock_at,
        categoryId,
        supplierId: null,
        status: 'active',
        expiresAt,
      })
    })

    if (toInsert.length > 0) {
      await bulkCreateProducts(toInsert)
    }

    return NextResponse.json({
      success: true,
      data: { imported: toInsert.length, failed: errors.length, errors },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Bulk import failed' },
      { status: 500 }
    )
  }
}
