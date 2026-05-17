import { PageHeader } from '@/components/shared/PageHeader'
import { ProductForm } from '@/components/inventory/ProductForm'
import { INVENTORY } from '@/lib/constants/copy'

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <PageHeader
        title={INVENTORY.NEW_PRODUCT}
        description="Fill in the details below to add a new product."
      />
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <ProductForm />
      </div>
    </div>
  )
}
