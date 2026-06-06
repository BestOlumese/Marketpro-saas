'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Users,
  Sparkles,
  Settings,
  Menu,
  Tag,
  Truck,
  TrendingUp,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { OfflineBanner } from '@/components/shared/OfflineBanner'
import { APP_NAME, NAV } from '@/lib/constants/copy'
import { ROUTES } from '@/lib/constants/routes'

interface SubNavItem {
  label: string
  href: string
  icon: React.ElementType
}

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  children?: SubNavItem[]
}

const navItems: NavItem[] = [
  { label: NAV.DASHBOARD, href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: NAV.POS,       href: ROUTES.POS,       icon: ShoppingCart },
  {
    label: NAV.INVENTORY,
    href: ROUTES.INVENTORY,
    icon: Package,
    children: [
      { label: NAV.INVENTORY_CATEGORIES, href: ROUTES.INVENTORY_CATEGORIES, icon: Tag },
      { label: NAV.INVENTORY_SUPPLIERS,  href: ROUTES.INVENTORY_SUPPLIERS,  icon: Truck },
    ],
  },
  {
    label: NAV.REPORTS,
    href: ROUTES.REPORTS,
    icon: BarChart3,
    children: [
      { label: NAV.REPORTS_PRODUCTS, href: ROUTES.REPORTS_PRODUCTS, icon: TrendingUp },
      { label: NAV.REPORTS_STAFF,    href: ROUTES.REPORTS_STAFF,    icon: Users },
    ],
  },
  { label: NAV.STAFF,    href: ROUTES.STAFF,    icon: Users },
  { label: NAV.AI,       href: ROUTES.AI,       icon: Sparkles },
  { label: NAV.SETTINGS, href: ROUTES.SETTINGS, icon: Settings },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4 overflow-y-auto">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== ROUTES.DASHBOARD && pathname.startsWith(item.href + '/')) ||
          pathname.startsWith(item.href + '?')

        return (
          <div key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-light text-brand'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>

            {item.children && isActive && (
              <div className="mt-0.5 ml-4 flex flex-col gap-0.5 border-l border-zinc-200 pl-3">
                {item.children.map((child) => {
                  const childActive = pathname === child.href || pathname.startsWith(child.href + '/')
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onNavigate}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                        childActive
                          ? 'text-brand font-medium'
                          : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                      }`}
                    >
                      <child.icon className="h-3.5 w-3.5 shrink-0" />
                      {child.label}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 border-r border-zinc-200 bg-white">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-zinc-200">
          <span className="text-lg font-bold text-brand">{APP_NAME}</span>
        </div>
        <NavLinks />
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 lg:pl-60 min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 lg:px-6">
          <div className="flex items-center gap-3 lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-60 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex h-16 shrink-0 items-center px-6 border-b border-zinc-200">
                  <span className="text-lg font-bold text-brand">{APP_NAME}</span>
                </div>
                <NavLinks onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <span className="text-sm font-bold text-brand">{APP_NAME}</span>
          </div>

          <div className="ml-auto">
            <UserButton />
          </div>
        </header>

        <OfflineBanner />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
