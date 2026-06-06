'use client'

import { useQuery } from '@tanstack/react-query'
import type { ApiResponse } from '@/types'
import type {
  SalesSummaryItem,
  TopProduct,
  StaffPerformance,
  ProfitReport,
  DashboardMetrics,
} from '@/lib/db/queries/reports'

function toParams(from: string, to: string, extra?: Record<string, string>) {
  const p = new URLSearchParams({ from, to, ...extra })
  return p.toString()
}

export function useSalesSummary(from: string, to: string) {
  return useQuery<SalesSummaryItem[]>({
    queryKey: ['reports', 'summary', from, to],
    queryFn: async () => {
      const res = await fetch(`/api/reports/summary?${toParams(from, to)}`)
      const json: ApiResponse<SalesSummaryItem[]> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    enabled: !!from && !!to,
    staleTime: 1000 * 60 * 5,
  })
}

export function useTopProducts(from: string, to: string, limit = 10) {
  return useQuery<TopProduct[]>({
    queryKey: ['reports', 'products', from, to, limit],
    queryFn: async () => {
      const res = await fetch(`/api/reports/products?${toParams(from, to, { limit: String(limit) })}`)
      const json: ApiResponse<TopProduct[]> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    enabled: !!from && !!to,
    staleTime: 1000 * 60 * 5,
  })
}

export function useStaffPerformance(from: string, to: string) {
  return useQuery<StaffPerformance[]>({
    queryKey: ['reports', 'staff', from, to],
    queryFn: async () => {
      const res = await fetch(`/api/reports/staff?${toParams(from, to)}`)
      const json: ApiResponse<StaffPerformance[]> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    enabled: !!from && !!to,
    staleTime: 1000 * 60 * 5,
  })
}

export function useProfitReport(from: string, to: string) {
  return useQuery<ProfitReport>({
    queryKey: ['reports', 'profit', from, to],
    queryFn: async () => {
      const res = await fetch(`/api/reports/profit?${toParams(from, to)}`)
      const json: ApiResponse<ProfitReport> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    enabled: !!from && !!to,
    staleTime: 1000 * 60 * 5,
  })
}

export function useDashboardMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: ['reports', 'dashboard-metrics'],
    queryFn: async () => {
      const res = await fetch('/api/reports/summary?dashboard=1')
      const json: ApiResponse<DashboardMetrics> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  })
}
