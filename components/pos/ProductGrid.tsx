'use client'

import { useState, useRef, useCallback } from 'react'
import { ScanBarcode, X, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/formatters'
import { useCartStore } from '@/store/cartStore'
import { POS } from '@/lib/constants/copy'
import type { CachedProduct } from '@/lib/dexie/db'

type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => {
  detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>>
}

interface ProductGridProps {
  products: CachedProduct[]
}

const MIN_SEARCH = 1

export function ProductGrid({ products }: ProductGridProps) {
  const [query, setQuery] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanSupported] = useState(
    () => typeof window !== 'undefined' && 'BarcodeDetector' in window
  )
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const addItem = useCartStore((s) => s.addItem)

  const available = products.filter((p) => p.status === 'active' && p.stock > 0)

  const results =
    query.trim().length >= MIN_SEARCH
      ? available.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.barcode?.toLowerCase().includes(query.toLowerCase()) ?? false)
        )
      : []

  function handleAdd(product: CachedProduct) {
    addItem({ productId: product.id, name: product.name, price: product.price })
    setQuery('')
    inputRef.current?.focus()
  }

  const stopScan = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setScanning(false)
  }, [])

  async function startScan() {
    if (!scanSupported) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setScanning(true)

      const BarcodeDetectorClass = (
        window as { BarcodeDetector?: BarcodeDetectorCtor }
      ).BarcodeDetector!
      const detector = new BarcodeDetectorClass({
        formats: ['ean_13', 'ean_8', 'qr_code', 'code_128', 'upc_a', 'upc_e'],
      })

      const detect = async () => {
        if (!videoRef.current) return
        try {
          const found = await detector.detect(videoRef.current)
          if (found.length > 0 && found[0]) {
            const barcode = found[0].rawValue
            stopScan()
            const match = available.find((p) => p.barcode === barcode)
            if (match) {
              addItem({ productId: match.id, name: match.name, price: match.price })
            } else {
              setQuery(barcode)
            }
            inputRef.current?.focus()
            return
          }
        } catch {
          // detection frame error — continue
        }
        rafRef.current = requestAnimationFrame(detect)
      }
      rafRef.current = requestAnimationFrame(detect)
    } catch {
      setScanning(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <Input
            ref={inputRef}
            placeholder={POS.SEARCH_PLACEHOLDER}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-9"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => { setQuery(''); inputRef.current?.focus() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {scanSupported && (
          <Button
            variant="outline"
            size="icon"
            aria-label={scanning ? 'Stop scanning' : 'Scan barcode'}
            onClick={scanning ? stopScan : startScan}
          >
            {scanning ? <X className="h-4 w-4" /> : <ScanBarcode className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {scanning && (
        <div className="rounded-lg overflow-hidden border border-zinc-200 bg-black aspect-video w-full max-w-xs self-center">
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        </div>
      )}

      {query.trim().length < MIN_SEARCH ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center select-none">
          <Search className="h-10 w-10 text-zinc-200" />
          <p className="text-sm text-zinc-400">
            Type a product name or barcode, or scan with the camera.
          </p>
          <p className="text-xs text-zinc-300">{available.length} products available</p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-zinc-400">{POS.EMPTY_PRODUCTS}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto rounded-lg border border-zinc-200 bg-white divide-y divide-zinc-100">
          {results.map((product) => (
            <button
              key={product.id}
              type="button"
              aria-label={`Add ${product.name} to cart`}
              onClick={() => handleAdd(product)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 active:bg-brand-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-zinc-900 truncate">{product.name}</p>
                {product.barcode && (
                  <p className="text-xs text-zinc-400 font-mono">{product.barcode}</p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    product.stock <= 5
                      ? 'border-warning/40 text-warning bg-warning/10'
                      : 'border-zinc-200 text-zinc-500'
                  }`}
                >
                  {product.stock} left
                </Badge>
                <span className="font-semibold text-brand tabular-nums text-sm">
                  {formatCurrency(product.price / 100)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
