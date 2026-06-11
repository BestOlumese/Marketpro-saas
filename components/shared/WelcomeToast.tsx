'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export function WelcomeToast() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('welcome') === '1') {
      toast.success('Welcome! Your account has been linked to the shop.')
      // Remove the query param without adding to browser history
      const url = new URL(window.location.href)
      url.searchParams.delete('welcome')
      router.replace(url.pathname + (url.search || ''))
    }
  }, [searchParams, router])

  return null
}
