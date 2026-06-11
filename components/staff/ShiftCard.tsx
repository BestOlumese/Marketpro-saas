'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Clock, CircleDot } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SHIFTS } from '@/lib/constants/copy'
import { formatCurrency } from '@/lib/utils/formatters'
import type { ApiResponse, Shift } from '@/types'

function nairaToKobo(naira: string): number {
  return Math.round(parseFloat(naira || '0') * 100)
}

async function fetchActiveShift(): Promise<Shift | null> {
  const res = await fetch('/api/shifts/active')
  if (!res.ok) return null
  const json: ApiResponse<Shift | null> = await res.json()
  return json.success ? json.data : null
}

async function doOpenShift(openingCash: number): Promise<Shift> {
  const res = await fetch('/api/shifts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ openingCash }),
  })
  const json: ApiResponse<Shift> = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data
}

async function doCloseShift(id: string, closingCash: number, note?: string): Promise<Shift> {
  const res = await fetch(`/api/shifts/${id}/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ closingCash, note }),
  })
  const json: ApiResponse<Shift> = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data
}

export function ShiftCard() {
  const qc = useQueryClient()
  const [openDialog, setOpenDialog] = useState(false)
  const [closeDialog, setCloseDialog] = useState(false)
  const [openingCashInput, setOpeningCashInput] = useState('')
  const [closingCashInput, setClosingCashInput] = useState('')
  const [noteInput, setNoteInput] = useState('')

  const { data: activeShift, isLoading } = useQuery({
    queryKey: ['activeShift'],
    queryFn: fetchActiveShift,
    refetchInterval: 30_000,
  })

  const openMutation = useMutation({
    mutationFn: () => doOpenShift(nairaToKobo(openingCashInput)),
    onSuccess: () => {
      toast.success(SHIFTS.OPEN_SUCCESS)
      qc.invalidateQueries({ queryKey: ['activeShift'] })
      qc.invalidateQueries({ queryKey: ['shiftHistory'] })
      setOpenDialog(false)
      setOpeningCashInput('')
    },
    onError: (err: Error) => {
      toast.error(err.message || SHIFTS.OPEN_ERROR)
    },
  })

  const closeMutation = useMutation({
    mutationFn: () => {
      if (!activeShift) throw new Error('No active shift')
      return doCloseShift(activeShift.id, nairaToKobo(closingCashInput), noteInput || undefined)
    },
    onSuccess: () => {
      toast.success(SHIFTS.CLOSE_SUCCESS)
      qc.invalidateQueries({ queryKey: ['activeShift'] })
      qc.invalidateQueries({ queryKey: ['shiftHistory'] })
      setCloseDialog(false)
      setClosingCashInput('')
      setNoteInput('')
    },
    onError: (err: Error) => {
      toast.error(err.message || SHIFTS.CLOSE_ERROR)
    },
  })

  if (isLoading) {
    return <Skeleton className="h-24 w-full rounded-lg" />
  }

  return (
    <div className={`rounded-lg border p-4 ${activeShift ? 'border-brand/30 bg-brand-light' : 'border-zinc-200 bg-white'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CircleDot className={`h-4 w-4 ${activeShift ? 'text-brand' : 'text-zinc-400'}`} />
          <span className={`text-sm font-medium ${activeShift ? 'text-brand' : 'text-zinc-900'}`}>
            {activeShift ? SHIFTS.STATUS_OPEN : SHIFTS.NO_OPEN_SHIFT}
          </span>
          {activeShift && (
            <Badge variant="outline" className="bg-white text-brand border-brand/30 text-xs font-semibold">
              {SHIFTS.STATUS_OPEN}
            </Badge>
          )}
        </div>

        {activeShift ? (
          <Dialog open={closeDialog} onOpenChange={setCloseDialog}>
            <DialogTrigger className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              {SHIFTS.CLOSE_SHIFT}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-brand">{SHIFTS.CONFIRM_CLOSE}</DialogTitle>
                <DialogDescription>{SHIFTS.CONFIRM_CLOSE_DESCRIPTION}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3 rounded-md bg-brand-light border border-brand/20 p-3 text-sm">
                  <span className="text-brand/70">{SHIFTS.OPENING_CASH}</span>
                  <span className="text-right font-semibold text-brand">{formatCurrency(activeShift.openingCash / 100)}</span>
                  <span className="text-brand/70">{SHIFTS.OPENED_AT}</span>
                  <span className="text-right font-medium text-brand">
                    {new Date(activeShift.openedAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="closing-cash">{SHIFTS.CLOSING_CASH_LABEL}</Label>
                  <Input
                    id="closing-cash"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={SHIFTS.CLOSING_CASH_PLACEHOLDER}
                    value={closingCashInput}
                    onChange={(e) => setClosingCashInput(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="shift-note">{SHIFTS.NOTE_LABEL}</Label>
                  <Textarea
                    id="shift-note"
                    placeholder={SHIFTS.NOTE_PLACEHOLDER}
                    rows={2}
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full bg-brand hover:bg-brand-dark text-white"
                  onClick={() => closeMutation.mutate()}
                  disabled={!closingCashInput || closeMutation.isPending}
                >
                  {closeMutation.isPending ? SHIFTS.CLOSING : SHIFTS.CLOSE_SHIFT}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger className={cn(buttonVariants({ size: 'sm' }), 'bg-brand hover:bg-brand-dark text-white')}>
              {SHIFTS.OPEN_SHIFT}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-brand">{SHIFTS.OPEN_SHIFT}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="opening-cash">{SHIFTS.OPENING_CASH_LABEL}</Label>
                  <Input
                    id="opening-cash"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={SHIFTS.OPENING_CASH_PLACEHOLDER}
                    value={openingCashInput}
                    onChange={(e) => setOpeningCashInput(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full bg-brand hover:bg-brand-dark text-white"
                  onClick={() => openMutation.mutate()}
                  disabled={openMutation.isPending}
                >
                  {openMutation.isPending ? SHIFTS.OPENING : SHIFTS.OPEN_SHIFT}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!activeShift && (
        <p className="mt-2 text-xs text-zinc-400">{SHIFTS.NO_OPEN_SHIFT_HINT}</p>
      )}

      {activeShift && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-brand/70">
          <Clock className="h-3.5 w-3.5 text-brand" />
          <span>
            {SHIFTS.OPENED_AT}{' '}
            {new Date(activeShift.openedAt).toLocaleString('en-NG', {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </span>
          <span className="mx-1">·</span>
          <span className="font-medium text-brand">{SHIFTS.OPENING_CASH}: {formatCurrency(activeShift.openingCash / 100)}</span>
        </div>
      )}
    </div>
  )
}
