'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { Pencil, Trash2, Building2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
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
import { useUpdateSupplier, useDeleteSupplier } from '@/lib/hooks/useSuppliers'
import { INVENTORY } from '@/lib/constants/copy'
import type { Supplier } from '@/types'

const PAGE_SIZE = 10

interface SupplierFormState {
  name: string
  phone: string
  email: string
  notes: string
}

interface SupplierTableProps {
  suppliers: Supplier[]
  isLoading: boolean
  isReadOnly?: boolean
}

function exportSuppliersCsv(suppliers: Supplier[]) {
  const rows = suppliers.map((s) => ({
    Name:  s.name,
    Phone: s.phone ?? '',
    Email: s.email ?? '',
    Notes: s.notes ?? '',
  }))
  const csv = Papa.unparse(rows)
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a')
  a.href = url; a.download = 'suppliers.csv'; a.click()
  URL.revokeObjectURL(url)
}

export function SupplierTable({ suppliers, isLoading, isReadOnly = false }: SupplierTableProps) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null)
  const [editForm, setEditForm] = useState<SupplierFormState>({ name: '', phone: '', email: '', notes: '' })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const updateMutation = useUpdateSupplier()
  const deleteMutation = useDeleteSupplier()

  const filtered = search.trim()
    ? suppliers.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.phone?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
      )
    : suppliers

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function openEdit(supplier: Supplier) {
    setEditSupplier(supplier)
    setEditForm({
      name: supplier.name,
      phone: supplier.phone ?? '',
      email: supplier.email ?? '',
      notes: supplier.notes ?? '',
    })
  }

  function setField(field: keyof SupplierFormState, value: string) {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editSupplier || !editForm.name.trim()) return
    updateMutation.mutate(
      {
        id: editSupplier.id,
        data: {
          name: editForm.name.trim(),
          phone: editForm.phone.trim() || undefined,
          email: editForm.email.trim() || undefined,
          notes: editForm.notes.trim() || undefined,
        },
      },
      { onSuccess: () => setEditSupplier(null) }
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
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-36" />
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
            placeholder={INVENTORY.SEARCH_SUPPLIERS}
            className="max-w-sm"
          />
          <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5"
            onClick={() => exportSuppliersCsv(filtered)}
            disabled={filtered.length === 0}
          >
            <Download className="h-3.5 w-3.5" />
            {INVENTORY.EXPORT_CSV}
          </Button>
        </div>

        {pageItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Building2 className="h-10 w-10 text-zinc-300" />
            <p className="text-sm font-medium text-zinc-500">
              {search ? INVENTORY.EMPTY_SEARCH : INVENTORY.EMPTY_SUPPLIERS}
            </p>
          </div>
        ) : (
          <Table className="min-w-175">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Name</TableHead>
                <TableHead className="whitespace-nowrap">Phone</TableHead>
                <TableHead className="whitespace-nowrap">Email</TableHead>
                <TableHead className="whitespace-nowrap">Notes</TableHead>
                {!isReadOnly && <TableHead className="w-20" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-zinc-900 whitespace-nowrap">
                    {s.name}
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm whitespace-nowrap">
                    {s.phone ?? '—'}
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm whitespace-nowrap">
                    {s.email ?? '—'}
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm max-w-48 truncate">
                    {s.notes ?? '—'}
                  </TableCell>
                  {!isReadOnly && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(s)}
                          aria-label={`Edit ${s.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteId(s.id)}
                          aria-label={`Delete ${s.name}`}
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
      <Dialog open={!!editSupplier} onOpenChange={(open) => { if (!open) setEditSupplier(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{INVENTORY.EDIT_SUPPLIER}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-s-name">Name *</Label>
              <Input
                id="edit-s-name"
                value={editForm.name}
                onChange={(e) => setField('name', e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-s-phone">Phone</Label>
                <Input
                  id="edit-s-phone"
                  value={editForm.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="+234…"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-s-email">Email</Label>
                <Input
                  id="edit-s-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setField('email', e.target.value)}
                  placeholder="supplier@email.com"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-s-notes">Notes</Label>
              <Textarea
                id="edit-s-notes"
                value={editForm.notes}
                onChange={(e) => setField('notes', e.target.value)}
                placeholder="Payment terms, delivery schedule, etc."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditSupplier(null)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!editForm.name.trim() || updateMutation.isPending}
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
            <DialogTitle>{INVENTORY.DELETE_SUPPLIER_TITLE}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-500">{INVENTORY.DELETE_SUPPLIER_DESC}</p>
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
