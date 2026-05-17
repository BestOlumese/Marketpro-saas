'use client'

import { useAuth } from '@clerk/nextjs'
import type { UserRole } from '@/types'

export function useUserRole(): { role: UserRole | null; isLoaded: boolean } {
  const { isLoaded, orgRole } = useAuth()
  return {
    role: (orgRole as UserRole) ?? null,
    isLoaded,
  }
}
