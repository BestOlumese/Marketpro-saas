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

const pricingSchema = z.object({
  productId: z.string().uuid(),
})

export interface PricingResult {
  currentPrice: number
  suggestedPrice: number
  changePercent: number
  reasoning: string
  confidence: 'high' | 'medium' | 'low'
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<PricingResult>>> {
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
    const parsed = pricingSchema.safeParse(body)
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
      `Current price: ₦${product.price / 100}`,
      `Cost price: ₦${product.costPrice / 100}`,
      `Margin: ${(((product.price - product.costPrice) / product.price) * 100).toFixed(1)}%`,
      `Units sold last 30 days: ${totalSold}`,
      `Current stock: ${product.stock}`,
    ].join('\n')

    const model = genAI.getGenerativeModel({
      model: AI_MODEL,
      systemInstruction: SYSTEM_PROMPTS.pricingSuggestion(productData),
    })

    const response = await model.generateContent('Suggest optimal pricing.')
    const raw = response.response.text().trim()
    const jsonStr = raw.startsWith('```') ? raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim() : raw
    const result = JSON.parse(jsonStr) as PricingResult

    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'SHOP_NOT_FOUND')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    logger.error('POST /api/ai/pricing failed', err)
    return NextResponse.json({ success: false, error: 'Pricing suggestion failed' }, { status: 500 })
  }
}
