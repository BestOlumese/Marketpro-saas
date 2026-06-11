import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink, Clock } from 'lucide-react'
import { requireRole, getShopId } from '@/lib/clerk/helpers'
import { getStaffListWithSalesCounts } from '@/lib/db/queries/staff'
import { StaffTable } from '@/components/staff/StaffTable'
import { buttonVariants } from '@/components/ui/button'
import { STAFF } from '@/lib/constants/copy'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils'
import type { StaffWithStats } from '@/types'

export const metadata = { title: STAFF.TITLE }

export default async function StaffPage() {
  try {
    await requireRole(['owner', 'manager'])
  } catch {
    redirect(ROUTES.DASHBOARD)
  }

  const shopId = await getShopId()
  const members = await getStaffListWithSalesCounts(shopId)

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-zinc-900">{STAFF.TITLE}</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{STAFF.DESCRIPTION}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link href={ROUTES.STAFF_SHIFTS} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            {STAFF.SHIFT_COUNT}
          </Link>
          <Link href={ROUTES.SETTINGS_TEAM} className={cn(buttonVariants({ size: 'sm' }), 'bg-brand hover:bg-brand/90 text-white')}>
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            {STAFF.MANAGE_TEAM}
          </Link>
        </div>
      </div>

      <p className="text-xs text-zinc-400">{STAFF.MANAGE_TEAM_HINT}</p>

      <StaffTable staff={members as StaffWithStats[]} />
    </div>
  )
}
