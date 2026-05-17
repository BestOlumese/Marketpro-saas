'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BarcodeScanner } from '@/components/inventory/BarcodeScanner'
import { useCreateProduct, useUpdateProduct, useProduct } from '@/lib/hooks/useProducts'
import { useCategories } from '@/lib/hooks/useCategories'
import { useSuppliers } from '@/lib/hooks/useSuppliers'
import { SearchableSelect } from '@/components/shared/SearchableSelect'
import { INVENTORY } from '@/lib/constants/copy'
import type { ProductWithRelations } from '@/types'

interface FormState {
  name: string
  barcode: string
  price: string
  costPrice: string
  stock: string
  lowStockAt: string
  categoryId: string
  supplierId: string
  status: 'active' | 'inactive' | 'out_of_stock'
  expiresAt: string
}

const EMPTY_FORM: FormState = {
  name: '',
  barcode: '',
  price: '',
  costPrice: '',
  stock: '0',
  lowStockAt: '5',
  categoryId: '',
  supplierId: '',
  status: 'active',
  expiresAt: '',
}

function productToForm(product: ProductWithRelations): FormState {
  return {
    name: product.name,
    barcode: product.barcode ?? '',
    price: (product.price / 100).toString(),
    costPrice: (product.costPrice / 100).toString(),
    stock: product.stock.toString(),
    lowStockAt: product.lowStockAt.toString(),
    categoryId: product.categoryId ?? '',
    supplierId: product.supplierId ?? '',
    status: product.status ?? 'active',
    expiresAt: product.expiresAt
      ? new Date(product.expiresAt).toISOString().split('T')[0]
      : '',
  }
}

interface ProductFormProps {
  product?: ProductWithRelations
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!product

  const { data: categories } = useCategories()
  const { data: suppliers } = useSuppliers()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()

  const [form, setForm] = useState<FormState>(() =>
    product ? productToForm(product) : EMPTY_FORM
  )

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const price = Math.round(parseFloat(form.price) * 100)
    const costPrice = Math.round(parseFloat(form.costPrice) * 100)
    const stock = parseInt(form.stock, 10)
    const lowStockAt = parseInt(form.lowStockAt, 10)

    if (isNaN(price) || price <= 0) return
    if (isNaN(costPrice) || costPrice < 0) return
    if (isNaN(stock) || stock < 0) return

    const data = {
      name: form.name.trim(),
      barcode: form.barcode.trim() || undefined,
      price,
      costPrice,
      stock,
      lowStockAt: isNaN(lowStockAt) ? 5 : lowStockAt,
      categoryId: form.categoryId || null,
      supplierId: form.supplierId || null,
      status: form.status,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    }

    if (isEdit && product) {
      updateMutation.mutate(
        { id: product.id, data },
        { onSuccess: () => router.push('/inventory') }
      )
    } else {
      createMutation.mutate(data, { onSuccess: () => router.push('/inventory') })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const selectClass =
    'h-8 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-sm text-zinc-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Product name *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Indomie Noodles 70g"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="barcode">Barcode</Label>
        <BarcodeScanner value={form.barcode} onChange={(v) => set('barcode', v)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="price">Selling price (₦) *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="costPrice">Cost price (₦)</Label>
          <Input
            id="costPrice"
            type="number"
            min="0"
            step="0.01"
            value={form.costPrice}
            onChange={(e) => set('costPrice', e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="stock">Stock quantity</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={(e) => set('stock', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lowStockAt">Low stock alert at</Label>
          <Input
            id="lowStockAt"
            type="number"
            min="0"
            step="1"
            value={form.lowStockAt}
            onChange={(e) => set('lowStockAt', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="categoryId">Category</Label>
          <SearchableSelect
            id="categoryId"
            value={form.categoryId}
            onChange={(v) => set('categoryId', v)}
            options={categories?.map((c) => ({ value: c.id, label: c.name })) ?? []}
            placeholder="No category"
            emptyLabel="No category"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="supplierId">Supplier</Label>
          <SearchableSelect
            id="supplierId"
            value={form.supplierId}
            onChange={(v) => set('supplierId', v)}
            options={suppliers?.map((s) => ({ value: s.id, label: s.name })) ?? []}
            placeholder="No supplier"
            emptyLabel="No supplier"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          value={form.status}
          onChange={(e) => set('status', e.target.value as FormState['status'])}
          className={selectClass}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="expiresAt">Expiry date (optional)</Label>
        <Input
          id="expiresAt"
          type="date"
          value={form.expiresAt}
          onChange={(e) => set('expiresAt', e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={isPending || !form.name.trim()}
          className="bg-brand hover:bg-brand-dark text-white"
        >
          {isPending ? 'Saving…' : isEdit ? INVENTORY.EDIT_PRODUCT : INVENTORY.NEW_PRODUCT}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/inventory')}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

// Wrapper for edit page: fetches product then renders form
interface EditProductFormProps {
  productId: string
}

export function EditProductForm({ productId }: EditProductFormProps) {
  const { data: product, isLoading } = useProduct(productId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    )
  }

  if (!product) {
    return <p className="text-sm text-zinc-500">Product not found.</p>
  }

  return <ProductForm key={product.id} product={product} />
}
