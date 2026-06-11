import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { getAuthContext } from '@/lib/clerk/helpers'
import { genAI, AI_MODEL } from '@/lib/google/client'
import { SYSTEM_PROMPTS } from '@/lib/google/prompts'
import { checkAndIncrementAiQuota } from '@/lib/google/quota'
import { db } from '@/lib/db'
import { products, saleItems, sales } from '@/lib/db/schema'
import { logger } from '@/lib/logger'
import type { ApiResponse } from '@/types'

const forecastSchema = z.object({
  productId: z.string().uuid(),
})

export interface ForecastResult {
  recommendedRestockQty: number
  daysUntilStockout: number | null
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<ForecastResult>>> {
  try {
    const ctx = await getAuthContext()

    if (!['owner', 'manager', 'accountant'].includes(ctx.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const quota = await checkAndIncrementAiQuota(ctx.shopId)
    if (!quota.allowed) {
      return NextResponse.json({ success: false, error: quota.error ?? 'AI quota exceeded' }, { status: 403 })
    }

    const body: unknown = await req.json()
    const parsed = forecastSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid product ID' }, { status: 400 })
    }

    const product = await db.query.products.findFirst({
      where: and(eq(products.id, parsed.data.productId), eq(products.shopId, ctx.shopId)),
    })
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    const recentItems = await db
      .select({ quantity: saleItems.quantity })
      .from(saleItems)
      .innerJoin(sales, and(eq(saleItems.saleId, sales.id), eq(sales.status, 'completed')))
      .where(eq(saleItems.productId, product.id))
      .limit(100)

    const totalSold = recentItems.reduce((s, r) => s + r.quantity, 0)

    const productData = [
      `Name: ${product.name}`,
      `Current stock: ${product.stock}`,
      `Price: ₦${product.price / 100}`,
      `Low stock threshold: ${product.lowStockAt}`,
      `Units sold in last 30 days: ${totalSold}`,
      `Daily average: ${(totalSold / 30).toFixed(1)}`,
    ].join('\n')

    const model = genAI.getGenerativeModel({
      model: AI_MODEL,
      systemInstruction: SYSTEM_PROMPTS.demandForecast(productData),
    })

    const response = await model.generateContent('Analyse and forecast.')
    const raw = response.response.text().trim()

    const jsonStr = raw.startsWith('```') ? raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim() : raw
    const result = JSON.parse(jsonStr) as ForecastResult

    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'SHOP_NOT_FOUND')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    logger.error('POST /api/ai/forecast failed', err)
    return NextResponse.json({ success: false, error: 'Forecast failed' }, { status: 500 })
  }
}
