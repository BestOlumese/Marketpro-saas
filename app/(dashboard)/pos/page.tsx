'use client'

import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { toast } from 'sonner'
import { ShoppingCart, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductGrid } from '@/components/pos/ProductGrid'
import { CartPanel } from '@/components/pos/CartPanel'
import { PaymentModal } from '@/components/pos/PaymentModal'
import { ReceiptModal } from '@/components/pos/ReceiptModal'
import { OfflineSaleBanner } from '@/components/pos/OfflineSaleBanner'
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus'
import { useSessionStore } from '@/store/sessionStore'
import { useCartStore } from '@/store/cartStore'
import { useShift } from '@/lib/hooks/useSales'
import { useCurrentShop } from '@/lib/hooks/useCurrentShop'
import { localDb } from '@/lib/dexie/db'
import { syncProductsToLocal } from '@/lib/dexie/sync'
import { POS } from '@/lib/constants/copy'
import type { SaleWithItems } from '@/lib/db/queries/sales'
import type { OfflineSaleReceipt } from '@/components/pos/ReceiptModal'

export default function PosPage() {
  const isOnline = useOnlineStatus()
  const { shop } = useCurrentShop()
  const cartItems = useCartStore((s) => s.items)

  const isShiftOpen = useSessionStore((s) => s.isShiftOpen)
  const openShift = useSessionStore((s) => s.openShift)
  const closeShift = useSessionStore((s) => s.closeShift)

  const [paymentOpen, setPaymentOpen] = useState(false)
  const [receiptSale, setReceiptSale] = useState<SaleWithItems | OfflineSaleReceipt | null>(null)
  const [mobileView, setMobileView] = useState<'grid' | 'cart'>('grid')

  const { mutate: mutateShift, isPending: shiftPending } = useShift()

  const products = useLiveQuery(
    () => localDb.products.toArray(),
    [],
    []
  )

  useEffect(() => {
    if (isOnline) void syncProductsToLocal()
  }, [isOnline])

  function handleShiftToggle() {
    const action = isShiftOpen ? 'close' : 'open'
    mutateShift(action, {
      onSuccess: (data) => {
        if (data.action === 'open' && data.shiftId) {
          openShift(data.shiftId)
          toast.success(POS.SHIFT_OPEN)
        } else {
          closeShift()
          toast.success(POS.SHIFT_CLOSED)
        }
      },
      onError: () => toast.error('Failed to update shift'),
    })
  }

  function handleSaleSuccess(sale: SaleWithItems | OfflineSaleReceipt) {
    setReceiptSale(sale)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">{POS.TITLE}</h1>
          <p className="text-xs text-zinc-500">
            {isShiftOpen ? (
              <span className="text-brand font-medium">{POS.SHIFT_OPEN}</span>
            ) : (
              <span className="text-zinc-400">{POS.SHIFT_CLOSED}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isOnline && <OfflineSaleBanner />}

          <Button
            variant="outline"
            size="sm"
            disabled={shiftPending}
            onClick={handleShiftToggle}
            className={isShiftOpen ? 'border-danger text-danger hover:bg-danger/10' : ''}
          >
            <Power className="h-4 w-4 mr-1.5" />
            {shiftPending
              ? isShiftOpen ? POS.CLOSING_SHIFT : POS.OPENING_SHIFT
              : isShiftOpen ? POS.CLOSE_SHIFT : POS.OPEN_SHIFT}
          </Button>
        </div>
      </div>

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
        {/* Product grid — 65% */}
        <div
          className={`flex-1 overflow-y-auto p-4 bg-zinc-50 ${
            mobileView === 'cart' ? 'hidden md:flex md:flex-col' : 'flex flex-col'
          }`}
        >
          <ProductGrid products={products ?? []} />
        </div>

        {/* Cart panel — 35% */}
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
