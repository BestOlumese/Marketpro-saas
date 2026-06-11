import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { QueryProvider } from '@/components/shared/QueryProvider'
import { APP_NAME, APP_TAGLINE } from '@/lib/constants/copy'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: `${APP_NAME} — Smart POS for Market Shops`,
  description: APP_TAGLINE,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full scroll-smooth antialiased`}>
      <body className="min-h-full bg-zinc-50 text-zinc-900">
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
