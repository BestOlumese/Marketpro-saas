'use client'

import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SHIFTS } from '@/lib/constants/copy'
import { formatCurrency } from '@/lib/utils/formatters'
import type { ApiResponse, ShiftWithStaff } from '@/types'

async function fetchShiftHistory(): Promise<ShiftWithStaff[]> {
  const res = await fetch('/api/shifts')
  const json: ApiResponse<ShiftWithStaff[]> = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data
}

function DiscrepancyBadge({ discrepancy }: { discrepancy: number | null }) {
  if (discrepancy === null) return null
  if (discrepancy === 0) {
    return (
      <Badge variant="outline" className="bg-brand-light text-brand border-brand/20 text-xs font-medium">
        Balanced
      </Badge>
    )
  }
  if (discrepancy > 0) {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
        +{formatCurrency(discrepancy / 100)}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
      {formatCurrency(discrepancy / 100)}
    </Badge>
  )
}

interface ShiftHistoryProps {
  staffId?: string
}

export function ShiftHistory({ staffId: _staffId }: ShiftHistoryProps) {
  const { data: shifts, isLoading } = useQuery({
    queryKey: ['shiftHistory'],
    queryFn: fetchShiftHistory,
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (!shifts || shifts.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white px-6 py-10 text-center">
        <p className="text-sm text-zinc-500">{SHIFTS.HISTORY_EMPTY}</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-zinc-100 rounded-lg border border-brand/20 bg-white overflow-hidden">
      {shifts.map((shift) => (
        <div
          key={shift.id}
          className={`flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between transition-colors ${
            shift.status === 'open' ? 'bg-brand-light/50' : 'hover:bg-zinc-50'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`h-2 w-2 rounded-full shrink-0 ${shift.status === 'open' ? 'bg-brand' : 'bg-zinc-300'}`} />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-900 truncate">{shift.staff.name}</span>
                <Badge
                  variant="outline"
                  className={shift.status === 'open'
                    ? 'bg-brand-light text-brand border-brand/30 text-xs font-semibold'
                    : 'bg-zinc-100 text-zinc-500 border-zinc-200 text-xs'}
                >
                  {shift.status === 'open' ? SHIFTS.STATUS_OPEN : SHIFTS.STATUS_CLOSED}
                </Badge>
              </div>
              <span className="text-xs text-zinc-500">
                {new Date(shift.openedAt).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' })}
                {shift.closedAt && (
                  <> → {new Date(shift.closedAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}</>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-right">
            {shift.status === 'closed' && (
              <>
                <div className="hidden sm:flex flex-col items-end text-xs text-zinc-500">
                  <span>{SHIFTS.OPENING_CASH}: <span className="font-medium text-zinc-700">{formatCurrency(shift.openingCash / 100)}</span></span>
                  {shift.closingCash !== null && (
                    <span>{SHIFTS.CLOSING_CASH}: <span className="font-medium text-zinc-700">{formatCurrency(shift.closingCash / 100)}</span></span>
                  )}
                </div>
                <DiscrepancyBadge discrepancy={shift.discrepancy} />
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
