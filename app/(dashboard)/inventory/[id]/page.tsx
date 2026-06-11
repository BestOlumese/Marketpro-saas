import { PageHeader } from '@/components/shared/PageHeader'
import { EditProductForm } from '@/components/inventory/ProductForm'
import { INVENTORY } from '@/lib/constants/copy'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-2xl">
      <PageHeader
        title={INVENTORY.EDIT_PRODUCT}
        description="Update the product details below."
      />
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <EditProductForm productId={id} />
      </div>
    </div>
  )
}
