'use client'

import { useState } from 'react'
import { LayoutDashboard, ShoppingCart, Package, Sparkles } from 'lucide-react'
import { AppScreenshot } from '@/components/shared/AppScreenshot'

const TABS = [
  {
    id:    'dashboard',
    label: 'Dashboard',
    icon:  LayoutDashboard,
    src:   '/screenshots/screenshot-dashboard.png',
    alt:   'MarketPro dashboard — revenue overview, top products, and sales chart',
    url:   'app.marketpro.ng/dashboard',
  },
  {
    id:    'pos',
    label: 'POS',
    icon:  ShoppingCart,
    src:   '/screenshots/screenshot-pos.png',
    alt:   'MarketPro POS checkout — cart with items and payment selection',
    url:   'app.marketpro.ng/pos',
  },
  {
    id:    'inventory',
    label: 'Inventory',
    icon:  Package,
    src:   '/screenshots/screenshot-inventory.png',
    alt:   'MarketPro inventory — product table with real-time stock level badges',
    url:   'app.marketpro.ng/inventory',
  },
  {
    id:    'ai',
    label: 'AI Insights',
    icon:  Sparkles,
    src:   '/screenshots/screenshot-ai.png',
    alt:   'MarketPro AI assistant answering a business intelligence question',
    url:   'app.marketpro.ng/ai',
  },
] as const

type TabId = (typeof TABS)[number]['id']

export function ProductPreview() {
  const [active, setActive] = useState<TabId>('dashboard')
  const activeTab = TABS.find((t) => t.id === active)!

  return (
    <div>
      {/* Tab strip */}
      <div className="mb-8 flex justify-center">
        <div className="flex gap-1 rounded-full border border-zinc-200 bg-zinc-100 p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = tab.id === active
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-brand' : ''}`} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active screenshot */}
      <AppScreenshot
        key={active}
        src={activeTab.src}
        alt={activeTab.alt}
        url={activeTab.url}
        priority={active === 'dashboard'}
      />
    </div>
  )
}
