import { Suspense } from 'react'
import { SignInForm } from '@/components/auth/SignInForm'
import { APP_NAME, AUTH } from '@/lib/constants/copy'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-xl font-bold text-brand">{APP_NAME}</h1>
          <p className="mt-1 text-sm font-medium text-zinc-700">{AUTH.SIGN_IN_TITLE}</p>
          <p className="text-sm text-zinc-500">{AUTH.SIGN_IN_DESCRIPTION}</p>
        </div>
        <Suspense>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  )
}
