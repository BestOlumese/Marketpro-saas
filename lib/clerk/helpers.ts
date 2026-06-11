// Backward-compat re-export — all API routes import from here and keep working
export { getCurrentRole, requireRole, getShopId, getStaffId, getAuthContext } from '@/lib/auth/helpers'
export type { AuthContext } from '@/lib/auth/helpers'
