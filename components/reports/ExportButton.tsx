'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { REPORTS } from '@/lib/constants/copy'

interface ExportButtonProps {
  from: string
  to: string
}

export function ExportButton({ from, to }: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    if (!from || !to) return
    setLoading(true)
    try {
      const res = await fetch(`/api/reports/export?from=${from}&to=${to}`)
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `sales-${from}-to-${to}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Failed to export. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={loading || !from || !to}
      onClick={handleExport}
    >
      <Download className="h-4 w-4 mr-1.5" />
      {loading ? REPORTS.EXPORTING : REPORTS.EXPORT_CSV}
    </Button>
  )
}
