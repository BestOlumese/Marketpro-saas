import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/clerk/helpers'
import { genAI, AI_MODEL } from '@/lib/google/client'
import { SYSTEM_PROMPTS } from '@/lib/google/prompts'
import { checkAndIncrementAiQuota } from '@/lib/google/quota'
import { getSalesByShop } from '@/lib/db/queries/sales'
import { logger } from '@/lib/logger'
import type { ApiResponse } from '@/types'

export interface Anomaly {
  type: string
  description: string
  severity: 'high' | 'medium' | 'low'
  date: string | null
}

export interface AnomalyResult {
  anomalies: Anomaly[]
}

export async function GET(): Promise<NextResponse<ApiResponse<AnomalyResult>>> {
  try {
    const ctx = await getAuthContext()

    if (!['owner', 'manager', 'accountant'].includes(ctx.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const quota = await checkAndIncrementAiQuota(ctx.shopId)
    if (!quota.allowed) {
      return NextResponse.json({ success: false, error: quota.error ?? 'AI quota exceeded' }, { status: 403 })
    }

    const sales = await getSalesByShop(ctx.shopId, { limit: 200 })
    const salesData = JSON.stringify(
      sales.slice(0, 100).map((s) => ({
        date:          s.createdAt.toISOString().slice(0, 10),
        total:         s.total / 100,
        discount:      s.discount,
        paymentMethod: s.paymentMethod,
        status:        s.status,
        itemCount:     s.items.length,
      })),
    )

    const model = genAI.getGenerativeModel({
      model: AI_MODEL,
      systemInstruction: SYSTEM_PROMPTS.anomalyDetection(salesData),
    })

    const response = await model.generateContent('Detect anomalies.')
    const raw = response.response.text().trim()
    const jsonStr = raw.startsWith('```') ? raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim() : raw
    const result = JSON.parse(jsonStr) as AnomalyResult

    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'SHOP_NOT_FOUND')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    logger.error('GET /api/ai/anomalies failed', err)
    return NextResponse.json({ success: false, error: 'Anomaly detection failed' }, { status: 500 })
  }
}
