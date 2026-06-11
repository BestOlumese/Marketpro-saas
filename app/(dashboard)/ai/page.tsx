'use client'

import { useState, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Sparkles, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlanGate } from '@/components/shared/PlanGate'
import { AIChatPanel } from '@/components/ai/AIChatPanel'
import { renderMarkdownBlocks } from '@/components/ai/AIMessage'
import { ForecastCard } from '@/components/ai/ForecastCard'
import { AnomalyAlert } from '@/components/ai/AnomalyAlert'
import { PricingSuggestion } from '@/components/ai/PricingSuggestion'
import { useProducts } from '@/lib/hooks/useProducts'
import { usePlan } from '@/lib/hooks/usePlan'
import { useCurrentShop } from '@/lib/hooks/useCurrentShop'
import { AI } from '@/lib/constants/copy'
import type { ApiResponse } from '@/types'

type Tab = 'chat' | 'forecast' | 'insights'

interface DigestResult {
  digest: string
  generatedAt: string
}

function QuotaBadge() {
  const { limits } = usePlan()
  const { shop } = useCurrentShop()
  if (limits.aiQueries === Infinity) return null
  const used = shop?.aiQueriesUsed ?? 0
  const max  = limits.aiQueries
  const pct  = Math.min((used / max) * 100, 100)
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-xs text-zinc-500">
        {AI.QUOTA_LABEL}: <span className="font-medium text-zinc-900">{used} / {max}</span>
      </span>
      <div className="h-1.5 w-24 rounded-full bg-zinc-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-brand'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function AIContent() {
  const [tab, setTab] = useState<Tab>('chat')
  const [forecastSearch, setForecastSearch] = useState('')
  const [pricingSearch, setPricingSearch] = useState('')
  const [selectedPricingProductId, setSelectedPricingProductId] = useState<string | null>(null)
  const [digest, setDigest] = useState<string | null>(null)

  const { data: products = [] } = useProducts()

  const forecastProducts = useMemo(() => {
    const q = forecastSearch.toLowerCase().trim()
    return q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products
  }, [products, forecastSearch])

  const pricingProducts = useMemo(() => {
    const q = pricingSearch.toLowerCase().trim()
    return q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products
  }, [products, pricingSearch])

  const selectedPricingProduct = products.find((p) => p.id === selectedPricingProductId) ?? null

  const queryClient = useQueryClient()

  const digestMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/ai/digest', { method: 'POST' })
      const json: ApiResponse<DigestResult> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    onSuccess: (data) => {
      setDigest(data.digest)
      void queryClient.invalidateQueries({ queryKey: ['me', 'shop'] })
    },
    onError: (err: Error) => toast.error(err.message || AI.DIGEST_ERROR),
  })

  const TABS: { id: Tab; label: string }[] = [
    { id: 'chat',     label: AI.TAB_CHAT },
    { id: 'forecast', label: AI.TAB_FORECAST },
    { id: 'insights', label: AI.TAB_INSIGHTS },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 lg:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-brand">
            <Sparkles className="h-5 w-5" />
            {AI.TITLE}
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">{AI.DESCRIPTION}</p>
        </div>
        <QuotaBadge />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'border-brand text-brand'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Chat tab ─────────────────────────────────────────── */}
      {tab === 'chat' && (
        <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
          <AIChatPanel />
        </div>
      )}

      {/* ── Forecast tab ─────────────────────────────────────── */}
      {tab === 'forecast' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-brand">{AI.FORECAST_TITLE}</h2>
            <p className="text-xs text-zinc-500">{AI.FORECAST_DESCRIPTION}</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search products…"
              value={forecastSearch}
              onChange={(e) => setForecastSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {forecastProducts.length === 0 ? (
            <p className="text-sm text-zinc-400 py-4 text-center">No products match your search.</p>
          ) : (
            <>
              <p className="text-xs text-zinc-400">
                {forecastProducts.length} product{forecastProducts.length !== 1 ? 's' : ''} — click Forecast on any product to analyse it
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {forecastProducts.map((p) => (
                  <ForecastCard
                    key={p.id}
                    productId={p.id}
                    productName={p.name}
                    currentStock={p.stock}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Insights tab ─────────────────────────────────────── */}
      {tab === 'insights' && (
        <div className="space-y-8">

          {/* Anomalies */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-brand">{AI.ANOMALIES_TITLE}</h2>
            <AnomalyAlert />
          </section>

          {/* Pricing */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-brand">{AI.PRICING_TITLE}</h2>
            <p className="text-xs text-zinc-500">Search for a product, select it, then click Suggest Price.</p>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search products…"
                value={pricingSearch}
                onChange={(e) => {
                  setPricingSearch(e.target.value)
                  setSelectedPricingProductId(null)
                }}
                className="pl-9"
              />
            </div>

            {/* Product picker list — only shown when no product selected */}
            {!selectedPricingProduct && pricingSearch && (
              <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white max-h-56 overflow-y-auto">
                {pricingProducts.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-zinc-400">No products match.</p>
                ) : (
                  pricingProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPricingProductId(p.id)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-brand-light transition-colors"
                    >
                      <span className="text-sm font-medium text-zinc-900">{p.name}</span>
                      <span className="text-xs text-zinc-400">₦{(p.price / 100).toLocaleString('en-NG')}</span>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Selected product analysis */}
            {selectedPricingProduct && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Selected: <span className="font-medium text-zinc-900">{selectedPricingProduct.name}</span></span>
                  <button
                    type="button"
                    onClick={() => { setSelectedPricingProductId(null); setPricingSearch('') }}
                    className="text-xs text-zinc-400 hover:text-zinc-700 underline"
                  >
                    Change
                  </button>
                </div>
                <PricingSuggestion
                  productId={selectedPricingProduct.id}
                  productName={selectedPricingProduct.name}
                  currentPrice={selectedPricingProduct.price}
                />
              </div>
            )}

            {!pricingSearch && !selectedPricingProduct && (
              <p className="text-sm text-zinc-400 py-2">Start typing a product name above to search.</p>
            )}
          </section>

          {/* Weekly Digest */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-brand">{AI.DIGEST_TITLE}</h2>
                <p className="text-xs text-zinc-500">{AI.DIGEST_DESCRIPTION}</p>
              </div>
              <Button
                size="sm"
                className="bg-brand hover:bg-brand-dark text-white"
                disabled={digestMutation.isPending}
                onClick={() => digestMutation.mutate()}
              >
                {digestMutation.isPending ? (
                  <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />{AI.GENERATING}</>
                ) : (
                  <><Sparkles className="mr-1.5 h-3.5 w-3.5" />{AI.GENERATE_DIGEST}</>
                )}
              </Button>
            </div>

            {digest && (
              <div className="rounded-lg border border-brand/20 bg-brand-light px-4 py-3">
                <div className="space-y-0.5">
                  {renderMarkdownBlocks(digest)}
                </div>
              </div>
            )}
          </section>

        </div>
      )}
    </div>
  )
}

export default function AIPage() {
  return (
    <PlanGate requiredPlan="growth" description="AI features are available on the Growth plan and above.">
      <AIContent />
    </PlanGate>
  )
}
