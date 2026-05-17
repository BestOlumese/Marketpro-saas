'use client'

import { useRef } from 'react'
import { Printer, CloudOff } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { POS, APP_NAME } from '@/lib/constants/copy'
import type { SaleWithItems } from '@/lib/db/queries/sales'

export interface OfflineSaleReceipt {
  id: string
  total: number
  discount: number
  paymentMethod: 'cash'
  createdAt: string
  items: Array<{ name: string; price: number; quantity: number }>
}

interface ReceiptModalProps {
  open: boolean
  onClose: () => void
  sale: SaleWithItems | OfflineSaleReceipt | null
  shopName: string
}

function isOffline(s: SaleWithItems | OfflineSaleReceipt): s is OfflineSaleReceipt {
  return !('status' in s)
}

export function ReceiptModal({ open, onClose, sale, shopName }: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null)

  function handlePrint() {
    if (!printRef.current) return
    const content = printRef.current.innerHTML
    const w = window.open('', '_blank', 'width=400,height=600')
    if (!w) return
    w.document.write(`
      <html><head><title>Receipt</title>
      <style>
        body { font-family: monospace; font-size: 12px; margin: 16px; }
        .divider { border-top: 1px dashed #000; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; }
        .bold { font-weight: bold; }
        .center { text-align: center; }
        .large { font-size: 16px; }
      </style></head>
      <body>${content}</body></html>
    `)
    w.document.close()
    w.focus()
    w.print()
    w.close()
  }

  if (!sale) return null

  const offline = isOffline(sale)
  const items = offline
    ? sale.items
    : sale.items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity }))

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const total = sale.total
  const discount = sale.discount
  const paymentMethod = sale.paymentMethod
  const createdAt = offline ? new Date(sale.createdAt) : sale.createdAt

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{POS.RECEIPT_TITLE}</DialogTitle>
        </DialogHeader>

        {offline && (
          <div className="flex items-center gap-2 rounded-md bg-warning/10 px-3 py-2 text-xs text-warning">
            <CloudOff className="h-3.5 w-3.5 shrink-0" />
            <span>Saved offline — will sync when back online.</span>
          </div>
        )}

        <div ref={printRef} className="space-y-3 font-mono text-sm">
          <div className="text-center space-y-0.5">
            <p className="font-bold text-base">{shopName || APP_NAME}</p>
            <p className="text-zinc-500 text-xs">{formatDate(createdAt)}</p>
          </div>

          <Separator className="border-dashed" />

          <div className="space-y-1">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between gap-2">
                <span className="flex-1 truncate text-zinc-700">
                  {item.name} × {item.quantity}
                </span>
                <span className="tabular-nums shrink-0">
                  {formatCurrency((item.price * item.quantity) / 100)}
                </span>
              </div>
            ))}
          </div>

          <Separator className="border-dashed" />

          <div className="space-y-1">
            <div className="flex justify-between text-zinc-500">
              <span>{POS.SUBTOTAL}</span>
              <span className="tabular-nums">{formatCurrency(subtotal / 100)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-zinc-500">
                <span>{POS.DISCOUNT} ({discount}%)</span>
                <span className="tabular-nums text-danger">
                  −{formatCurrency((subtotal - total) / 100)}
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base">
              <span>{POS.TOTAL}</span>
              <span className="tabular-nums">{formatCurrency(total / 100)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Payment</span>
              <span className="capitalize">{paymentMethod}</span>
            </div>
          </div>

          <Separator className="border-dashed" />

          <p className="text-center text-xs text-zinc-400">Thank you for shopping with us!</p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            {POS.NEW_SALE}
          </Button>
          <Button
            className="flex-1 bg-brand hover:bg-brand-dark text-white"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-2" />
            {POS.PRINT}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
