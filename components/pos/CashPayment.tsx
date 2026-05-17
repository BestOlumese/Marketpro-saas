'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils/formatters'
import { POS } from '@/lib/constants/copy'

interface CashPaymentProps {
  total: number   // kobo
  onChange: (tendered: number) => void
}

export function CashPayment({ total, onChange }: CashPaymentProps) {
  const [tendered, setTendered] = useState('')

  const tenderedKobo = Math.round(parseFloat(tendered || '0') * 100)
  const change = tenderedKobo - total

  function handleChange(value: string) {
    setTendered(value)
    const parsed = parseFloat(value || '0') * 100
    onChange(isNaN(parsed) ? 0 : Math.round(parsed))
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-zinc-50 p-3 space-y-1">
        <p className="text-xs text-zinc-500">{POS.TOTAL}</p>
        <p className="text-2xl font-bold text-zinc-900 tabular-nums">
          {formatCurrency(total / 100)}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cash-tendered">{POS.CASH_TENDERED} (₦)</Label>
        <Input
          id="cash-tendered"
          type="number"
          min={0}
          step="0.01"
          placeholder="0.00"
          value={tendered}
          onChange={(e) => handleChange(e.target.value)}
          className="text-lg tabular-nums"
          autoFocus
        />
      </div>

      {tenderedKobo > 0 && (
        <div className={`rounded-md p-3 ${change >= 0 ? 'bg-brand-light' : 'bg-danger/10'}`}>
          <p className="text-xs text-zinc-500">{POS.CHANGE}</p>
          <p
            className={`text-xl font-bold tabular-nums ${
              change >= 0 ? 'text-brand' : 'text-danger'
            }`}
          >
            {change >= 0 ? formatCurrency(change / 100) : `−${formatCurrency(Math.abs(change) / 100)}`}
          </p>
          {change < 0 && (
            <p className="text-xs text-danger mt-0.5">Amount tendered is less than total</p>
          )}
        </div>
      )}
    </div>
  )
}
