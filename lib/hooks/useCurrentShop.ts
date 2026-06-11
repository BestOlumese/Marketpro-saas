'use client'

import { useQuery } from '@tanstack/react-query'
import type { ApiResponse } from '@/types'

export interface CurrentShop {
  id: string
  name: string
  plan: string
  betterAuthOrgId: string | null
  aiQueriesUsed: number
}

export function useCurrentShop(): { shop: CurrentShop | null; isLoaded: boolean } {
  const { data, isPending } = useQuery({
    queryKey: ['me', 'shop'],
    queryFn: async () => {
      const res = await fetch('/api/me/shop')
      if (!res.ok) return null
      const json = (await res.json()) as ApiResponse<CurrentShop | null>
      return json.success ? json.data : null
    },
    staleTime: 5 * 60 * 1000,
  })

  return { shop: data ?? null, isLoaded: !isPending }
}
