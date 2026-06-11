'use client'

import { formatCurrency } from '@/lib/utils/formatters'
import { REPORTS } from '@/lib/constants/copy'
import { Skeleton } from '@/components/ui/skeleton'
import type { StaffPerformance } from '@/lib/db/queries/reports'

interface StaffLeaderboardProps {
  data: StaffPerformance[]
  isLoading?: boolean
}

export function StaffLeaderboard({ data, isLoading }: StaffLeaderboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-zinc-400">{REPORTS.NO_DATA}</p>
  }

  const max = data[0]?.totalRevenue ?? 1

  return (
    <div className="space-y-2">
      {data.map((row, i) => {
        const pct = max > 0 ? Math.round((row.totalRevenue / max) * 100) : 0
        return (
          <div key={row.staffId ?? i} className="rounded-lg border border-zinc-100 bg-white p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-400 w-4">{i + 1}</span>
                <span className="font-medium text-sm text-zinc-900">{row.staffName}</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm text-zinc-900 tabular-nums">
                  {formatCurrency(row.totalRevenue / 100)}
                </p>
                <p className="text-xs text-zinc-400">{row.saleCount} {REPORTS.SALES_COUNT.toLowerCase()}</p>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-100">
              <div
                className="h-1.5 rounded-full bg-brand transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
