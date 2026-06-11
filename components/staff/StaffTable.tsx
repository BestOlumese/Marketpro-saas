'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { RoleBadge } from '@/components/staff/RoleBadge'
import { STAFF } from '@/lib/constants/copy'
import { formatCurrency } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'
import type { StaffWithStats, UserRole } from '@/types'

interface StaffTableProps {
  staff: StaffWithStats[]
  loading?: boolean
}

export function StaffTable({ staff, loading }: StaffTableProps) {
  if (loading) {
    return (
      <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (staff.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white px-6 py-12 text-center">
        <p className="text-sm text-zinc-500">{STAFF.EMPTY}</p>
        <p className="mt-1 text-xs text-zinc-400">{STAFF.EMPTY_DESCRIPTION}</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
      {staff.map((member) => {
        const salesCount = member.sales.length
        const totalRevenue = member.sales.reduce((sum, s) => sum + s.total, 0) / 100

        return (
          <div key={member.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-sm font-semibold">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">{member.name}</p>
                <p className="truncate text-xs text-zinc-500">{member.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs text-zinc-500">{salesCount} {STAFF.SALES_COUNT.toLowerCase()}</span>
                <span className="text-xs font-medium text-zinc-700">{formatCurrency(totalRevenue)}</span>
              </div>
              <RoleBadge role={member.role as UserRole} />
              <Link
                href={`/staff/${member.id}`}
                aria-label={STAFF.VIEW_PROFILE}
                className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}
              >
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
