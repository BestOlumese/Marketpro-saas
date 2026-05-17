import Dexie, { type Table } from 'dexie'

export interface CachedProduct {
  id: string
  shopId: string
  name: string
  barcode: string | null
  price: number
  stock: number
  status: 'active' | 'inactive' | 'out_of_stock'
  categoryId: string | null
}

interface PendingSale {
  id?: number
  shopId: string
  items: Array<{ productId: string; quantity: number; price: number }>
  total: number
  paymentMethod: 'cash'
  createdAt: string
  status: 'pending' | 'synced' | 'failed'
}

interface CachedSale {
  id: string
  shopId: string
  total: number
  createdAt: string
}

class MarketProDB extends Dexie {
  products!: Table<CachedProduct>
  pendingSales!: Table<PendingSale>
  todaySales!: Table<CachedSale>

  constructor() {
    super('marketpro_local')

    this.version(1).stores({
      products:     '++id, barcode, name, shopId',
      pendingSales: '++id, shopId, status, createdAt',
      todaySales:   'id, shopId, createdAt',
    })

    // Version 2: products keyed by UUID, extended fields
    this.version(2)
      .stores({
        products:     'id, barcode, name, shopId, status',
        pendingSales: '++id, shopId, status, createdAt',
        todaySales:   'id, shopId, createdAt',
      })
      .upgrade((tx) => {
        return tx.table('products').clear()
      })
  }
}

export const localDb = new MarketProDB()
