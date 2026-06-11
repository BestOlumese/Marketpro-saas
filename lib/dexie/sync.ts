import { localDb, type CachedProduct } from './db'

export async function syncProductsToLocal(): Promise<void> {
  try {
    const res = await fetch('/api/inventory/products')
    if (!res.ok) return
    const json = (await res.json()) as {
      success: boolean
      data: Array<{
        id: string
        shopId: string
        name: string
        barcode: string | null
        price: number
        stock: number
        status: 'active' | 'inactive' | 'out_of_stock'
        categoryId: string | null
      }>
    }
    if (!json.success) return

    const products: CachedProduct[] = json.data.map((p) => ({
      id: p.id,
      shopId: p.shopId,
      name: p.name,
      barcode: p.barcode,
      price: p.price,
      stock: p.stock,
      status: p.status,
      categoryId: p.categoryId,
    }))

    // Delete products no longer on the server (deleted/soft-deleted since last sync)
    const serverIds  = new Set(products.map((p) => p.id))
    const localKeys  = await localDb.products.toCollection().primaryKeys() as string[]
    const staleIds   = localKeys.filter((id) => !serverIds.has(id))
    if (staleIds.length > 0) await localDb.products.bulkDelete(staleIds)

    await localDb.products.bulkPut(products)
  } catch {
    // silently fail — offline or not authenticated yet
  }
}

export async function flushPendingSales(): Promise<void> {
  const pending = await localDb.pendingSales
    .where('status')
    .equals('pending')
    .toArray()

  for (const sale of pending) {
    try {
      const res = await fetch('/api/pos/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sale),
      })
      const status = res.ok ? 'synced' : 'failed'
      await localDb.pendingSales.update(sale.id!, { status })
    } catch {
      await localDb.pendingSales.update(sale.id!, { status: 'failed' })
    }
  }
}
