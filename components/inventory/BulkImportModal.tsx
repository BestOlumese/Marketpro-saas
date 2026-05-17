'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useQueryClient } from '@tanstack/react-query'
import { UploadCloud, FileText, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { INVENTORY } from '@/lib/constants/copy'

interface BulkResult {
  imported: number
  failed: number
  errors: Array<{ row: number; reason: string }>
}

interface BulkImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BulkImportModal({ open, onOpenChange }: BulkImportModalProps) {
  const qc = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BulkResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((accepted: File[]) => {
    setFile(accepted[0] ?? null)
    setResult(null)
    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
  })

  async function handleImport() {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/inventory/products/bulk', { method: 'POST', body: fd })
      const json: { success: boolean; data?: BulkResult; error?: string } = await res.json()
      if (!json.success || !json.data) {
        setError(json.error ?? 'Import failed')
      } else {
        setResult(json.data)
        void qc.invalidateQueries({ queryKey: ['products'] })
      }
    } catch {
      setError('Import failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setFile(null)
    setResult(null)
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{INVENTORY.BULK_TITLE}</DialogTitle>
          <DialogDescription>{INVENTORY.BULK_DESCRIPTION}</DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-brand bg-brand-light'
                  : 'border-zinc-200 hover:border-brand/50 hover:bg-zinc-50'
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="mx-auto h-8 w-8 text-zinc-400 mb-2" />
              <p className="text-sm text-zinc-600">{INVENTORY.BULK_DROP}</p>
              <p className="text-xs text-zinc-400 mt-1">.csv only</p>
            </div>

            {file && (
              <div className="flex items-center gap-2 rounded-md bg-zinc-50 px-3 py-2">
                <FileText className="h-4 w-4 text-zinc-500 shrink-0" />
                <span className="text-sm text-zinc-700 truncate">{file.name}</span>
              </div>
            )}

            <p className="text-xs text-zinc-400">{INVENTORY.BULK_FORMAT}</p>

            {error && <p className="text-sm text-danger">{error}</p>}

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!file || loading}
                className="bg-brand hover:bg-brand-dark text-white"
              >
                {loading ? INVENTORY.BULK_IMPORTING : 'Import'}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-md bg-brand-light px-4 py-3">
              <CheckCircle className="h-5 w-5 text-brand shrink-0" />
              <p className="text-sm font-medium text-brand">
                {result.imported} products imported
              </p>
            </div>

            {result.failed > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-danger shrink-0" />
                  <p className="text-sm font-medium text-danger">{result.failed} rows failed</p>
                </div>
                <ul className="space-y-1 max-h-40 overflow-y-auto">
                  {result.errors.map((e) => (
                    <li key={e.row} className="text-xs text-zinc-500">
                      Row {e.row}: {e.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <DialogFooter>
              <Button onClick={handleClose} className="bg-brand hover:bg-brand-dark text-white">
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
