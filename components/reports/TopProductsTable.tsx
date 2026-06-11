'use client'

import { formatCurrency } from '@/lib/utils/formatters'
import { REPORTS } from '@/lib/constants/copy'
import { Skeleton } from '@/components/ui/skeleton'
import type { TopProduct } from '@/lib/db/queries/reports'

interface TopProductsTableProps {
  data: TopProduct[]
  isLoading?: boolean
}

export function TopProductsTable({ data, isLoading }: TopProductsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-zinc-400">{REPORTS.NO_DATA}</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-110 text-sm">
        <thead>
          <tr className="border-b border-zinc-100">
            <th className="pb-2 text-left text-xs font-medium text-zinc-500 w-8">{REPORTS.RANK}</th>
            <th className="pb-2 text-left text-xs font-medium text-zinc-500">{REPORTS.PRODUCT}</th>
            <th className="pb-2 text-right text-xs font-medium text-zinc-500 whitespace-nowrap">{REPORTS.UNITS_SOLD}</th>
            <th className="pb-2 text-right text-xs font-medium text-zinc-500 whitespace-nowrap">{REPORTS.REVENUE}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.productId ?? row.name} className="border-b border-zinc-50 hover:bg-zinc-50">
              <td className="py-2.5 text-zinc-400 font-mono text-xs">{i + 1}</td>
              <td className="py-2.5 font-medium text-zinc-900 max-w-48 truncate">
                {row.name}
              </td>
              <td className="py-2.5 text-right text-zinc-600 tabular-nums whitespace-nowrap">{row.totalQty.toLocaleString('en-NG')}</td>
              <td className="py-2.5 text-right font-medium text-zinc-900 tabular-nums whitespace-nowrap">
                {formatCurrency(row.totalRevenue / 100)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
