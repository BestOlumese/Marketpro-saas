import { z } from 'zod'

export const createBankAccountSchema = z.object({
  bankName:      z.string().min(1, 'Bank name is required').max(100),
  accountNumber: z.string().min(10, 'Account number must be at least 10 digits').max(20),
  accountName:   z.string().min(1, 'Account name is required').max(100),
  isDefault:     z.boolean().default(false),
})

export const updateBankAccountSchema = createBankAccountSchema.partial()

export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>
export type UpdateBankAccountInput = z.infer<typeof updateBankAccountSchema>
