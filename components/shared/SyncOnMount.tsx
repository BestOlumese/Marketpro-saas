'use client'

import { useEffect } from 'react'
import { syncProductsToLocal, flushPendingSales } from '@/lib/dexie/sync'

export function SyncOnMount() {
  useEffect(() => {
    // Sync product cache and flush any queued offline sales on first load
    void syncProductsToLocal()
    void flushPendingSales()

    // Re-flush whenever the device comes back online
    window.addEventListener('online', flushPendingSales)
    return () => window.removeEventListener('online', flushPendingSales)
  }, [])

  return null
}
