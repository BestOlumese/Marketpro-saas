export const ROUTES = {
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  OFFLINE: '/offline',

  DASHBOARD: '/dashboard',
  POS: '/pos',
  INVENTORY: '/inventory',
  INVENTORY_CATEGORIES: '/inventory/categories',
  INVENTORY_SUPPLIERS: '/inventory/suppliers',
  REPORTS: '/reports',
  STAFF: '/staff',
  AI: '/ai',
  SETTINGS: '/settings',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
