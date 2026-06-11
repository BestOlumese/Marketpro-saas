import { ShiftCard } from '@/components/staff/ShiftCard'
import { ShiftHistory } from '@/components/staff/ShiftHistory'
import { SHIFTS } from '@/lib/constants/copy'

export const metadata = { title: SHIFTS.TITLE }

export default function ShiftsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-xl font-semibold text-brand">{SHIFTS.TITLE}</h1>
        <p className="mt-0.5 text-sm text-zinc-500">{SHIFTS.DESCRIPTION}</p>
      </div>

      <ShiftCard />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-brand">{SHIFTS.HISTORY_TITLE}</h2>
        <ShiftHistory />
      </section>
    </div>
  )
}
