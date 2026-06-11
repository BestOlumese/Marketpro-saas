import { z } from 'zod'

export const dateRangeSchema = z.object({
  from:  z.string().min(1, 'From date is required'),
  to:    z.string().min(1, 'To date is required'),
  limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
})

export type DateRangeInput = z.infer<typeof dateRangeSchema>
