'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User, Store } from 'lucide-react'
import { toast } from 'sonner'
import { authClient, useSession } from '@/lib/auth-client'
import { useCurrentShop } from '@/lib/hooks/useCurrentShop'
import { AUTH } from '@/lib/constants/copy'
import { ROUTES } from '@/lib/constants/routes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function UserMenu() {
  const { data: session } = useSession()
  const { shop } = useCurrentShop()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const name  = session?.user?.name  ?? ''
  const email = session?.user?.email ?? ''
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  async function handleSignOut() {
    setLoading(true)
    const { error } = await authClient.signOut()
    if (error) {
      toast.error('Sign out failed')
    } else {
      router.push(ROUTES.SIGN_IN)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white text-xs font-semibold ring-2 ring-white hover:opacity-90 transition-opacity"
        aria-label="User menu"
      >
        {initials}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* User identity */}
        <div className="px-2 py-2 border-b border-zinc-100">
          <p className="text-sm font-medium text-zinc-900 truncate">{name || email}</p>
          {name && <p className="text-xs text-zinc-500 truncate">{email}</p>}
        </div>

        {/* Shop info */}
        {shop && (
          <div className="px-2 py-1.5 border-b border-zinc-100">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Store className="h-3 w-3 shrink-0" />
              <span className="truncate">{shop.name}</span>
              <span className="ml-auto shrink-0 capitalize font-medium text-brand">{shop.plan}</span>
            </div>
          </div>
        )}

        {/* Navigation items */}
        <div className="py-1">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push('/settings/profile')}
          >
            <User className="mr-2 h-4 w-4 text-zinc-400" />
            Account settings
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        <div className="py-1">
          <DropdownMenuItem
            onClick={handleSignOut}
            disabled={loading}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {AUTH.SIGN_OUT}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
