import type { UserRole } from '@/types'
import { ROUTES } from './routes'

/** Default page a role lands on after login or after being redirected away from a blocked route. */
export const ROLE_DEFAULT_ROUTE: Record<UserRole, string> = {
  owner:             ROUTES.DASHBOARD,
  manager:           ROUTES.DASHBOARD,
  accountant:        ROUTES.REPORTS,
  inventory_manager: ROUTES.DASHBOARD,
  cashier:           ROUTES.POS,
}

/** Route prefixes a role is allowed to visit. '*' means unrestricted. */
const ALLOWED_PREFIXES: Record<UserRole, string[]> = {
  owner:             ['*'],
  manager:           ['*'],
  accountant:        [ROUTES.DASHBOARD, ROUTES.REPORTS, ROUTES.AI, ROUTES.SETTINGS],
  inventory_manager: [ROUTES.DASHBOARD, ROUTES.INVENTORY, ROUTES.SETTINGS],
  cashier:           [ROUTES.DASHBOARD, ROUTES.POS, ROUTES.SETTINGS],
}

/**
 * Returns true if the role can visit the given pathname.
 * Billing and team-settings sub-pages are checked separately in the layout.
 */
export function canAccessRoute(role: UserRole, pathname: string): boolean {
  const prefixes = ALLOWED_PREFIXES[role]
  if (prefixes.includes('*')) return true
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

// ── Role groups used in requireRole() calls across API routes ────────────────

/** Every authenticated staff member. */
export const ALL_STAFF: UserRole[] = ['owner', 'manager', 'accountant', 'inventory_manager', 'cashier']

/** Roles that can read inventory (products, categories, stock). */
export const INVENTORY_READ: UserRole[] = ['owner', 'manager', 'accountant', 'inventory_manager']

/** Roles that can read inventory AND are allowed to browse products for the POS. */
export const PRODUCT_READ: UserRole[] = ['owner', 'manager', 'accountant', 'inventory_manager', 'cashier']

/** Roles that can create/update/delete inventory records. */
export const INVENTORY_WRITE: UserRole[] = ['owner', 'manager', 'inventory_manager']

/** Roles that can read reports. */
export const REPORTS_READ: UserRole[] = ['owner', 'manager', 'accountant']

/** Roles that can use AI features. */
export const AI_ACCESS: UserRole[] = ['owner', 'manager', 'accountant']

/** Roles that can access POS. */
export const POS_ACCESS: UserRole[] = ['owner', 'manager', 'cashier']

/** Owner + manager admin actions. */
export const ADMIN_ONLY: UserRole[] = ['owner', 'manager']

/** Owner-only actions (billing, dangerous operations). */
export const OWNER_ONLY: UserRole[] = ['owner']
