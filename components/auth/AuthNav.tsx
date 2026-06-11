'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { LANDING } from '@/lib/constants/copy'
import { ROUTES } from '@/lib/constants/routes'

function AuthNavDesktopInner() {
  const { data: session, isPending } = useSession()
  if (isPending) return <div className="h-9 w-28 animate-pulse rounded-md bg-zinc-100" />

  if (session?.user) {
    return (
      <Link href={ROUTES.DASHBOARD} className={cn(buttonVariants(), 'bg-brand hover:bg-brand-dark text-white')}>
        {LANDING.CTA_DASHBOARD}
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Link href={ROUTES.SIGN_IN} className={buttonVariants({ variant: 'ghost' })}>
        Sign in
      </Link>
      <Link href={ROUTES.SIGN_UP} className={cn(buttonVariants(), 'bg-brand hover:bg-brand-dark text-white')}>
        Get started
      </Link>
    </div>
  )
}

function AuthNavMobileInner() {
  const { data: session, isPending } = useSession()
  if (isPending) return null

  if (session?.user) {
    return (
      <Link href={ROUTES.DASHBOARD} className={cn(buttonVariants(), 'flex-1 bg-brand hover:bg-brand-dark text-white')}>
        {LANDING.CTA_DASHBOARD}
      </Link>
    )
  }

  return (
    <>
      <Link href={ROUTES.SIGN_IN} className={cn(buttonVariants({ variant: 'outline' }), 'flex-1')}>
        Sign in
      </Link>
      <Link href={ROUTES.SIGN_UP} className={cn(buttonVariants(), 'flex-1 bg-brand hover:bg-brand-dark text-white')}>
        Get started
      </Link>
    </>
  )
}

// Loaded with ssr: false to avoid prerender issues
export const AuthNavDesktop = dynamic(() => Promise.resolve(AuthNavDesktopInner), { ssr: false })
export const AuthNavMobile  = dynamic(() => Promise.resolve(AuthNavMobileInner),  { ssr: false })
