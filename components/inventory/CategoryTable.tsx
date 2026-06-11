'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { Pencil, Trash2, Tag, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { useUpdateCategory, useDeleteCategory } from '@/lib/hooks/useCategories'
import { INVENTORY } from '@/lib/constants/copy'
import type { Category } from '@/types'

const PAGE_SIZE = 10

interface CategoryTableProps {
  categories: Category[]
  isLoading: boolean
  isReadOnly?: boolean
}

function exportCategoriesCsv(categories: Category[]) {
  const rows = categories.map((c) => ({
    Name:       c.name,
    'Created At': new Date(c.createdAt).toLocaleDateString(),
  }))
  const csv = Papa.unparse(rows)
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a')
  a.href = url; a.download = 'categories.csv'; a.click()
  URL.revokeObjectURL(url)
}

export function CategoryTable({ categories, isLoading, isReadOnly = false }: CategoryTableProps) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [editName, setEditName] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const filtered = search.trim()
    ? categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : categories

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function openEdit(cat: Category) {
    setEditCategory(cat)
    setEditName(cat.name)
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editCategory || !editName.trim()) return
    updateMutation.mutate(
      { id: editCategory.id, data: { name: editName.trim() } },
      { onSuccess: () => setEditCategory(null) }
    )
  }

  function handleDelete() {
    if (!deleteId) return
    deleteMutation.mutate(deleteId, { onSettled: () => setDeleteId(null) })
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4"><Skeleton className="h-8 w-64" /></div>
        <div className="divide-y divide-zinc-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-28" />
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
        <div className="flex items-center gap-3 p-4 border-b border-zinc-100">
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder={INVENTORY.SEARCH_CATEGORIES}
            className="max-w-sm"
          />
          <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5"
            onClick={() => exportCategoriesCsv(filtered)}
            disabled={filtered.length === 0}
          >
            <Download className="h-3.5 w-3.5" />
            {INVENTORY.EXPORT_CSV}
          </Button>
        </div>

        {pageItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Tag className="h-10 w-10 text-zinc-300" />
            <p className="text-sm font-medium text-zinc-500">
              {search ? INVENTORY.EMPTY_SEARCH : INVENTORY.EMPTY_CATEGORIES}
            </p>
          </div>
        ) : (
          <Table className="min-w-100">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Name</TableHead>
                <TableHead className="whitespace-nowrap">Created</TableHead>
                {!isReadOnly && <TableHead className="w-20" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium text-zinc-900 whitespace-nowrap">{cat.name}</TableCell>
                  <TableCell className="text-zinc-500 text-sm whitespace-nowrap">
                    {new Date(cat.createdAt).toLocaleDateString()}
                  </TableCell>
                  {!isReadOnly && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(cat)}
                          aria-label={`Edit ${cat.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteId(cat.id)}
                          aria-label={`Delete ${cat.name}`}
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

      {/* Edit dialog */}
      <Dialog open={!!editCategory} onOpenChange={(open) => { if (!open) setEditCategory(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{INVENTORY.EDIT_CATEGORY}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-cat-name">Name *</Label>
              <Input
                id="edit-cat-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditCategory(null)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!editName.trim() || updateMutation.isPending}
                className="bg-brand hover:bg-brand-dark text-white"
              >
                {updateMutation.isPending ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{INVENTORY.DELETE_CATEGORY_TITLE}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-500">{INVENTORY.DELETE_CATEGORY_DESC}</p>
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
