'use client'

import { useEffect } from 'react'
import { syncProductsToLocal } from '@/lib/dexie/sync'

export function SyncOnMount() {
  useEffect(() => {
    void syncProductsToLocal()
  }, [])

  return null
}
