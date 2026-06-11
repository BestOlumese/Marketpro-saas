'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createShopAction } from '@/app/onboarding/actions'
import { AUTH } from '@/lib/constants/copy'

export function CreateShopForm() {
  const [state, action, pending] = useActionState(createShopAction, null)

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">{AUTH.SHOP_NAME_LABEL}</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder={AUTH.SHOP_NAME_PLACEHOLDER}
          required
          autoFocus
          autoComplete="organization"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}

      <Button
        type="submit"
        className="w-full bg-brand hover:bg-brand-dark text-white"
        disabled={pending}
      >
        {pending ? AUTH.CREATING_SHOP : AUTH.CREATE_SHOP}
      </Button>
    </form>
  )
}
