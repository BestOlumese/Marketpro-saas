'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CashPayment } from '@/components/pos/CashPayment'
import { TransferPayment } from '@/components/pos/TransferPayment'
import { OfflineSaleBanner } from '@/components/pos/OfflineSaleBanner'
import { useCartStore } from '@/store/cartStore'
import { useCreateSale } from '@/lib/hooks/useSales'
import { POS } from '@/lib/constants/copy'
import type { SaleWithItems } from '@/lib/db/queries/sales'
import type { OfflineSaleReceipt } from '@/components/pos/ReceiptModal'

type PaymentMethod = 'cash' | 'transfer' | 'card'

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  isOnline: boolean
  shopName: string
  onSuccess: (sale: SaleWithItems | OfflineSaleReceipt) => void
}

const METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'cash', label: POS.CASH },
  { id: 'transfer', label: POS.TRANSFER },
  { id: 'card', label: POS.CARD },
]

export function PaymentModal({ open, onClose, isOnline, shopName, onSuccess }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [tenderedKobo, setTenderedKobo] = useState(0)

  const items    = useCartStore((s) => s.items)
  const discount = useCartStore((s) => s.discount)
  const getTotal = useCartStore((s) => s.getTotal)
  const clearCart = useCartStore((s) => s.clearCart)

  const total = getTotal()
  const { mutate, isPending } = useCreateSale({ isOnline })

  const isMethodDisabled = (m: PaymentMethod) => !isOnline && m !== 'cash'

  const canConfirm =
    method === 'cash'
      ? tenderedKobo >= total
      : method === 'transfer' || method === 'card'

  function handleConfirm() {
    // Snapshot cart now — clearCart() will wipe it before onSuccess is called
    const receiptItems = items.map((i) => ({
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    }))
    const receiptTotal    = total
    const receiptDiscount = discount

    mutate(
      {
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        paymentMethod: method,
        discount,
      },
      {
        onSuccess: (sale) => {
          clearCart()
          onClose()
          toast.success(POS.SALE_SUCCESS)

          if (sale) {
            onSuccess(sale)
          } else {
            // Offline cash sale — build receipt from snapshot
            const offlineReceipt: OfflineSaleReceipt = {
              id: crypto.randomUUID(),
              total: receiptTotal,
              discount: receiptDiscount,
              paymentMethod: 'cash',
              createdAt: new Date().toISOString(),
              items: receiptItems,
            }
            onSuccess(offlineReceipt)
          }
        },
        onError: (err) => {
          toast.error(err.message || POS.SALE_ERROR)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{POS.PAYMENT_METHOD}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isOnline && <OfflineSaleBanner />}

          <div className="flex gap-2">
            {METHODS.map((m) => {
              const disabled = isMethodDisabled(m.id)
              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={disabled}
                  aria-pressed={method === m.id}
                  onClick={() => setMethod(m.id)}
                  title={disabled ? POS.OFFLINE_BLOCKED : undefined}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-40 ${
                    method === m.id
                      ? 'border-brand bg-brand-light text-brand'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
                  }`}
                >
                  {m.label}
                </button>
              )
            })}
          </div>

          {method === 'cash' && (
            <CashPayment total={total} onChange={setTenderedKobo} />
          )}

          {method === 'transfer' && (
            <TransferPayment total={total} shopName={shopName} />
          )}

          {method === 'card' && (
            <div className="rounded-md bg-zinc-50 p-4 text-center">
              <p className="text-sm text-zinc-500">
                Process card payment on your terminal, then confirm below.
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900">
                {total > 0 && `₦${(total / 100).toLocaleString('en-NG')}`}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-brand hover:bg-brand-dark text-white"
              disabled={!canConfirm || isPending}
              onClick={handleConfirm}
            >
              {isPending ? POS.PROCESSING : POS.CONFIRM_PAYMENT}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
