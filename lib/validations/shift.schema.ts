import { z } from 'zod'

export const openShiftSchema = z.object({
  openingCash: z.number().int().min(0),
})

export const closeShiftSchema = z.object({
  closingCash: z.number().int().min(0),
  note: z.string().max(500).optional(),
})

export type OpenShiftInput = z.infer<typeof openShiftSchema>
export type CloseShiftInput = z.infer<typeof closeShiftSchema>
