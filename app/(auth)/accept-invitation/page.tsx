'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { authClient, useSession } from '@/lib/auth-client'
import { ROUTES } from '@/lib/constants/routes'

function AcceptInvitationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, isPending } = useSession()
  const invitationId = searchParams.get('id')
  const attempted = useRef(false)

  useEffect(() => {
    if (isPending || attempted.current) return

    if (!invitationId) {
      router.replace(ROUTES.SIGN_IN)
      return
    }

    if (!session?.user) {
      router.replace(`${ROUTES.SIGN_IN}?callbackUrl=/accept-invitation?id=${invitationId}`)
      return
    }

    attempted.current = true

    async function accept() {
      const { error } = await authClient.organization.acceptInvitation({
        invitationId: invitationId!,
      })

      if (error) {
        toast.error(error.message ?? 'Failed to accept invitation. The link may have expired.')
        router.replace(ROUTES.DASHBOARD)
      } else {
        router.replace(`${ROUTES.DASHBOARD}?welcome=1`)
      }
    }

    void accept()
  }, [isPending, session, invitationId, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent mx-auto" />
        <p className="text-sm text-zinc-500">Accepting invitation…</p>
      </div>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  )
}
