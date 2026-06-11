'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardMetrics, useTopProducts, useSalesSummary } from '@/lib/hooks/useReports'
import { formatCurrency } from '@/lib/utils/formatters'
import { REPORTS, INVENTORY } from '@/lib/constants/copy'
import { ROUTES } from '@/lib/constants/routes'

function toISO(d: Date) { return d.toISOString().slice(0, 10) }

const TODAY = toISO(new Date())

export default function DashboardPage() {
  const metrics     = useDashboardMetrics()
  const topProducts = useTopProducts(TODAY, TODAY, 5)
  const summary     = useSalesSummary(TODAY, TODAY)

  const recentSales = summary.data ?? []

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Dashboard" description="Welcome to MarketPro" />

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={REPORTS.SALES_TODAY}
          value={metrics.data ? formatCurrency(metrics.data.salesToday / 100) : null}
          loading={metrics.isLoading}
          accent
        />
        <MetricCard
          label={REPORTS.ITEMS_SOLD}
          value={metrics.data ? metrics.data.itemsSoldToday.toLocaleString('en-NG') : null}
          loading={metrics.isLoading}
        />
        <MetricCard
          label={REPORTS.LOW_STOCK}
          value={metrics.data ? String(metrics.data.lowStockCount) : null}
          loading={metrics.isLoading}
          href={ROUTES.INVENTORY}
          danger={!!metrics.data && metrics.data.lowStockCount > 0}
        />
        <MetricCard
          label={REPORTS.ACTIVE_STAFF}
          value={metrics.data ? String(metrics.data.activeStaffCount) : null}
          loading={metrics.isLoading}
        />
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Today's sales by time */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-zinc-900">Today's sales</p>
            <Link href={ROUTES.REPORTS} className="text-xs text-brand hover:underline flex items-center gap-0.5">
              View report <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {summary.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
            </div>
          ) : recentSales.length === 0 ? (
            <p className="text-sm text-zinc-400 py-4 text-center">No sales today yet.</p>
          ) : (
            <div className="space-y-2">
              {recentSales.map((d) => (
                <div key={d.date} className="flex justify-between text-sm">
                  <span className="text-zinc-500">{d.count} sale{d.count !== 1 ? 's' : ''}</span>
                  <span className="font-medium text-zinc-900 tabular-nums">
                    {formatCurrency(d.revenue / 100)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top products today */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-zinc-900">Top products today</p>
            <Link href={ROUTES.REPORTS_PRODUCTS} className="text-xs text-brand hover:underline flex items-center gap-0.5">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {topProducts.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
            </div>
          ) : (topProducts.data ?? []).length === 0 ? (
            <p className="text-sm text-zinc-400 py-4 text-center">No sales today yet.</p>
          ) : (
            <div className="space-y-2">
              {(topProducts.data ?? []).map((p, i) => (
                <div key={p.productId ?? p.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-zinc-400 font-mono w-4 shrink-0">{i + 1}</span>
                    <span className="truncate text-zinc-700">{p.name}</span>
                  </div>
                  <span className="font-medium text-zinc-900 tabular-nums shrink-0 ml-2">
                    {formatCurrency(p.totalRevenue / 100)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Low stock warning */}
      {!!metrics.data && metrics.data.lowStockCount > 0 && (
        <Link
          href={ROUTES.INVENTORY}
          className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm hover:bg-warning/20 transition-colors"
        >
          <span className="font-medium text-warning">
            {metrics.data.lowStockCount} product{metrics.data.lowStockCount !== 1 ? 's are' : ' is'} running low on stock
          </span>
          <span className="text-xs text-warning flex items-center gap-1">
            {INVENTORY.LOW_STOCK_TITLE} <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      )}
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string | null
  loading: boolean
  href?: string
  accent?: boolean
  danger?: boolean
}

function MetricCard({ label, value, loading, href, accent, danger }: MetricCardProps) {
  const content = (
    <div className={`rounded-lg border bg-white p-4 shadow-sm transition-colors ${
      href ? 'hover:border-zinc-300 cursor-pointer' : ''
    } ${danger ? 'border-warning/30' : 'border-zinc-200'}`}>
      <p className="mb-2 text-xs font-medium text-zinc-500">{label}</p>
      {loading ? (
        <Skeleton className="h-8 w-28" />
      ) : (
        <p className={`text-2xl font-bold tabular-nums ${
          accent ? 'text-brand' : danger ? 'text-warning' : 'text-zinc-900'
        }`}>
          {value ?? '—'}
        </p>
      )}
    </div>
  )

  return href ? <Link href={href}>{content}</Link> : content
}
