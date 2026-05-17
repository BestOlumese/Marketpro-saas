'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import { useBankAccounts } from '@/lib/hooks/useBankAccounts'
import { POS } from '@/lib/constants/copy'
import type { BankAccount } from '@/lib/db/schema'

interface TransferPaymentProps {
  total: number   // kobo
  shopName: string
}

export function TransferPayment({ total, shopName }: TransferPaymentProps) {
  const { data: accounts = [], isLoading } = useBankAccounts()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const selected: BankAccount | undefined =
    accounts.find((a) => a.id === selectedId) ?? accounts.find((a) => a.isDefault) ?? accounts[0]

  useEffect(() => {
    if (accounts.length > 0 && !selectedId) {
      const def = accounts.find((a) => a.isDefault) ?? accounts[0]
      if (def) setSelectedId(def.id)
    }
  }, [accounts, selectedId])

  useEffect(() => {
    if (!canvasRef.current || !selected) return
    const qrData = [
      `Bank: ${selected.bankName}`,
      `Account: ${selected.accountNumber}`,
      `Name: ${selected.accountName}`,
      `Amount: ₦${(total / 100).toFixed(2)}`,
      `Shop: ${shopName}`,
    ].join('\n')

    QRCode.toCanvas(canvasRef.current, qrData, {
      width: 160,
      margin: 2,
      color: { dark: '#1D9E75', light: '#FFFFFF' },
    }).catch(() => undefined)
  }, [selected, total, shopName])

  if (isLoading) {
    return <div className="h-40 rounded-lg bg-zinc-100 animate-pulse" />
  }

  if (accounts.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-md bg-warning/10 p-4 text-sm text-warning">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <p>
          No bank accounts configured. Go to{' '}
          <span className="font-medium">Settings → Transfer Accounts</span> to add one.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-zinc-50 p-3 space-y-1">
        <p className="text-xs text-zinc-500">{POS.TRANSFER_AMOUNT}</p>
        <p className="text-2xl font-bold text-zinc-900 tabular-nums">
          {formatCurrency(total / 100)}
        </p>
      </div>

      {accounts.length > 1 && (
        <div className="space-y-1.5">
          <p className="text-xs text-zinc-500">Select account</p>
          <div className="flex flex-wrap gap-2">
            {accounts.map((a) => (
              <button
                key={a.id}
                type="button"
                aria-pressed={selected?.id === a.id}
                onClick={() => setSelectedId(a.id)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  selected?.id === a.id
                    ? 'border-brand bg-brand-light text-brand'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
                }`}
              >
                {a.bankName}
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <>
          <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-2">
            <Row label={POS.TRANSFER_BANK}    value={selected.bankName} />
            <Row label={POS.TRANSFER_ACCOUNT} value={selected.accountNumber} mono />
            <Row label={POS.TRANSFER_NAME}    value={selected.accountName} />
          </div>

          <div className="flex flex-col items-center gap-2 pt-2">
            <p className="text-xs text-zinc-500">{POS.TRANSFER_SCAN}</p>
            <canvas ref={canvasRef} className="rounded-md" />
          </div>
        </>
      )}

      <p className="text-center text-sm text-zinc-500">
        After receiving payment, click{' '}
        <span className="font-medium text-brand">{POS.TRANSFER_DONE}</span> below.
      </p>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-zinc-500 shrink-0">{label}</span>
      <span className={`text-sm font-medium text-zinc-900 ${mono ? 'font-mono tracking-wider' : ''}`}>
        {value}
      </span>
    </div>
  )
}
