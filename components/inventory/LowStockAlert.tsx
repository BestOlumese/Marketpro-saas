'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { useLowStockProducts } from '@/lib/hooks/useProducts'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/formatters'
import { INVENTORY } from '@/lib/constants/copy'

export function LowStockAlert() {
  const { data: products, isLoading } = useLowStockProducts()

  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    )
  }

  if (!products || products.length === 0) return null

  return (
    <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
        <p className="text-sm font-semibold text-warning">
          {INVENTORY.LOW_STOCK_TITLE} ({products.length})
        </p>
      </div>
      <ul className="space-y-1">
        {products.map((product) => (
          <li key={product.id} className="flex items-center justify-between text-sm">
            <Link
              href={`/inventory/${product.id}`}
              className="text-zinc-700 hover:text-brand transition-colors font-medium"
            >
              {product.name}
            </Link>
            <span className="text-zinc-500">
              {product.stock} left · {formatCurrency(product.price / 100)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
