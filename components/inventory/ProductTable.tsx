'use client'

import { useState } from 'react'
import Link from 'next/link'
import Papa from 'papaparse'
import { Pencil, Trash2, Package, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StockBadge } from '@/components/inventory/StockBadge'
import { useDeleteProduct } from '@/lib/hooks/useProducts'
import { useCategories } from '@/lib/hooks/useCategories'
import { formatCurrency } from '@/lib/utils/formatters'
import { INVENTORY } from '@/lib/constants/copy'
import type { ProductWithRelations } from '@/types'

const PAGE_SIZE = 10

interface ProductTableProps {
  products: ProductWithRelations[]
  isLoading: boolean
  search?: string
  isReadOnly?: boolean
}

function exportProductsCsv(products: ProductWithRelations[]) {
  const rows = products.map((p) => ({
    Name:            p.name,
    Barcode:         p.barcode ?? '',
    Category:        p.category?.name ?? '',
    Supplier:        p.supplier?.name ?? '',
    'Price (₦)':     (p.price / 100).toFixed(2),
    'Cost Price (₦)': p.costPrice != null ? (p.costPrice / 100).toFixed(2) : '',
    Stock:           p.stock,
    'Low Stock At':  p.lowStockAt ?? '',
  }))
  const csv = Papa.unparse(rows)
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a')
  a.href = url; a.download = 'products.csv'; a.click()
  URL.revokeObjectURL(url)
}

export function ProductTable({ products, isLoading, search, isReadOnly = false }: ProductTableProps) {
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: categories } = useCategories()
  const deleteMutation = useDeleteProduct()

  const filtered = products.filter((p) => {
    const matchesCategory = !categoryFilter || p.categoryId === categoryFilter
    const q = search?.trim().toLowerCase()
    const matchesSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      (p.barcode ?? '').toLowerCase().includes(q) ||
      (p.category?.name ?? '').toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)  // safePage auto-clamps when search shrinks results
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function handleDelete() {
    if (!deleteId) return
    deleteMutation.mutate(deleteId, { onSettled: () => setDeleteId(null) })
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 flex gap-3">
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="divide-y divide-zinc-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-zinc-100">
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
            className="h-8 rounded-lg border border-zinc-200 bg-white px-2.5 text-sm text-zinc-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            <option value="">{INVENTORY.FILTER_ALL_CATEGORIES}</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5"
            onClick={() => exportProductsCsv(filtered)}
            disabled={filtered.length === 0}
          >
            <Download className="h-3.5 w-3.5" />
            {INVENTORY.EXPORT_CSV}
          </Button>
        </div>

        {pageItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Package className="h-10 w-10 text-zinc-300" />
            <p className="text-sm font-medium text-zinc-500">{INVENTORY.EMPTY}</p>
            <p className="text-xs text-zinc-400">{INVENTORY.EMPTY_DESCRIPTION}</p>
          </div>
        ) : (
          <Table className="min-w-160">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Name</TableHead>
                <TableHead className="whitespace-nowrap">Barcode</TableHead>
                <TableHead className="whitespace-nowrap">Category</TableHead>
                <TableHead className="whitespace-nowrap">Price</TableHead>
                <TableHead className="whitespace-nowrap">Stock</TableHead>
                {!isReadOnly && <TableHead className="w-20" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium text-zinc-900 whitespace-nowrap">
                    {product.name}
                  </TableCell>
                  <TableCell className="text-zinc-500 text-xs font-mono whitespace-nowrap">
                    {product.barcode ?? '—'}
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm whitespace-nowrap">
                    {product.category?.name ?? '—'}
                  </TableCell>
                  <TableCell className="text-zinc-700 text-sm whitespace-nowrap">
                    {formatCurrency(product.price / 100)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-700">{product.stock}</span>
                      <StockBadge stock={product.stock} lowStockAt={product.lowStockAt} />
                    </div>
                  </TableCell>
                  {!isReadOnly && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/inventory/${product.id}`}
                          className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}
                          aria-label="Edit product"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteId(product.id)}
                          aria-label="Delete product"
                          className="text-danger hover:text-danger hover:bg-danger/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100">
            <p className="text-xs text-zinc-500">
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={safePage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={safePage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{INVENTORY.DELETE_CONFIRM_TITLE}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-500">{INVENTORY.DELETE_CONFIRM_DESCRIPTION}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-danger text-white hover:bg-danger/90"
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
