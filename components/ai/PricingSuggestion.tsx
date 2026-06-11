'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Tag, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/formatters'
import { AI } from '@/lib/constants/copy'
import type { ApiResponse } from '@/types'
import type { PricingResult } from '@/app/api/ai/pricing/route'

interface PricingSuggestionProps {
  productId: string
  productName: string
  currentPrice: number
}

const CONFIDENCE_STYLES = {
  high:   'bg-brand-light text-brand border-brand/20',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low:    'bg-zinc-100 text-zinc-500 border-zinc-200',
}

export function PricingSuggestion({ productId, productName, currentPrice }: PricingSuggestionProps) {
  const [result, setResult] = useState<PricingResult | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/ai/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const json: ApiResponse<PricingResult> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    onSuccess: (data) => setResult(data),
    onError: (err: Error) => toast.error(err.message),
  })

  const PriceChangeIcon = !result ? Minus :
    result.changePercent > 0 ? TrendingUp :
    result.changePercent < 0 ? TrendingDown : Minus

  const priceChangeColor = !result ? 'text-zinc-400' :
    result.changePercent > 0 ? 'text-brand' :
    result.changePercent < 0 ? 'text-red-500' : 'text-zinc-400'

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-zinc-900 truncate">{productName}</p>
          <p className="text-xs text-zinc-500">{AI.CURRENT_PRICE}: {formatCurrency(currentPrice / 100)}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
          className="shrink-0"
        >
          {mutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Tag className="h-3.5 w-3.5" />}
          <span className="ml-1.5">{mutation.isPending ? AI.ANALYSING : AI.SUGGEST_PRICE}</span>
        </Button>
      </div>

      {mutation.isPending && <Skeleton className="h-16 w-full rounded" />}

      {result && (
        <div className="rounded-md bg-zinc-50 p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">{AI.SUGGESTED_PRICE}</span>
            <div className="flex items-center gap-1.5">
              <PriceChangeIcon className={`h-3.5 w-3.5 ${priceChangeColor}`} />
              <span className={`font-semibold ${priceChangeColor}`}>
                {formatCurrency(result.suggestedPrice / 100)}
              </span>
              <span className="text-xs text-zinc-400">
                ({result.changePercent > 0 ? '+' : ''}{result.changePercent.toFixed(1)}%)
              </span>
            </div>
          </div>
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
