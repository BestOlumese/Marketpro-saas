'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { BankAccount } from '@/lib/db/schema'
import type { ApiResponse } from '@/types'
import type { CreateBankAccountInput, UpdateBankAccountInput } from '@/lib/validations/bankAccount.schema'

const KEY = ['bank-accounts'] as const

export function useBankAccounts() {
  return useQuery<BankAccount[]>({
    queryKey: KEY,
    queryFn: async () => {
      const res = await fetch('/api/settings/bank-accounts')
      const json: ApiResponse<BankAccount[]> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
  })
}

export function useCreateBankAccount() {
  const qc = useQueryClient()
  return useMutation<BankAccount, Error, CreateBankAccountInput>({
    mutationFn: async (input) => {
      const res = await fetch('/api/settings/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const json: ApiResponse<BankAccount> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateBankAccount() {
  const qc = useQueryClient()
  return useMutation<BankAccount, Error, UpdateBankAccountInput & { id: string }>({
    mutationFn: async ({ id, ...input }) => {
      const res = await fetch(`/api/settings/bank-accounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const json: ApiResponse<BankAccount> = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteBankAccount() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/settings/bank-accounts/${id}`, { method: 'DELETE' })
      const json: ApiResponse<{ id: string }> = await res.json()
      if (!json.success) throw new Error(json.error)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
