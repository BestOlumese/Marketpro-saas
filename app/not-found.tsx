import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 p-6 text-center">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-brand">404</p>
        <h1 className="text-3xl font-semibold text-zinc-900">Page not found</h1>
        <p className="max-w-sm text-sm text-zinc-500">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <Link
        href={ROUTES.DASHBOARD}
        className={cn(buttonVariants(), 'bg-brand hover:bg-brand-dark text-white')}
      >
        Go to Dashboard
      </Link>
    </div>
  )
}
