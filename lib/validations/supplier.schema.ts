import { z } from 'zod'

export const supplierSchema = z.object({
  name:  z.string().min(1, 'Name is required').max(200),
  phone: z.string().max(20).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  notes: z.string().max(1000).optional(),
})

export const updateSupplierSchema = supplierSchema.partial()

export type SupplierInput = z.infer<typeof supplierSchema>
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>
