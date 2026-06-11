'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/PageHeader'
import { ProductTable } from '@/components/inventory/ProductTable'
import { LowStockAlert } from '@/components/inventory/LowStockAlert'
import { BulkImportModal } from '@/components/inventory/BulkImportModal'
import { UpgradePrompt } from '@/components/shared/UpgradePrompt'
import { useProducts } from '@/lib/hooks/useProducts'
import { usePlan } from '@/lib/hooks/usePlan'
import { useUserRole } from '@/lib/hooks/useUserRole'
import { PLANS } from '@/lib/constants/plans'
import { INVENTORY } from '@/lib/constants/copy'
import { Button } from '@/components/ui/button'

export default function InventoryPage() {
  const [search, setSearch] = useState('')
  const [bulkOpen, setBulkOpen] = useState(false)

  const { data: products, isLoading } = useProducts()
  const { plan, isLoaded } = usePlan()
  const { role } = useUserRole()
  const isReadOnly = role === 'accountant'

  const totalProducts = products?.length ?? 0
  const maxProducts   = PLANS[plan].maxProducts
  const atLimit       = maxProducts !== Infinity && totalProducts >= maxProducts

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <PageHeader
        title={INVENTORY.TITLE}
        description={INVENTORY.DESCRIPTION}
        action={
          !isReadOnly ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setBulkOpen(true)}
                className="gap-1.5"
              >
                <Upload className="h-4 w-4" />
                {INVENTORY.IMPORT}
              </Button>
              {isLoaded && !atLimit && (
                <Link
                  href="/inventory/new"
                  className={cn(buttonVariants(), 'bg-brand hover:bg-brand-dark text-white gap-1.5')}
                >
                  <Plus className="h-4 w-4" />
                  {INVENTORY.NEW_PRODUCT}
                </Link>
              )}
            </div>
          ) : undefined
        }
      />

      {isLoaded && atLimit && (
        <UpgradePrompt
          requiredPlan="growth"
          description={`You've reached the ${maxProducts}-product limit on the Starter plan. Upgrade to Growth for unlimited products.`}
        />
      )}

      {maxProducts !== Infinity && isLoaded && (
        <p className="text-xs text-zinc-400">
          {totalProducts} / {maxProducts} products used
        </p>
      )}

      <LowStockAlert />

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={INVENTORY.SEARCH_PLACEHOLDER}
        className="max-w-sm"
      />

      <ProductTable products={products ?? []} isLoading={isLoading} search={search} isReadOnly={isReadOnly} />

      {!isReadOnly && <BulkImportModal open={bulkOpen} onOpenChange={setBulkOpen} />}
    </div>
  )
}
