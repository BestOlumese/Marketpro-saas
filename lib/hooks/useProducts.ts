'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ApiResponse, ProductWithRelations } from '@/types'
import type { ProductInput, UpdateProductInput } from '@/lib/validations/product.schema'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<ProductWithRelations[]> => {
      const res = await fetch('/api/inventory/products')
      const json: ApiResponse<ProductWithRelations[]> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async (): Promise<ProductWithRelations> => {
      const res = await fetch(`/api/inventory/products/${id}`)
      const json: ApiResponse<ProductWithRelations> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: ProductInput): Promise<ProductWithRelations> => {
      const res = await fetch('/api/inventory/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json: ApiResponse<ProductWithRelations> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateProductInput
    }): Promise<ProductWithRelations> => {
      const res = await fetch(`/api/inventory/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json: ApiResponse<ProductWithRelations> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product updated')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<ProductWithRelations> => {
      const res = await fetch(`/api/inventory/products/${id}`, { method: 'DELETE' })
      const json: ApiResponse<ProductWithRelations> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: ['products', 'low-stock'],
    queryFn: async (): Promise<ProductWithRelations[]> => {
      const res = await fetch('/api/inventory/low-stock')
      const json: ApiResponse<ProductWithRelations[]> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    staleTime: 1000 * 60 * 2,
  })
}
