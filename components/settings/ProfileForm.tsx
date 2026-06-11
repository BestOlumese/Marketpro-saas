'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'

interface Props {
  initialName: string
  email: string
}

export function ProfileForm({ initialName, email }: Props) {
  const [name, setName] = useState(initialName)
  const [loading, setLoading] = useState(false)

  const hasChanges = name.trim() !== initialName && name.trim().length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!hasChanges) return
    setLoading(true)
    try {
      const { error } = await authClient.updateUser({ name: name.trim() })
      if (error) throw new Error(error.message ?? 'Failed to update name')
      toast.success('Name updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ada Okafor"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Email address</Label>
        <Input
          value={email}
          disabled
          className="bg-zinc-50 text-zinc-400 cursor-not-allowed select-none"
        />
        <p className="text-xs text-zinc-400">Email address cannot be changed.</p>
      </div>

      <Button
        type="submit"
        size="sm"
        className="bg-brand hover:bg-brand-dark text-white"
        disabled={loading || !hasChanges}
      >
        {loading ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  )
}
