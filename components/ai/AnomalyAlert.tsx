'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AlertTriangle, CheckCircle2, Loader2, ScanSearch } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AI } from '@/lib/constants/copy'
import type { ApiResponse } from '@/types'
import type { AnomalyResult } from '@/app/api/ai/anomalies/route'

type State = 'idle' | 'loading' | 'done'

const SEVERITY_STYLES = {
  high:   'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low:    'bg-zinc-100 text-zinc-500 border-zinc-200',
}

export function AnomalyAlert() {
  const queryClient = useQueryClient()
  const [uiState, setUiState] = useState<State>('idle')
  const [result, setResult] = useState<AnomalyResult | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/ai/anomalies')
      const json: ApiResponse<AnomalyResult> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    onMutate: () => setUiState('loading'),
    onSuccess: (data) => {
      setResult(data)
      setUiState('done')
      void queryClient.invalidateQueries({ queryKey: ['me', 'shop'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || AI.ANOMALY_ERROR)
      setUiState('idle')
    },
  })

  if (uiState === 'idle') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => mutation.mutate()}
        className="gap-2"
      >
        <ScanSearch className="h-4 w-4" />
        {AI.DETECT_ANOMALIES}
      </Button>
    )
  }

  if (uiState === 'loading') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin text-brand" />
          {AI.ANALYSING}
        </div>
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    )
  }

  if (!result?.anomalies.length) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-brand/20 bg-brand-light px-4 py-3 text-sm text-brand">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        {AI.NO_ANOMALIES}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {result.anomalies.map((anomaly, i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3">
          <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${
            anomaly.severity === 'high'   ? 'text-red-500' :
            anomaly.severity === 'medium' ? 'text-amber-500' : 'text-zinc-400'
          }`} />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-zinc-900">{anomaly.type}</span>
              <Badge variant="outline" className={`text-xs ${SEVERITY_STYLES[anomaly.severity]}`}>
                {anomaly.severity}
              </Badge>
              {anomaly.date && (
                <span className="text-xs text-zinc-400">{anomaly.date}</span>
              )}
            </div>
            <p className="text-xs text-zinc-500">{anomaly.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
