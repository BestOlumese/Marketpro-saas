import { z } from 'zod'

export const saleItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  name:      z.string().min(1),
  price:     z.number().int().positive('Price must be greater than 0'),  // kobo
  quantity:  z.number().int().min(1, 'Quantity must be at least 1'),
})

export const createSaleSchema = z.object({
  items:         z.array(saleItemSchema).min(1, 'Cart cannot be empty'),
  paymentMethod: z.enum(['cash', 'transfer', 'card']),
  discount:      z.number().int().min(0).max(100).default(0),
  customerId:    z.string().uuid().nullable().optional(),
  note:          z.string().max(500).nullable().optional(),
})

export const voidSaleSchema = z.object({
  saleId: z.string().uuid('Invalid sale ID'),
})

export type CreateSaleInput = z.infer<typeof createSaleSchema>
export type VoidSaleInput   = z.infer<typeof voidSaleSchema>
