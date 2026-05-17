import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/PageHeader'

const metricCards = [
  { label: 'Sales today' },
  { label: 'Items sold' },
  { label: 'Low stock alerts' },
  { label: 'Active staff' },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Dashboard" description="Welcome to MarketPro" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => (
          <div key={card.label} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-medium text-zinc-500">{card.label}</p>
            <Skeleton className="h-8 w-28" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="mb-4 text-sm font-medium text-zinc-900">Recent sales</p>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="mb-4 text-sm font-medium text-zinc-900">Top products</p>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
