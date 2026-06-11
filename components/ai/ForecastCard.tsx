'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TrendingUp, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AI } from '@/lib/constants/copy'
import type { ApiResponse } from '@/types'
import type { ForecastResult } from '@/app/api/ai/forecast/route'

interface ForecastCardProps {
  productId: string
  productName: string
  currentStock: number
}

const CONFIDENCE_STYLES = {
  high:   'bg-brand-light text-brand border-brand/20',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low:    'bg-zinc-100 text-zinc-500 border-zinc-200',
}

export function ForecastCard({ productId, productName, currentStock }: ForecastCardProps) {
  const [result, setResult] = useState<ForecastResult | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/ai/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const json: ApiResponse<ForecastResult> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    onSuccess: (data) => setResult(data),
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-zinc-900 truncate">{productName}</p>
          <p className="text-xs text-zinc-500">{AI.CURRENT_STOCK}: {currentStock} units</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
          className="shrink-0"
        >
          {mutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <TrendingUp className="h-3.5 w-3.5" />}
          <span className="ml-1.5">{mutation.isPending ? AI.ANALYSING : AI.FORECAST}</span>
        </Button>
      </div>

      {mutation.isPending && <Skeleton className="h-16 w-full rounded" />}

      {result && (
        <div className="rounded-md bg-zinc-50 p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">{AI.RESTOCK_QTY}</span>
            <span className="font-semibold text-brand">{result.recommendedRestockQty} units</span>
          </div>
          {result.daysUntilStockout !== null && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">{AI.DAYS_UNTIL_STOCKOUT}</span>
              <span className={`font-medium ${result.daysUntilStockout <= 7 ? 'text-red-600' : 'text-zinc-900'}`}>
                {result.daysUntilStockout === 0 ? 'Out of stock' : `~${result.daysUntilStockout} days`}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">{AI.CONFIDENCE}</span>
            <Badge variant="outline" className={`text-xs ${CONFIDENCE_STYLES[result.confidence]}`}>
              {result.confidence}
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 border-t border-zinc-200 pt-2">{result.reasoning}</p>
        </div>
      )}
    </div>
  )
}
