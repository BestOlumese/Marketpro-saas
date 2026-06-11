export type ApiSuccess<T> = { success: true; data: T }
export type ApiError = { success: false; error: string; code?: string }
export type ApiResponse<T> = ApiSuccess<T> | ApiError

export type UserRole = 'owner' | 'manager' | 'accountant' | 'inventory_manager' | 'cashier'

export type PlanName = 'starter' | 'growth' | 'pro'

export type ReportType = 'basic' | 'full'

// Re-export DB types for use across the app
export type { Product, NewProduct } from '@/lib/db/schema'
export type { Category, NewCategory } from '@/lib/db/schema'
export type { Supplier, NewSupplier } from '@/lib/db/schema'
export type { Shop } from '@/lib/db/schema'
export type { Staff } from '@/lib/db/schema'
export type { Shift, NewShift } from '@/lib/db/schema'

import type { Product } from '@/lib/db/schema'
import type { Category } from '@/lib/db/schema'
import type { Supplier } from '@/lib/db/schema'
import type { Shift } from '@/lib/db/schema'
import type { Staff } from '@/lib/db/schema'
import type { Sale, SaleItem } from '@/lib/db/schema'

export type ProductWithRelations = Product & {
  category: Category | null
  supplier: Supplier | null
}

export type ShiftWithStaff = Shift & {
  staff: { name: string; role: string }
}

export type StaffWithStats = Staff & {
  sales: Array<{ total: number }>
}

export type StaffWithRelations = Staff & {
  sales: Array<Sale & { items: SaleItem[] }>
  shifts: Shift[]
}
