'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DateRangePicker } from '@/components/reports/DateRangePicker'
import { SalesSummaryChart } from '@/components/reports/SalesSummaryChart'
import { ExportButton } from '@/components/reports/ExportButton'
import { useSalesSummary, useProfitReport } from '@/lib/hooks/useReports'
import { formatCurrency, formatPercent } from '@/lib/utils/formatters'
import { REPORTS } from '@/lib/constants/copy'
import { Skeleton } from '@/components/ui/skeleton'

function toISO(d: Date) { return d.toISOString().slice(0, 10) }

function defaultRange() {
  const now   = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  return { from: toISO(start), to: toISO(now) }
}

export default function ReportsPage() {
  const [{ from, to }, setRange] = useState(defaultRange)

  const summary = useSalesSummary(from, to)
  const profit  = useProfitReport(from, to)

  const totalRevenue = summary.data?.reduce((s, d) => s + d.revenue, 0) ?? 0
  const totalSales   = summary.data?.reduce((s, d) => s + d.count, 0) ?? 0

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title={REPORTS.SUMMARY_TITLE} description={REPORTS.DESCRIPTION} />
        <ExportButton from={from} to={to} />
      </div>

      <DateRangePicker from={from} to={to} onChange={(f, t) => setRange({ from: f, to: t })} />

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label={REPORTS.REVENUE} value={formatCurrency(totalRevenue / 100)} loading={summary.isLoading} accent />
        <MetricCard label={REPORTS.SALES_COUNT} value={totalSales.toLocaleString('en-NG')} loading={summary.isLoading} />
        <MetricCard
          label={REPORTS.PROFIT}
          value={profit.data ? formatCurrency(profit.data.profit / 100) : '—'}
          loading={profit.isLoading}
          accent={!!profit.data && profit.data.profit >= 0}
          danger={!!profit.data && profit.data.profit < 0}
        />
        <MetricCard
          label={REPORTS.MARGIN}
          value={profit.data ? formatPercent(profit.data.margin) : '—'}
          loading={profit.isLoading}
        />
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-zinc-900 mb-4">{REPORTS.CHART_LABEL}</p>
        <SalesSummaryChart data={summary.data ?? []} isLoading={summary.isLoading} />
      </div>

      {/* Profit breakdown */}
      {!profit.isLoading && profit.data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-zinc-500 mb-1">{REPORTS.REVENUE}</p>
            <p className="text-xl font-bold text-zinc-900 tabular-nums">
              {formatCurrency(profit.data.revenue / 100)}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-zinc-500 mb-1">{REPORTS.COST}</p>
            <p className="text-xl font-bold text-zinc-900 tabular-nums">
              {formatCurrency(profit.data.estimatedCost / 100)}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">Based on current cost prices</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-zinc-500 mb-1">{REPORTS.PROFIT}</p>
            <p className={`text-xl font-bold tabular-nums ${profit.data.profit >= 0 ? 'text-brand' : 'text-danger'}`}>
              {formatCurrency(profit.data.profit / 100)}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">{formatPercent(profit.data.margin)} margin</p>
          </div>
        </div>
      )}
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string
  loading?: boolean
  accent?: boolean
  danger?: boolean
}

function MetricCard({ label, value, loading, accent, danger }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-zinc-500 mb-2">{label}</p>
      {loading ? (
        <Skeleton className="h-7 w-28" />
      ) : (
        <p className={`text-2xl font-bold tabular-nums ${accent ? 'text-brand' : danger ? 'text-danger' : 'text-zinc-900'}`}>
          {value}
        </p>
      )}
    </div>
  )
}
