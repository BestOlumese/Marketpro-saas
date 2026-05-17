'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { CategoryTable } from '@/components/inventory/CategoryTable'
import { useCategories, useCreateCategory } from '@/lib/hooks/useCategories'
import { INVENTORY } from '@/lib/constants/copy'

export default function CategoriesPage() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  const { data: categories, isLoading } = useCategories()
  const createMutation = useCreateCategory()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    createMutation.mutate(
      { name: name.trim() },
      { onSuccess: () => { setName(''); setOpen(false) } }
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title={INVENTORY.CATEGORIES_TITLE}
        description={INVENTORY.CATEGORIES_DESCRIPTION}
        action={
          <Button
            onClick={() => setOpen(true)}
            className="bg-brand hover:bg-brand-dark text-white gap-1.5"
          >
            <Plus className="h-4 w-4" />
            {INVENTORY.NEW_CATEGORY}
          </Button>
        }
      />

      <CategoryTable categories={categories ?? []} isLoading={isLoading} />

      {/* Add dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{INVENTORY.NEW_CATEGORY}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name *</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={INVENTORY.CATEGORY_PLACEHOLDER}
                required
                autoFocus
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
                disabled={!name.trim() || createMutation.isPending}
                className="bg-brand hover:bg-brand-dark text-white"
              >
                {createMutation.isPending ? 'Saving…' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
