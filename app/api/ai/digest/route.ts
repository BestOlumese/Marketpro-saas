import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/clerk/helpers'
import { genAI, AI_MODEL } from '@/lib/google/client'
import { SYSTEM_PROMPTS } from '@/lib/google/prompts'
import { checkAndIncrementAiQuota } from '@/lib/google/quota'
import { getSalesByShop } from '@/lib/db/queries/sales'
import { getProductsByShop } from '@/lib/db/queries/products'
import { formatCurrency } from '@/lib/utils/formatters'
import { logger } from '@/lib/logger'
import type { ApiResponse } from '@/types'

interface DigestResult {
  digest: string
  generatedAt: string
}

export async function POST(): Promise<NextResponse<ApiResponse<DigestResult>>> {
  try {
    const ctx = await getAuthContext()

    if (!['owner', 'manager', 'accountant'].includes(ctx.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const quota = await checkAndIncrementAiQuota(ctx.shopId)
    if (!quota.allowed) {
      return NextResponse.json({ success: false, error: quota.error ?? 'AI quota exceeded' }, { status: 403 })
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [sales, products] = await Promise.all([
      getSalesByShop(ctx.shopId, { from: sevenDaysAgo, limit: 500 }),
      getProductsByShop(ctx.shopId),
    ])

    const completed     = sales.filter((s) => s.status === 'completed')
    const voided        = sales.filter((s) => s.status === 'voided')
    const revenue       = completed.reduce((s, sale) => s + sale.total, 0)
    const lowStock      = products.filter((p) => p.stock <= p.lowStockAt && !p.deletedAt)
    const cashSales     = completed.filter((s) => s.paymentMethod === 'cash').length
    const transferSales = completed.filter((s) => s.paymentMethod === 'transfer').length

    const weekData = [
      `Week: ${sevenDaysAgo.toLocaleDateString('en-NG')} to ${new Date().toLocaleDateString('en-NG')}`,
      `Total sales: ${completed.length}`,
      `Total revenue: ${formatCurrency(revenue / 100)}`,
      `Voided sales: ${voided.length}`,
      `Cash: ${cashSales}, Transfer: ${transferSales}`,
      `Low stock items: ${lowStock.length} (${lowStock.slice(0, 3).map((p) => p.name).join(', ')})`,
      `Average sale: ${formatCurrency(completed.length ? revenue / completed.length / 100 : 0)}`,
    ].join('\n')

    const model = genAI.getGenerativeModel({
      model: AI_MODEL,
      systemInstruction: SYSTEM_PROMPTS.weeklyDigest(weekData),
    })

    const response = await model.generateContent('Generate my weekly digest.')
    const digest = response.response.text()

    return NextResponse.json({
      success: true,
      data: { digest, generatedAt: new Date().toISOString() },
    })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'SHOP_NOT_FOUND')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    logger.error('POST /api/ai/digest failed', err)
    return NextResponse.json({ success: false, error: 'Digest generation failed' }, { status: 500 })
  }
}
