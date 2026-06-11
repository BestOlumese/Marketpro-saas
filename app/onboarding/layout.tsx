import type { Metadata } from 'next'
import { APP_NAME } from '@/lib/constants/copy'

export const metadata: Metadata = {
  title: `Set up your shop — ${APP_NAME}`,
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      {children}
    </div>
  )
}
