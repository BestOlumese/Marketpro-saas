'use client'

import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CartItem } from '@/components/pos/CartItem'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/lib/utils/formatters'
import { POS } from '@/lib/constants/copy'

interface CartPanelProps {
  onPay: () => void
  isShiftOpen: boolean
}

export function CartPanel({ onPay, isShiftOpen }: CartPanelProps) {
  const items = useCartStore((s) => s.items)
  const discount = useCartStore((s) => s.discount)
  const setDiscount = useCartStore((s) => s.setDiscount)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const getTotal = useCartStore((s) => s.getTotal)

  const subtotal = getSubtotal()
  const total = getTotal()
  const discountAmount = subtotal - total

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
        <div className="rounded-full bg-zinc-100 p-4">
          <ShoppingCart className="h-8 w-8 text-zinc-400" />
        </div>
        <p className="font-medium text-zinc-700">{POS.CART_EMPTY}</p>
        <p className="text-sm text-zinc-500">{POS.CART_EMPTY_HINT}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 divide-y divide-zinc-100">
        {items.map((item) => (
          <CartItem
            key={item.productId}
            item={item}
            onRemove={removeItem}
            onUpdateQuantity={updateQuantity}
          />
        ))}
      </div>

      <div className="border-t border-zinc-200 px-4 pt-4 pb-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">{POS.SUBTOTAL}</span>
          <span className="tabular-nums text-zinc-900">{formatCurrency(subtotal / 100)}</span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="cart-discount" className="shrink-0 text-sm text-zinc-500">
            {POS.DISCOUNT_LABEL}
          </label>
          <input
            id="cart-discount"
            type="number"
            min={0}
            max={100}
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="w-20 rounded-md border border-zinc-200 px-2 py-1 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">{POS.DISCOUNT} ({discount}%)</span>
            <span className="tabular-nums text-danger">−{formatCurrency(discountAmount / 100)}</span>
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <span className="font-semibold text-zinc-900">{POS.TOTAL}</span>
          <span className="text-xl font-bold tabular-nums text-zinc-900">
            {formatCurrency(total / 100)}
          </span>
        </div>

        <Button
          className="w-full bg-brand hover:bg-brand-dark text-white"
          disabled={!isShiftOpen || items.length === 0}
          onClick={onPay}
        >
          {!isShiftOpen ? POS.OPEN_SHIFT_REQUIRED : POS.PAY}
        </Button>
      </div>
    </div>
  )
}
