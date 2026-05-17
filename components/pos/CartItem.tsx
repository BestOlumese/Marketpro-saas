'use client'

import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/formatters'
import type { CartItem as CartItemType } from '@/store/cartStore'

interface CartItemProps {
  item: CartItemType
  onRemove: (productId: string) => void
  onUpdateQuantity: (productId: string, quantity: number) => void
}

export function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-zinc-900">{item.name}</p>
        <p className="text-xs text-zinc-500">{formatCurrency(item.price / 100)} each</p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          aria-label="Decrease quantity"
          onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>

        <span className="w-7 text-center text-sm font-medium tabular-nums">
          {item.quantity}
        </span>

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          aria-label="Increase quantity"
          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-danger hover:text-danger hover:bg-danger/10"
          aria-label="Remove item"
          onClick={() => onRemove(item.productId)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="w-20 text-right shrink-0">
        <p className="text-sm font-medium text-zinc-900 tabular-nums">
          {formatCurrency((item.price * item.quantity) / 100)}
        </p>
      </div>
    </div>
  )
}
