import { Badge } from '@/components/ui/badge'
import { INVENTORY } from '@/lib/constants/copy'

interface StockBadgeProps {
  stock: number
  lowStockAt: number
}

export function StockBadge({ stock, lowStockAt }: StockBadgeProps) {
  if (stock === 0) {
    return (
      <Badge className="bg-danger/10 text-danger border-0 font-medium">
        {INVENTORY.STOCK_OUT}
      </Badge>
    )
  }
  if (stock <= lowStockAt) {
    return (
      <Badge className="bg-warning/10 text-warning border-0 font-medium">
        {INVENTORY.STOCK_LOW}
      </Badge>
    )
  }
  return (
    <Badge className="bg-brand-light text-brand border-0 font-medium">
      {INVENTORY.STOCK_IN}
    </Badge>
  )
}
