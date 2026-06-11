export const ROUTES = {
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  ONBOARDING: '/onboarding',
  OFFLINE: '/offline',

  DASHBOARD: '/dashboard',
  POS: '/pos',
  INVENTORY: '/inventory',
  INVENTORY_CATEGORIES: '/inventory/categories',
  INVENTORY_SUPPLIERS: '/inventory/suppliers',
  REPORTS: '/reports',
  REPORTS_PRODUCTS: '/reports/products',
  REPORTS_STAFF: '/reports/staff',
  STAFF: '/staff',
  STAFF_SHIFTS: '/staff/shifts',
  AI: '/ai',
  SETTINGS: '/settings',
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_TEAM: '/settings/team',
  SETTINGS_BILLING: '/settings/billing',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
