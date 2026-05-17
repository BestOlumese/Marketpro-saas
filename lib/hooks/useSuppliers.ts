'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ApiResponse, Supplier } from '@/types'
import type { SupplierInput, UpdateSupplierInput } from '@/lib/validations/supplier.schema'

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async (): Promise<Supplier[]> => {
      const res = await fetch('/api/inventory/suppliers')
      const json: ApiResponse<Supplier[]> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useCreateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: SupplierInput): Promise<Supplier> => {
      const res = await fetch('/api/inventory/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json: ApiResponse<Supplier> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('Supplier created')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateSupplierInput
    }): Promise<Supplier> => {
      const res = await fetch(`/api/inventory/suppliers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json: ApiResponse<Supplier> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('Supplier updated')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDeleteSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<Supplier> => {
      const res = await fetch(`/api/inventory/suppliers/${id}`, { method: 'DELETE' })
      const json: ApiResponse<Supplier> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['suppliers'] })
      void qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Supplier deleted')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
