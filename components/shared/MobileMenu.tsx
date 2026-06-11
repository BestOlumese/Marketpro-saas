'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { AuthNavMobile } from '@/components/auth/AuthNav'

interface NavLink {
  label: string
  href: string
}

export function MobileMenu({ navLinks }: { navLinks: NavLink[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 transition-colors"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-16 border-t border-zinc-100 bg-white py-4 space-y-1 px-4 sm:px-6 lg:px-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block rounded-md px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Separator className="my-3" />
          <div className="flex gap-2 px-4">
            <AuthNavMobile />
          </div>
        </div>
      )}
    </div>
  )
}
