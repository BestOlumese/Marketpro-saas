'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Star, StarOff, Pencil, Trash2, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  useBankAccounts,
  useCreateBankAccount,
  useUpdateBankAccount,
  useDeleteBankAccount,
} from '@/lib/hooks/useBankAccounts'
import type { BankAccount } from '@/lib/db/schema'
import type { CreateBankAccountInput } from '@/lib/validations/bankAccount.schema'

const EMPTY_FORM: CreateBankAccountInput = {
  bankName: '',
  accountNumber: '',
  accountName: '',
  isDefault: false,
}

interface FormState extends CreateBankAccountInput {}

export function BankAccountsSettings() {
  const { data: accounts = [], isLoading } = useBankAccounts()
  const createMutation = useCreateBankAccount()
  const updateMutation = useUpdateBankAccount()
  const deleteMutation = useDeleteBankAccount()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState<BankAccount | null>(null)

  function openNew() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(account: BankAccount) {
    setEditingId(account.id)
    setForm({
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      isDefault: account.isDefault,
    })
    setDialogOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, ...form },
        {
          onSuccess: () => { toast.success('Bank account updated'); setDialogOpen(false) },
          onError: (err) => toast.error(err.message),
        }
      )
    } else {
      createMutation.mutate(form, {
        onSuccess: () => { toast.success('Bank account added'); setDialogOpen(false) },
        onError: (err) => toast.error(err.message),
      })
    }
  }

  function handleDelete(account: BankAccount) {
    deleteMutation.mutate(account.id, {
      onSuccess: () => { toast.success('Bank account removed'); setDeleteTarget(null) },
      onError: (err) => toast.error(err.message),
    })
  }

  function handleSetDefault(account: BankAccount) {
    updateMutation.mutate(
      { id: account.id, isDefault: true },
      { onError: (err) => toast.error(err.message) }
    )
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-zinc-900">Transfer Accounts</h3>
          <p className="text-sm text-zinc-500">
            Bank accounts shown to customers during bank transfer payment.
          </p>
        </div>
        <Button size="sm" onClick={openNew} className="bg-brand hover:bg-brand-dark text-white">
          <Plus className="h-4 w-4 mr-1.5" />
          Add account
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((n) => (
            <div key={n} className="h-16 rounded-lg bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-200 p-8 text-center">
          <Building2 className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
          <p className="text-sm text-zinc-500">No bank accounts yet.</p>
          <p className="text-xs text-zinc-400 mt-0.5">
            Add at least one so customers can pay by transfer.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-zinc-900 text-sm">{account.bankName}</p>
                  {account.isDefault && (
                    <Badge className="bg-brand-light text-brand border-brand/20 text-xs">
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-zinc-500 font-mono tracking-wider mt-0.5">
                  {account.accountNumber}
                </p>
                <p className="text-xs text-zinc-500">{account.accountName}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!account.isDefault && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-400 hover:text-brand"
                    aria-label="Set as default"
                    onClick={() => handleSetDefault(account)}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                {account.isDefault && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-brand"
                    aria-label="Default account"
                    disabled
                  >
                    <StarOff className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Edit"
                  onClick={() => openEdit(account)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-danger hover:text-danger hover:bg-danger/10"
                  aria-label="Delete"
                  onClick={() => setDeleteTarget(account)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) setDialogOpen(false) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit bank account' : 'Add bank account'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ba-bank">Bank name</Label>
              <Input
                id="ba-bank"
                placeholder="e.g. First Bank"
                value={form.bankName}
                onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ba-number">Account number</Label>
              <Input
                id="ba-number"
                placeholder="0000000000"
                value={form.accountNumber}
                onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
                maxLength={20}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ba-name">Account name</Label>
              <Input
                id="ba-name"
                placeholder="e.g. My Shop Ltd"
                value={form.accountName}
                onChange={(e) => setForm((f) => ({ ...f, accountName: e.target.value }))}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="ba-default"
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                className="h-4 w-4 rounded border-zinc-300 accent-brand"
              />
              <Label htmlFor="ba-default" className="cursor-pointer">
                Set as default transfer account
              </Label>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-brand hover:bg-brand-dark text-white"
                disabled={isPending}
              >
                {isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteTarget !== null} onOpenChange={(v) => { if (!v) setDeleteTarget(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove bank account?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-600">
            <span className="font-medium">{deleteTarget?.bankName}</span> —{' '}
            {deleteTarget?.accountNumber} will be removed. This cannot be undone.
          </p>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-danger hover:bg-danger/90 text-white"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              {deleteMutation.isPending ? 'Removing…' : 'Remove'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
