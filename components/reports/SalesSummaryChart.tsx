'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils/formatters'
import { REPORTS } from '@/lib/constants/copy'
import type { SalesSummaryItem } from '@/lib/db/queries/reports'

interface SalesSummaryChartProps {
  data: SalesSummaryItem[]
  isLoading?: boolean
}

interface TooltipPayload {
  value: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 shadow-md text-sm">
      <p className="text-zinc-500 mb-1">{label}</p>
      <p className="font-semibold text-zinc-900">{formatCurrency((payload[0]?.value ?? 0) / 100)}</p>
    </div>
  )
}

function formatXTick(date: string): string {
  const d = new Date(date + 'T12:00:00Z')
  return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })
}

function formatYTick(value: number): string {
  if (value >= 100000_00) return `₦${(value / 100000_00).toFixed(0)}M`
  if (value >= 100_000)   return `₦${(value / 100_000).toFixed(0)}k`
  return `₦${(value / 100).toFixed(0)}`
}

export function SalesSummaryChart({ data, isLoading }: SalesSummaryChartProps) {
  if (isLoading) {
    return <div className="h-64 rounded-lg bg-zinc-100 animate-pulse" />
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-sm text-zinc-400">{REPORTS.NO_DATA}</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatXTick}
          tick={{ fontSize: 11, fill: '#71717a' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatYTick}
          tick={{ fontSize: 11, fill: '#71717a' }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5' }} />
        <Bar dataKey="revenue" fill="#1D9E75" radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  )
}
