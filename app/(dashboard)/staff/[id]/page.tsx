import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireRole, getShopId } from '@/lib/clerk/helpers'
import { getStaffWithSales } from '@/lib/db/queries/staff'
import { RoleBadge } from '@/components/staff/RoleBadge'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { STAFF } from '@/lib/constants/copy'
import { ROUTES } from '@/lib/constants/routes'
import { formatCurrency } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

interface StaffDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function StaffDetailPage({ params }: StaffDetailPageProps) {
  try {
    await requireRole(['owner', 'manager'])
  } catch {
    redirect(ROUTES.DASHBOARD)
  }

  const shopId = await getShopId()
  const { id } = await params
  const member = await getStaffWithSales(id, shopId)

  if (!member) notFound()

  const completedSales = member.sales.filter((s) => s.status === 'completed')
  const totalRevenue = completedSales.reduce((sum, s) => sum + s.total, 0) / 100
  const totalItems = completedSales.reduce(
    (sum, s) => sum + s.items.reduce((si, i) => si + i.quantity, 0),
    0,
  )

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 lg:p-6">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.STAFF} className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-sm text-zinc-500">{STAFF.BACK_TO_STAFF}</span>
      </div>

      {/* Profile header */}
      <div className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xl font-semibold">
          {member.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-zinc-900">{member.name}</h1>
            <RoleBadge role={member.role as UserRole} />
          </div>
          <p className="text-sm text-zinc-500">{member.email}</p>
          <p className="mt-0.5 text-xs text-zinc-400">
            Joined {new Date(member.createdAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center">
          <p className="text-2xl font-semibold text-zinc-900">{completedSales.length}</p>
          <p className="text-xs text-zinc-500">{STAFF.SALES_COUNT}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center">
          <p className="text-lg font-semibold text-zinc-900">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-zinc-500">{STAFF.TOTAL_REVENUE}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center">
          <p className="text-2xl font-semibold text-zinc-900">{member.shifts.length}</p>
          <p className="text-xs text-zinc-500">{STAFF.SHIFT_COUNT}</p>
        </div>
      </div>

      {/* Recent sales */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-700">{STAFF.SALES_HISTORY}</h2>
        {completedSales.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-8 text-center">
            <p className="text-sm text-zinc-500">{STAFF.NO_SALES}</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
            {completedSales.slice(0, 20).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{formatCurrency(sale.total / 100)}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(sale.createdAt).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs capitalize">{sale.paymentMethod}</Badge>
                  <span className="text-xs text-zinc-400">
                    {sale.items.reduce((s, i) => s + i.quantity, 0)} items
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Shift history */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-700">{STAFF.SHIFT_HISTORY}</h2>
        {member.shifts.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white px-4 py-8 text-center">
            <p className="text-sm text-zinc-500">{STAFF.NO_SHIFTS}</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
            {member.shifts.map((shift) => (
              <div key={shift.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={shift.status === 'open'
                        ? 'bg-green-50 text-green-700 border-green-200 text-xs'
                        : 'bg-zinc-100 text-zinc-500 border-zinc-200 text-xs'}
                    >
                      {shift.status === 'open' ? 'Open' : 'Closed'}
                    </Badge>
                    <span className="text-xs text-zinc-500">
                      {new Date(shift.openedAt).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Opening: {formatCurrency(shift.openingCash / 100)}
                    {shift.closingCash !== null && (
                      <> · Closing: {formatCurrency(shift.closingCash / 100)}</>
                    )}
                  </p>
                </div>
                {shift.discrepancy !== null && shift.discrepancy !== 0 && (
                  <Badge
                    variant="outline"
                    className={shift.discrepancy > 0
                      ? 'bg-blue-50 text-blue-700 border-blue-200 text-xs'
                      : 'bg-red-50 text-red-700 border-red-200 text-xs'}
                  >
                    {shift.discrepancy > 0 ? '+' : ''}{formatCurrency(shift.discrepancy / 100)}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
