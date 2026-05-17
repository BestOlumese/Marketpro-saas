import Link from 'next/link'
import { WifiOff } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { OFFLINE, APP_NAME } from '@/lib/constants/copy'
import { ROUTES } from '@/lib/constants/routes'

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 p-6 text-center">
      <WifiOff className="h-12 w-12 text-zinc-400" />
      <div className="space-y-2">
        <p className="text-sm font-bold text-brand">{APP_NAME}</p>
        <h1 className="text-2xl font-semibold text-zinc-900">{OFFLINE.TITLE}</h1>
        <p className="max-w-sm text-sm text-zinc-500">{OFFLINE.DESCRIPTION}</p>
      </div>
      <Link href={ROUTES.DASHBOARD} className={buttonVariants({ variant: 'outline' })}>
        Try again
      </Link>
    </div>
  )
}
