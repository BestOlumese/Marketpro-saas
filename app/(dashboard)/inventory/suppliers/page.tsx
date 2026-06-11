'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { SupplierTable } from '@/components/inventory/SupplierTable'
import { useSuppliers, useCreateSupplier } from '@/lib/hooks/useSuppliers'
import { useUserRole } from '@/lib/hooks/useUserRole'
import { INVENTORY } from '@/lib/constants/copy'

interface SupplierFormState {
  name: string
  phone: string
  email: string
  notes: string
}

const EMPTY: SupplierFormState = { name: '', phone: '', email: '', notes: '' }

export default function SuppliersPage() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<SupplierFormState>(EMPTY)

  const { data: suppliers, isLoading } = useSuppliers()
  const createMutation = useCreateSupplier()
  const { role } = useUserRole()
  const isReadOnly = role === 'accountant'

  function set(field: keyof SupplierFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    createMutation.mutate(
      {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        notes: form.notes.trim() || undefined,
      },
      {
        onSuccess: () => { setForm(EMPTY); setOpen(false) },
      }
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <PageHeader
        title={INVENTORY.SUPPLIERS_TITLE}
        description={INVENTORY.SUPPLIERS_DESCRIPTION}
        action={
          !isReadOnly ? (
            <Button
              onClick={() => setOpen(true)}
              className="bg-brand hover:bg-brand-dark text-white gap-1.5"
            >
              <Plus className="h-4 w-4" />
              {INVENTORY.NEW_SUPPLIER}
            </Button>
          ) : undefined
        }
      />

      <SupplierTable suppliers={suppliers ?? []} isLoading={isLoading} isReadOnly={isReadOnly} />

      {/* Add dialog — hidden for read-only roles */}
      <Dialog open={!isReadOnly && open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{INVENTORY.NEW_SUPPLIER}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="s-name">Name *</Label>
              <Input
                id="s-name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Dangote Distributors"
                required
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="s-phone">Phone</Label>
                <Input
                  id="s-phone"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+234…"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-email">Email</Label>
                <Input
                  id="s-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="supplier@email.com"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-notes">Notes</Label>
              <Textarea
                id="s-notes"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Payment terms, delivery schedule, etc."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!form.name.trim() || createMutation.isPending}
                className="bg-brand hover:bg-brand-dark text-white"
              >
                {createMutation.isPending ? 'Saving…' : 'Add supplier'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
