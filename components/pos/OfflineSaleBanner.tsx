'use client'

import { WifiOff } from 'lucide-react'
import { POS } from '@/lib/constants/copy'

export function OfflineSaleBanner() {
  return (
    <div className="flex items-center gap-2 rounded-md bg-warning/10 px-4 py-2 text-sm text-warning">
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>{POS.OFFLINE_BANNER}</span>
    </div>
  )
}
