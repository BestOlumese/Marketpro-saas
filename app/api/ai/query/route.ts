import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthContext } from '@/lib/clerk/helpers'
import { genAI, AI_MODEL } from '@/lib/google/client'
import { SYSTEM_PROMPTS } from '@/lib/google/prompts'
import { checkAndIncrementAiQuota } from '@/lib/google/quota'
import { getProductsByShop } from '@/lib/db/queries/products'
import { getStaffListWithSalesCounts } from '@/lib/db/queries/staff'
import { getSalesSummary, getTopProducts, getStaffPerformance } from '@/lib/db/queries/reports'
import { formatCurrency } from '@/lib/utils/formatters'
import { logger } from '@/lib/logger'
import type { ApiResponse } from '@/types'

const querySchema = z.object({
  question: z.string().min(1).max(500),
})

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

async function buildContext(shopId: string): Promise<string> {
  const now          = new Date()
  const thirtyAgo    = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const from         = dateStr(thirtyAgo)
  const to           = dateStr(now)
  const todayStr     = dateStr(now)

  const [products, dailySales, topProducts, staffPerf, staffList] = await Promise.all([
    getProductsByShop(shopId),
    getSalesSummary(shopId, from, to),
    getTopProducts(shopId, from, to, 20),
    getStaffPerformance(shopId, from, to),
    getStaffListWithSalesCounts(shopId),
  ])

  // ── Overview ───────────────────────────────────────────────
  const completed    = dailySales
  const totalRev     = completed.reduce((s, d) => s + d.revenue, 0)
  const totalSales   = completed.reduce((s, d) => s + d.count, 0)
  const todaySales   = dailySales.find((d) => d.date === todayStr)
  const avgSale      = totalSales > 0 ? totalRev / totalSales : 0

  // ── Products ───────────────────────────────────────────────
  const activeProducts   = products.filter((p) => !p.deletedAt)
  const outOfStock       = activeProducts.filter((p) => p.stock === 0)
  const lowStock         = activeProducts.filter((p) => p.stock > 0 && p.stock <= p.lowStockAt)
  const wellStocked      = activeProducts.filter((p) => p.stock > p.lowStockAt)

  const lines: string[] = []

  // Section 1: Overview
  lines.push('=== SHOP OVERVIEW (last 30 days) ===')
  lines.push(`Period: ${from} to ${to}`)
  lines.push(`Total completed sales: ${totalSales}`)
  lines.push(`Total revenue: ${formatCurrency(totalRev / 100)}`)
  lines.push(`Average sale value: ${formatCurrency(avgSale / 100)}`)
  if (todaySales) {
    lines.push(`Today (${todayStr}): ${todaySales.count} sales, ${formatCurrency(todaySales.revenue / 100)}`)
  } else {
    lines.push(`Today: no sales yet`)
  }
  lines.push('')

  // Section 2: Products
  lines.push('=== INVENTORY ===')
  lines.push(`Total products: ${activeProducts.length}`)
  lines.push(`Out of stock (${outOfStock.length}): ${outOfStock.map((p) => p.name).join(', ') || 'none'}`)
  lines.push(`Low stock (${lowStock.length}): ${lowStock.map((p) => `${p.name} (stock: ${p.stock}, threshold: ${p.lowStockAt})`).join(', ') || 'none'}`)
  lines.push('')
  lines.push('All products (name | stock | price | status):')
  activeProducts.forEach((p) => {
    const stockLabel = p.stock === 0 ? 'OUT OF STOCK' : p.stock <= p.lowStockAt ? 'LOW' : 'OK'
    lines.push(`  - ${p.name}: stock=${p.stock}, price=${formatCurrency(p.price / 100)}, status=${stockLabel}`)
  })
  lines.push('')

  // Section 3: Best sellers
  lines.push('=== BEST SELLING PRODUCTS (last 30 days) ===')
  if (topProducts.length === 0) {
    lines.push('  No sales data available for this period.')
  } else {
    topProducts.forEach((p, i) => {
      lines.push(`  ${i + 1}. ${p.name} — ${p.totalQty} units sold — ${formatCurrency(p.totalRevenue / 100)}`)
    })
  }
  lines.push('')

  // Section 4: Daily sales breakdown
  lines.push('=== DAILY SALES (last 30 days) ===')
  if (dailySales.length === 0) {
    lines.push('  No sales in this period.')
  } else {
    dailySales.forEach((d) => {
      lines.push(`  ${d.date}: ${d.count} sale${d.count !== 1 ? 's' : ''}, ${formatCurrency(d.revenue / 100)}`)
    })
  }
  lines.push('')

  // Section 5: Staff
  lines.push('=== STAFF ===')
  lines.push(`Total staff: ${staffList.length}`)
  staffList.forEach((s) => {
    const perf = staffPerf.find((p) => p.staffId === s.id)
    const salesCount = s.sales.length
    const rev = s.sales.reduce((sum, sale) => sum + sale.total, 0)
    lines.push(`  - ${s.name} (${s.role}): ${salesCount} sales this month, ${formatCurrency(rev / 100)} revenue`)
  })

  return lines.join('\n')
}

export async function POST(req: NextRequest): Promise<Response | NextResponse<ApiResponse<null>>> {
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
    const parsed = querySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid question' }, { status: 400 })
    }

    const context = await buildContext(ctx.shopId)

    const model = genAI.getGenerativeModel({
      model: AI_MODEL,
      systemInstruction: SYSTEM_PROMPTS.queryAssistant(context),
    })

    const result = await model.generateContentStream(parsed.data.question)

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text()
          if (text) controller.enqueue(new TextEncoder().encode(text))
        }
        controller.close()
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'SHOP_NOT_FOUND')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    logger.error('POST /api/ai/query failed', err)
    return NextResponse.json({ success: false, error: 'AI query failed' }, { status: 500 })
  }
}
