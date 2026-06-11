const isDev = process.env.NODE_ENV === 'development'

export const logger = {
  info: (message: string, data?: unknown) => {
    if (isDev) console.info(`[INFO] ${message}`, data ?? '')
  },
  warn: (message: string, data?: unknown) => {
    if (isDev) console.warn(`[WARN] ${message}`, data ?? '')
  },
  error: (message: string, error?: unknown) => {
    // Always log errors — not just in dev
    console.error(`[ERROR] ${message}`, error ?? '')
  },
  debug: (message: string, data?: unknown) => {
    if (isDev) console.debug(`[DEBUG] ${message}`, data ?? '')
  },
}
