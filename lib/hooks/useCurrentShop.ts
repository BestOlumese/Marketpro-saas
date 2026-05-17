'use client'

import { useOrganization } from '@clerk/nextjs'

export interface CurrentShop {
  id: string
  name: string
}

export function useCurrentShop(): { shop: CurrentShop | null; isLoaded: boolean } {
  const { organization, isLoaded } = useOrganization()

  if (!isLoaded || !organization) {
    return { shop: null, isLoaded }
  }

  return {
    shop: { id: organization.id, name: organization.name },
    isLoaded,
  }
}
