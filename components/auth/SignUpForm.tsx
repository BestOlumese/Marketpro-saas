'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { AUTH } from '@/lib/constants/copy'
import { ROUTES } from '@/lib/constants/routes'

export function SignUpForm() {
  const searchParams = useSearchParams()
  // If coming from an invitation link, bounce back there after verification
  const callbackUrl = searchParams.get('callbackUrl') ?? ROUTES.ONBOARDING

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: callbackUrl,
    })
    if (error) {
      toast.error(error.message ?? AUTH.SIGN_UP_ERROR)
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await authClient.signIn.social({ provider: 'google', callbackURL: ROUTES.DASHBOARD })
    setGoogleLoading(false)
  }

  if (done) {
    return (
      <div className="space-y-3 text-center">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-brand-light mx-auto">
          <svg className="h-6 w-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="font-semibold text-zinc-900">{AUTH.CHECK_EMAIL_TITLE}</h3>
        <p className="text-sm text-zinc-500">{AUTH.CHECK_EMAIL_DESCRIPTION}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">{AUTH.NAME_LABEL}</Label>
        <Input
          id="name"
          type="text"
          placeholder={AUTH.NAME_PLACEHOLDER}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">{AUTH.EMAIL_LABEL}</Label>
        <Input
          id="email"
          type="email"
          placeholder={AUTH.EMAIL_PLACEHOLDER}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">{AUTH.PASSWORD_LABEL}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={8}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Button
        type="submit"
        className="w-full bg-brand hover:bg-brand-dark text-white"
        disabled={loading}
      >
        {loading ? AUTH.SIGNING_UP : AUTH.SIGN_UP}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-zinc-400">or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogle}
        disabled={googleLoading}
      >
        <GoogleIcon />
        {googleLoading ? AUTH.SIGNING_UP : AUTH.SIGN_UP_GOOGLE}
      </Button>

      <p className="text-center text-sm text-zinc-500">
        {AUTH.ALREADY_HAVE_ACCOUNT}{' '}
        <Link
          href={
            callbackUrl !== ROUTES.ONBOARDING
              ? `${ROUTES.SIGN_IN}?callbackUrl=${encodeURIComponent(callbackUrl)}`
              : ROUTES.SIGN_IN
          }
          className="font-medium text-brand hover:text-brand-dark"
        >
          {AUTH.SIGN_IN}
        </Link>
      </p>
    </form>
  )
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}
