# OFFLINE.md — Offline Strategy

> Offline mode is intentionally minimal. Do not expand scope without asking.

---

## What Works Offline

| Feature | Offline behaviour |
|---------|------------------|
| POS cart in progress | Alive in Zustand memory |
| Product browsing | Cached in Dexie on app load |
| Cash payment | Allowed — saved to Dexie, synced silently |
| Card / transfer | Blocked — internet required |
| Today's sales | Cached in Dexie |
| Reports (historical) | Blocked — redirect to /offline |
| Inventory edit | Blocked — redirect to /offline |
| Staff management | Blocked — redirect to /offline |
| AI assistant | Blocked — redirect to /offline |
| Settings / billing | Blocked — redirect to /offline |

---

## Dexie Schema

```typescript
// lib/dexie/db.ts
import Dexie, { type Table } from 'dexie'

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
  products!: Table
  pendingSales!: Table<PendingSale>
  todaySales!: Table<CachedSale>

  constructor() {
    super('marketpro_local')
    this.version(1).stores({
      products:     '++id, barcode, name, shopId',
      pendingSales: '++id, shopId, status, createdAt',
      todaySales:   'id, shopId, createdAt',
    })
  }
}

export const localDb = new MarketProDB()
```

---

## Online Status Hook

```typescript
// lib/hooks/useOnlineStatus.ts
import { useState, useEffect } from 'react'

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  useEffect(() => {
    const on = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return isOnline
}
```

---

## Silent Sync on Reconnect

```typescript
// lib/dexie/sync.ts
export async function flushPendingSales(): Promise<void> {
  const pending = await localDb.pendingSales
    .where('status').equals('pending')
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
```

Register once in dashboard layout:
```typescript
useEffect(() => {
  window.addEventListener('online', flushPendingSales)
  return () => window.removeEventListener('online', flushPendingSales)
}, [])
```

---

## Product Cache on App Load

```typescript
async function syncProductsToLocal(shopId: string) {
  const res = await fetch(`/api/inventory/products?shopId=${shopId}`)
  const { data } = await res.json()
  await localDb.products.clear()
  await localDb.products.bulkPut(data)
}
```

Call once per session in the dashboard layout, not on every page navigation.

---

## Offline Screen

Route: `app/offline/page.tsx`
- Show clear "You are offline" message
- List what still works with quick links (POS, products, today's sales)
- Auto-redirect back when `online` event fires
- Keep it simple — no complex UI
