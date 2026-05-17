import { z } from 'zod'

export const productSchema = z.object({
  name:        z.string().min(1, 'Name is required').max(200),
  barcode:     z.string().max(100).optional(),
  price:       z.number().int().positive('Price must be greater than 0'),   // kobo
  costPrice:   z.number().int().min(0, 'Cost price cannot be negative'),    // kobo
  stock:       z.number().int().min(0, 'Stock cannot be negative'),
  lowStockAt:  z.number().int().min(0).default(5),
  categoryId:  z.string().uuid().nullable().optional(),
  supplierId:  z.string().uuid().nullable().optional(),
  status:      z.enum(['active', 'inactive', 'out_of_stock']).default('active'),
  expiresAt:   z.string().datetime().nullable().optional(),
})

export const updateProductSchema = productSchema.partial()

export const bulkProductRowSchema = z.object({
  name:         z.string().min(1),
  barcode:      z.string().optional(),
  price:        z.coerce.number().positive('Price must be greater than 0'),  // naira
  cost_price:   z.coerce.number().min(0).default(0),                         // naira
  stock:        z.coerce.number().min(0).transform(Math.round).default(0),
  low_stock_at: z.coerce.number().min(0).transform(Math.round).default(5),
  category:     z.string().optional(),
  expiry_date:  z.string().optional(),
})

export type ProductInput = z.infer<typeof productSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type BulkProductRow = z.infer<typeof bulkProductRowSchema>
