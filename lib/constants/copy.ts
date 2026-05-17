export const APP_NAME = 'MarketPro'
export const APP_TAGLINE = 'Smart POS & inventory for modern market shops'

export const NAV = {
  DASHBOARD: 'Dashboard',
  POS: 'POS',
  INVENTORY: 'Inventory',
  INVENTORY_CATEGORIES: 'Categories',
  INVENTORY_SUPPLIERS: 'Suppliers',
  REPORTS: 'Reports',
  STAFF: 'Staff',
  AI: 'AI',
  SETTINGS: 'Settings',
} as const

export const AUTH = {
  SIGN_IN_TITLE: 'Welcome back',
  SIGN_IN_DESCRIPTION: 'Sign in to your MarketPro account',
  SIGN_UP_TITLE: 'Create your account',
  SIGN_UP_DESCRIPTION: 'Get started with MarketPro today',
} as const


export const ERRORS = {
  GENERIC: 'Something went wrong. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
} as const

export const OFFLINE = {
  TITLE: 'You are offline',
  DESCRIPTION: 'MarketPro is running in offline mode. Some features are limited.',
  BANNER: 'No internet connection — working offline',
} as const

export const LANDING = {
  HERO_TITLE: 'The smarter way to run your shop',
  HERO_SUBTITLE: 'Fast POS, real-time inventory, and AI-powered insights — built for Nigerian supermarkets and market shops.',
  HERO_CTA_PRIMARY: 'Start for free',
  HERO_CTA_SECONDARY: 'See features',
  CTA_DASHBOARD: 'Go to Dashboard',
  FEATURES_TITLE: 'Everything your shop needs',
  FEATURES_SUBTITLE: 'From checkout to close of business, MarketPro keeps you in control.',
  PRICING_TITLE: 'Simple, honest pricing',
  PRICING_SUBTITLE: 'Start free, upgrade as you grow. No hidden fees.',
  FAQ_TITLE: 'Frequently asked questions',
  CONTACT_TITLE: 'Get in touch',
  CONTACT_SUBTITLE: 'We are here to help. Reach out anytime.',
  CONTACT_EMAIL: 'hello@marketpro.ng',
  CONTACT_WHATSAPP: '+2348000000000',
  FOOTER_TAGLINE: 'Built for Nigerian market shops.',
  FOOTER_RIGHTS: `© ${new Date().getFullYear()} MarketPro. All rights reserved.`,
} as const

export const FEATURE_LIST = [
  {
    title: 'Fast Checkout',
    description: 'Ring up sales in seconds. Supports cash, card, and bank transfer.',
  },
  {
    title: 'Smart Inventory',
    description: 'Track stock in real time. Get low-stock alerts before you run out.',
  },
  {
    title: 'Sales Reports',
    description: 'Daily, weekly, and monthly reports. Know your best sellers at a glance.',
  },
  {
    title: 'Staff Management',
    description: 'Set roles and permissions for admins, managers, and cashiers.',
  },
  {
    title: 'Works Offline',
    description: 'No internet? Keep selling. MarketPro syncs automatically when you are back online.',
  },
  {
    title: 'AI Insights',
    description: 'Get smart reorder suggestions and demand forecasts powered by Claude AI.',
  },
] as const

export const PRICING_LIST = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for small shops just getting started.',
    features: [
      'Up to 500 products',
      '2 staff accounts',
      '1 branch',
      'Basic reports',
      'POS & inventory',
    ],
    cta: 'Get started free',
    featured: false,
  },
  {
    name: 'Growth',
    price: '₦9,900/mo',
    description: 'For growing shops that need more power.',
    features: [
      'Unlimited products',
      'Unlimited staff',
      'Up to 3 branches',
      'Full reports & analytics',
      '50 AI queries/month',
    ],
    cta: 'Start Growth plan',
    featured: true,
  },
  {
    name: 'Pro',
    price: '₦19,900/mo',
    description: 'For multi-branch businesses that need it all.',
    features: [
      'Everything in Growth',
      'Unlimited branches',
      'Unlimited AI queries',
      'WhatsApp receipts & alerts',
      'Priority support',
    ],
    cta: 'Start Pro plan',
    featured: false,
  },
] as const

export const INVENTORY = {
  TITLE: 'Inventory',
  DESCRIPTION: 'Manage your products, categories, and suppliers.',
  NEW_PRODUCT: 'Add product',
  EDIT_PRODUCT: 'Edit product',
  IMPORT: 'Import CSV',
  SEARCH_PLACEHOLDER: 'Search products...',
  FILTER_ALL_CATEGORIES: 'All categories',
  EMPTY: 'No products yet.',
  EMPTY_DESCRIPTION: 'Add your first product to get started.',
  EMPTY_SEARCH: 'No products match your search.',
  LOW_STOCK_TITLE: 'Low stock',
  LOW_STOCK_EMPTY: 'All products are well stocked.',
  DELETE_CONFIRM_TITLE: 'Delete product?',
  DELETE_CONFIRM_DESCRIPTION: 'This action cannot be undone.',
  STOCK_IN: 'In stock',
  STOCK_LOW: 'Low stock',
  STOCK_OUT: 'Out of stock',
  CATEGORIES_TITLE: 'Categories',
  CATEGORIES_DESCRIPTION: 'Manage product categories.',
  NEW_CATEGORY: 'Add category',
  EDIT_CATEGORY: 'Edit category',
  CATEGORY_PLACEHOLDER: 'e.g. Beverages',
  SEARCH_CATEGORIES: 'Search categories…',
  EMPTY_CATEGORIES: 'No categories yet.',
  DELETE_CATEGORY_TITLE: 'Delete category?',
  DELETE_CATEGORY_DESC: 'Products in this category will become uncategorized.',
  SUPPLIERS_TITLE: 'Suppliers',
  SUPPLIERS_DESCRIPTION: 'Manage your suppliers.',
  NEW_SUPPLIER: 'Add supplier',
  EDIT_SUPPLIER: 'Edit supplier',
  SEARCH_SUPPLIERS: 'Search suppliers…',
  EMPTY_SUPPLIERS: 'No suppliers yet.',
  DELETE_SUPPLIER_TITLE: 'Delete supplier?',
  DELETE_SUPPLIER_DESC: 'Products linked to this supplier will become unlinked.',
  BULK_TITLE: 'Import products',
  BULK_DESCRIPTION: 'Upload a CSV file to import multiple products at once.',
  BULK_DROP: 'Drop your CSV here, or click to browse',
  BULK_FORMAT: 'Columns: name, barcode, price, cost_price, stock, low_stock_at, category, expiry_date',
  BULK_IMPORTING: 'Importing...',
  BARCODE_PLACEHOLDER: 'Scan or enter barcode',
  BARCODE_SCAN: 'Scan',
  BARCODE_STOP: 'Stop scanning',
} as const

export const SETTINGS = {
  TITLE: 'Settings',
  DESCRIPTION: 'Manage your shop profile, organization details, and team members.',
} as const

export const FAQ_LIST = [
  {
    question: 'Can I use MarketPro without internet?',
    answer: 'Yes. The POS and inventory work fully offline. Sales sync automatically when your internet is restored.',
  },
  {
    question: 'Do I need a card machine?',
    answer: 'No. MarketPro supports cash, bank transfer (USSD/mobile banking), and card. You bring your own terminal if needed.',
  },
  {
    question: 'How many staff can I add?',
    answer: 'Starter supports 2 staff accounts. Growth and Pro plans support unlimited staff with role-based access control.',
  },
  {
    question: 'Is my sales data safe?',
    answer: 'Yes. All data is encrypted and automatically backed up to secure cloud servers. You own your data.',
  },
  {
    question: 'Can I try it before paying?',
    answer: 'Yes. The Starter plan is completely free with no time limit. Upgrade only when you need more.',
  },
] as const
