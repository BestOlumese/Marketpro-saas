'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { SaleWithItems } from '@/lib/db/queries/sales'
import type { CreateSaleInput } from '@/lib/validations/sale.schema'
import type { ApiResponse } from '@/types'
import { localDb } from '@/lib/dexie/db'

interface UseCreateSaleOptions {
  isOnline: boolean
}

export function useCreateSale({ isOnline }: UseCreateSaleOptions) {
  const queryClient = useQueryClient()

  return useMutation<SaleWithItems | null, Error, CreateSaleInput & { shopId?: string }>({
    mutationFn: async (input) => {
      if (!isOnline && input.paymentMethod === 'cash') {
        await localDb.pendingSales.add({
          shopId: input.shopId ?? '',
          items: input.items.map((i) => ({
            productId: i.productId,
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
          total: input.items.reduce((s, i) => s + i.price * i.quantity, 0),
          paymentMethod: 'cash',
          createdAt: new Date().toISOString(),
          status: 'pending',
        })
        return null
      }

      const res = await fetch('/api/pos/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const json: ApiResponse<SaleWithItems> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useShift() {
  return useMutation<{ action: 'open' | 'close'; shiftId: string | null }, Error, 'open' | 'close'>({
    mutationFn: async (action) => {
      const res = await fetch('/api/pos/shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const json: ApiResponse<{ action: 'open' | 'close'; shiftId: string | null }> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
  })
}
