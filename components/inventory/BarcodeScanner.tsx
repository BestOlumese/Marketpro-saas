'use client'

import { useEffect, useRef, useState } from 'react'
import { ScanBarcode, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { INVENTORY } from '@/lib/constants/copy'

type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => {
  detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>>
}

interface BarcodeScannerProps {
  value: string
  onChange: (value: string) => void
}

export function BarcodeScanner({ value, onChange }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [supported] = useState(() => typeof window !== 'undefined' && 'BarcodeDetector' in window)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)

  async function startScan() {
    if (!supported) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setScanning(true)

      const BarcodeDetectorClass = (window as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector!
      const detector = new BarcodeDetectorClass({ formats: ['ean_13', 'ean_8', 'qr_code', 'code_128', 'upc_a', 'upc_e'] })

      const detect = async () => {
        if (!videoRef.current) return
        try {
          const results = await detector.detect(videoRef.current)
          if (results.length > 0 && results[0]) {
            onChange(results[0].rawValue)
            stopScan()
            return
          }
        } catch {
          // detection frame error — continue loop
        }
        rafRef.current = requestAnimationFrame(detect)
      }
      rafRef.current = requestAnimationFrame(detect)
    } catch {
      setScanning(false)
    }
  }

  function stopScan() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setScanning(false)
  }

  useEffect(() => () => stopScan(), [])

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={INVENTORY.BARCODE_PLACEHOLDER}
        />
        {supported && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={scanning ? stopScan : startScan}
            aria-label={scanning ? INVENTORY.BARCODE_STOP : INVENTORY.BARCODE_SCAN}
          >
            {scanning ? <X className="h-4 w-4" /> : <ScanBarcode className="h-4 w-4" />}
          </Button>
        )}
      </div>
      {/* Video element always in DOM so videoRef is available when startScan runs */}
      <div className={`rounded-lg overflow-hidden border border-zinc-200 bg-black aspect-video w-full max-w-sm ${scanning ? '' : 'hidden'}`}>
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay />
      </div>
    </div>
  )
}
