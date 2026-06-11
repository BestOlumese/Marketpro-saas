'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { REPORTS } from '@/lib/constants/copy'

interface DateRangePickerProps {
  from: string
  to: string
  onChange: (from: string, to: string) => void
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  const today = toISO(new Date())

  function setPreset(preset: 'today' | 'week' | 'month' | 'last-month') {
    const now = new Date()
    if (preset === 'today') {
      onChange(today, today)
    } else if (preset === 'week') {
      const start = new Date(now)
      start.setDate(now.getDate() - now.getDay())
      onChange(toISO(start), today)
    } else if (preset === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      onChange(toISO(start), today)
    } else {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end   = new Date(now.getFullYear(), now.getMonth(), 0)
      onChange(toISO(start), toISO(end))
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-wrap gap-1.5">
        {([
          ['today',      REPORTS.PRESET_TODAY],
          ['week',       REPORTS.PRESET_WEEK],
          ['month',      REPORTS.PRESET_MONTH],
          ['last-month', REPORTS.PRESET_LAST_MONTH],
        ] as const).map(([preset, label]) => (
          <Button
            key={preset}
            variant="outline"
            size="sm"
            onClick={() => setPreset(preset)}
            className="text-xs"
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label htmlFor="rp-from" className="text-xs">{REPORTS.DATE_FROM}</Label>
          <Input
            id="rp-from"
            type="date"
            value={from}
            max={to || today}
            onChange={(e) => onChange(e.target.value, to)}
            className="h-8 text-sm w-36"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="rp-to" className="text-xs">{REPORTS.DATE_TO}</Label>
          <Input
            id="rp-to"
            type="date"
            value={to}
            min={from}
            max={today}
            onChange={(e) => onChange(from, e.target.value)}
            className="h-8 text-sm w-36"
          />
        </div>
      </div>
    </div>
  )
}
