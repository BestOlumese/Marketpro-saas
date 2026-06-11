'use client'

import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ShoppingCart, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProductGrid } from '@/components/pos/ProductGrid'
import { CartPanel } from '@/components/pos/CartPanel'
import { PaymentModal } from '@/components/pos/PaymentModal'
import { ReceiptModal } from '@/components/pos/ReceiptModal'
import { OfflineSaleBanner } from '@/components/pos/OfflineSaleBanner'
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus'
import { useSessionStore } from '@/store/sessionStore'
import { useCartStore } from '@/store/cartStore'
import { useCurrentShop } from '@/lib/hooks/useCurrentShop'
import { localDb } from '@/lib/dexie/db'
import { syncProductsToLocal } from '@/lib/dexie/sync'
import { POS, SHIFTS } from '@/lib/constants/copy'
import { formatCurrency } from '@/lib/utils/formatters'
import type { ApiResponse, Shift } from '@/types'
import type { SaleWithItems } from '@/lib/db/queries/sales'
import type { OfflineSaleReceipt } from '@/components/pos/ReceiptModal'

function nairaToKobo(naira: string): number {
  return Math.round(parseFloat(naira || '0') * 100)
}

async function fetchActiveShift(): Promise<Shift | null> {
  const res = await fetch('/api/shifts/active')
  if (!res.ok) return null
  const json: ApiResponse<Shift | null> = await res.json()
  return json.success ? json.data : null
}

export default function PosPage() {
  const isOnline = useOnlineStatus()
  const { shop } = useCurrentShop()
  const cartItems = useCartStore((s) => s.items)
  const qc = useQueryClient()

  const openShift = useSessionStore((s) => s.openShift)
  const closeShift = useSessionStore((s) => s.closeShift)

  const [paymentOpen, setPaymentOpen] = useState(false)
  const [receiptSale, setReceiptSale] = useState<SaleWithItems | OfflineSaleReceipt | null>(null)
  const [mobileView, setMobileView] = useState<'grid' | 'cart'>('grid')

  const [openShiftDialog, setOpenShiftDialog] = useState(false)
  const [closeShiftDialog, setCloseShiftDialog] = useState(false)
  const [openingCashInput, setOpeningCashInput] = useState('')
  const [closingCashInput, setClosingCashInput] = useState('')
  const [noteInput, setNoteInput] = useState('')

  const { data: activeShift, isLoading: shiftLoading } = useQuery({
    queryKey: ['activeShift'],
    queryFn: fetchActiveShift,
    refetchInterval: 60_000,
  })

  const isShiftOpen = Boolean(activeShift)

  // Keep sessionStore in sync with the real DB shift
  useEffect(() => {
    if (shiftLoading) return
    if (activeShift) {
      openShift(activeShift.id)
    } else {
      closeShift()
    }
  }, [activeShift, shiftLoading, openShift, closeShift])

  const openMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openingCash: nairaToKobo(openingCashInput) }),
      })
      const json: ApiResponse<Shift> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    onSuccess: (shift) => {
      toast.success(POS.SHIFT_OPEN)
      openShift(shift.id)
      qc.invalidateQueries({ queryKey: ['activeShift'] })
      setOpenShiftDialog(false)
      setOpeningCashInput('')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to open shift')
    },
  })

  const closeMutation = useMutation({
    mutationFn: async () => {
      if (!activeShift) throw new Error('No active shift')
      const res = await fetch(`/api/shifts/${activeShift.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          closingCash: nairaToKobo(closingCashInput),
          note: noteInput || undefined,
        }),
      })
      const json: ApiResponse<Shift> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => {
      toast.success(POS.SHIFT_CLOSED)
      closeShift()
      qc.invalidateQueries({ queryKey: ['activeShift'] })
      qc.invalidateQueries({ queryKey: ['shiftHistory'] })
      setCloseShiftDialog(false)
      setClosingCashInput('')
      setNoteInput('')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to close shift')
    },
  })

  const products = useLiveQuery(
    () => localDb.products.toArray(),
    [],
    []
  )

  useEffect(() => {
    if (isOnline) void syncProductsToLocal()
  }, [isOnline])

  function handleSaleSuccess(sale: SaleWithItems | OfflineSaleReceipt) {
    setReceiptSale(sale)
  }

  const shiftPending = openMutation.isPending || closeMutation.isPending

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 border-b border-zinc-200 bg-white shrink-0">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-zinc-900">{POS.TITLE}</h1>
          <p className="truncate text-xs text-zinc-500">
            {isShiftOpen ? (
              <span className="text-brand font-medium">
                {POS.SHIFT_OPEN}
                {activeShift && (
                  <> · {SHIFTS.OPENING_CASH}: {formatCurrency(activeShift.openingCash / 100)}</>
                )}
              </span>
            ) : (
              <span className="text-zinc-400">{POS.SHIFT_CLOSED}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isOnline && <OfflineSaleBanner />}

          <Button
            variant="outline"
            size="sm"
            disabled={shiftPending || shiftLoading}
            onClick={() => isShiftOpen ? setCloseShiftDialog(true) : setOpenShiftDialog(true)}
            className={isShiftOpen ? 'border-danger text-danger hover:bg-danger/10' : ''}
          >
            <Power className="h-4 w-4 mr-1.5" />
            {shiftPending
              ? isShiftOpen ? POS.CLOSING_SHIFT : POS.OPENING_SHIFT
              : isShiftOpen ? POS.CLOSE_SHIFT : POS.OPEN_SHIFT}
          </Button>
        </div>
      </div>

      {/* Open shift dialog */}
      <Dialog open={openShiftDialog} onOpenChange={setOpenShiftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{SHIFTS.OPEN_SHIFT}</DialogTitle>
            <DialogDescription>{SHIFTS.NO_OPEN_SHIFT_HINT}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="pos-opening-cash">{SHIFTS.OPENING_CASH_LABEL}</Label>
              <Input
                id="pos-opening-cash"
                type="number"
                min="0"
                step="0.01"
                placeholder={SHIFTS.OPENING_CASH_PLACEHOLDER}
                value={openingCashInput}
                onChange={(e) => setOpeningCashInput(e.target.value)}
                autoFocus
              />
            </div>
            <Button
              className="w-full bg-brand hover:bg-brand/90 text-white"
              onClick={() => openMutation.mutate()}
              disabled={openMutation.isPending}
            >
              {openMutation.isPending ? SHIFTS.OPENING : SHIFTS.OPEN_SHIFT}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close shift dialog */}
      <Dialog open={closeShiftDialog} onOpenChange={setCloseShiftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{SHIFTS.CONFIRM_CLOSE}</DialogTitle>
            <DialogDescription>{SHIFTS.CONFIRM_CLOSE_DESCRIPTION}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {activeShift && (
              <div className="grid grid-cols-2 gap-3 rounded-md bg-zinc-50 p-3 text-sm">
                <span className="text-zinc-500">{SHIFTS.OPENING_CASH}</span>
                <span className="text-right font-medium">{formatCurrency(activeShift.openingCash / 100)}</span>
                <span className="text-zinc-500">{SHIFTS.OPENED_AT}</span>
                <span className="text-right font-medium">
                  {new Date(activeShift.openedAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="pos-closing-cash">{SHIFTS.CLOSING_CASH_LABEL}</Label>
              <Input
                id="pos-closing-cash"
                type="number"
                min="0"
                step="0.01"
                placeholder={SHIFTS.CLOSING_CASH_PLACEHOLDER}
                value={closingCashInput}
                onChange={(e) => setClosingCashInput(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pos-shift-note">{SHIFTS.NOTE_LABEL}</Label>
              <Textarea
                id="pos-shift-note"
                placeholder={SHIFTS.NOTE_PLACEHOLDER}
                rows={2}
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />
            </div>
            <Button
              className="w-full bg-brand hover:bg-brand/90 text-white"
              onClick={() => closeMutation.mutate()}
              disabled={!closingCashInput || closeMutation.isPending}
            >
              {closeMutation.isPending ? SHIFTS.CLOSING : SHIFTS.CLOSE_SHIFT}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile toggle */}
      <div className="md:hidden flex border-b border-zinc-200 bg-white shrink-0">
        <button
          type="button"
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            mobileView === 'grid'
              ? 'text-brand border-b-2 border-brand'
              : 'text-zinc-500'
          }`}
          onClick={() => setMobileView('grid')}
        >
          Products
        </button>
        <button
          type="button"
          className={`flex-1 py-2 text-sm font-medium transition-colors relative ${
            mobileView === 'cart'
              ? 'text-brand border-b-2 border-brand'
              : 'text-zinc-500'
          }`}
          onClick={() => setMobileView('cart')}
        >
          <ShoppingCart className="inline h-4 w-4 mr-1" />
          Cart
          {cartItems.length > 0 && (
            <span className="absolute top-1.5 right-6 h-4 w-4 rounded-full bg-brand text-[10px] font-bold text-white flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex-1 overflow-y-auto p-4 bg-zinc-50 ${
            mobileView === 'cart' ? 'hidden md:flex md:flex-col' : 'flex flex-col'
          }`}
        >
          <ProductGrid products={products ?? []} />
        </div>

        <div
          className={`md:w-[360px] xl:w-[400px] border-l border-zinc-200 bg-white flex flex-col overflow-hidden ${
            mobileView === 'grid' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="px-4 py-3 border-b border-zinc-100 shrink-0">
            <h2 className="text-sm font-semibold text-zinc-700">{POS.CART_TITLE}</h2>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <CartPanel
              onPay={() => setPaymentOpen(true)}
              isShiftOpen={isShiftOpen}
            />
          </div>
        </div>
      </div>

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        isOnline={isOnline}
        shopName={shop?.name ?? ''}
        onSuccess={handleSaleSuccess}
      />

      <ReceiptModal
        open={receiptSale !== null}
        onClose={() => setReceiptSale(null)}
        sale={receiptSale}
        shopName={shop?.name ?? ''}
      />
    </div>
  )
}
