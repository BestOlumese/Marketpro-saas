'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { DateRangePicker } from '@/components/reports/DateRangePicker'
import { StaffLeaderboard } from '@/components/reports/StaffLeaderboard'
import { ExportButton } from '@/components/reports/ExportButton'
import { PlanGate } from '@/components/shared/PlanGate'
import { useStaffPerformance } from '@/lib/hooks/useReports'
import { REPORTS } from '@/lib/constants/copy'

function toISO(d: Date) { return d.toISOString().slice(0, 10) }

function defaultRange() {
  const now   = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  return { from: toISO(start), to: toISO(now) }
}

function StaffReportContent() {
  const [{ from, to }, setRange] = useState(defaultRange)
  const { data = [], isLoading } = useStaffPerformance(from, to)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title={REPORTS.STAFF_TITLE} description="Sales performance by staff member." />
        <ExportButton from={from} to={to} />
      </div>

      <DateRangePicker from={from} to={to} onChange={(f, t) => setRange({ from: f, to: t })} />

      <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <StaffLeaderboard data={data} isLoading={isLoading} />
      </div>
    </div>
  )
}

export default function StaffReportPage() {
  return (
    <PlanGate requiredPlan="growth" description="Staff Performance report is available on the Growth plan and above.">
      <StaffReportContent />
    </PlanGate>
  )
}
