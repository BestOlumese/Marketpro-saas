'use client'

import { useQuery } from '@tanstack/react-query'
import type { UserRole, ApiResponse } from '@/types'

export function useUserRole(): { role: UserRole | null; isLoaded: boolean } {
  const { data, isPending } = useQuery({
    queryKey: ['me', 'role'],
    queryFn: async () => {
      const res = await fetch('/api/me/role')
      if (!res.ok) return null
      const json = (await res.json()) as ApiResponse<UserRole | null>
      return json.success ? json.data : null
    },
    staleTime: 5 * 60 * 1000,
  })

  return { role: data ?? null, isLoaded: !isPending }
}
