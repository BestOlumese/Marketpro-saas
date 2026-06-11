'use client'

import { createAuthClient } from 'better-auth/react'
import { organizationClient } from 'better-auth/client/plugins'
import { ac } from '@/lib/auth-ac'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [organizationClient({ ac })],
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  organization: orgClient,
} = authClient
