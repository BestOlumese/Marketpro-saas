'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Trash2, X, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'
import { useCurrentShop } from '@/lib/hooks/useCurrentShop'
import { usePlan } from '@/lib/hooks/usePlan'
import { UpgradePrompt } from '@/components/shared/UpgradePrompt'
import { PLANS } from '@/lib/constants/plans'
import { TEAM } from '@/lib/constants/copy'
import type { Staff, UserRole, ApiResponse } from '@/types'
import type { PendingInvitation } from '@/app/api/invitations/route'

const ROLE_LABELS: Record<UserRole, string> = {
  owner:             TEAM.ROLE_OWNER,
  manager:           TEAM.ROLE_MANAGER,
  accountant:        TEAM.ROLE_ACCOUNTANT,
  inventory_manager: TEAM.ROLE_INVENTORY_MANAGER,
  cashier:           TEAM.ROLE_CASHIER,
}

type InvitableRole = Exclude<UserRole, 'owner'>

type BAInviteRole = Parameters<typeof authClient.organization.inviteMember>[0]['role']

// Map our app roles to Better Auth org roles
function toBARole(role: InvitableRole): BAInviteRole {
  if (role === 'manager')           return 'admin'          as BAInviteRole
  if (role === 'accountant')        return 'accountant'     as BAInviteRole
  if (role === 'inventory_manager') return 'inventory_manager' as BAInviteRole
  return 'member' as BAInviteRole
}

// Map a BA invitation role string back to a display label
function baRoleToLabel(baRole: string | null): string {
  if (baRole === 'admin')             return TEAM.ROLE_MANAGER
  if (baRole === 'accountant')        return TEAM.ROLE_ACCOUNTANT
  if (baRole === 'inventory_manager') return TEAM.ROLE_INVENTORY_MANAGER
  return TEAM.ROLE_CASHIER
}

export function TeamSettings({ currentUserId }: { currentUserId: string }) {
  const qc = useQueryClient()
  const { shop } = useCurrentShop()
  const { plan } = usePlan()

  const [addOpen, setAddOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InvitableRole>('cashier')
  const [inviting, setInviting] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null)

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const res = await fetch('/api/team')
      const json = (await res.json()) as ApiResponse<Staff[]>
      return json.success ? json.data : []
    },
  })

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !shop?.betterAuthOrgId) return
    setInviting(true)
    try {
      const { error } = await authClient.organization.inviteMember({
        email,
        role: toBARole(role),
        organizationId: shop.betterAuthOrgId,
      })
      if (error) throw new Error(error.message ?? 'Failed to send invitation')
      toast.success(`Invitation sent to ${email}`)
      void qc.invalidateQueries({ queryKey: ['invitations'] })
      setEmail(''); setRole('cashier' as InvitableRole); setAddOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setInviting(false)
    }
  }

  const removeMutation = useMutation({
    mutationFn: async (staffId: string) => {
      const res = await fetch(`/api/team/${staffId}`, { method: 'DELETE' })
      const json = (await res.json()) as ApiResponse<null>
      if (!json.success) throw new Error(json.error)
    },
    onSuccess: () => {
      toast.success('Staff member removed')
      setConfirmDeleteId(null)
      void qc.invalidateQueries({ queryKey: ['team'] })
    },
    onError: (err: Error) => {
      toast.error(err.message)
      setConfirmDeleteId(null)
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, newRole }: { id: string; newRole: InvitableRole }) => {
      const res = await fetch(`/api/team/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      const json = (await res.json()) as ApiResponse<Staff>
      if (!json.success) throw new Error(json.error)
    },
    onSuccess: () => {
      toast.success('Role updated')
      void qc.invalidateQueries({ queryKey: ['team'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const { data: pendingInvites = [], isLoading: invitesLoading } = useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const res = await fetch('/api/invitations')
      const json = (await res.json()) as ApiResponse<PendingInvitation[]>
      return json.success ? json.data : []
    },
  })

  const revokeMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await fetch(`/api/invitations/${invitationId}`, { method: 'DELETE' })
      const json = (await res.json()) as ApiResponse<null>
      if (!json.success) throw new Error(json.error)
    },
    onSuccess: () => {
      toast.success('Invitation revoked')
      setConfirmRevokeId(null)
      void qc.invalidateQueries({ queryKey: ['invitations'] })
    },
    onError: (err: Error) => {
      toast.error(err.message)
      setConfirmRevokeId(null)
    },
  })

  const maxStaff = PLANS[plan].maxStaff
  const atStaffLimit = maxStaff !== Infinity && members.length >= maxStaff

  return (
    <div className="space-y-6">
      {atStaffLimit ? (
        <UpgradePrompt
          requiredPlan="growth"
          description={`You've reached the ${maxStaff}-staff limit on the Starter plan. Upgrade to Growth for unlimited staff accounts.`}
        />
      ) : (
        <div className="flex justify-end">
          <Button
            size="sm"
            className="bg-brand hover:bg-brand-dark text-white"
            onClick={() => setAddOpen((v) => !v)}
          >
            {TEAM.ADD_MEMBER}
          </Button>
        </div>
      )}

      {addOpen && (
        <form
          onSubmit={handleInvite}
          className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 space-y-3"
        >
          <div>
            <h3 className="text-sm font-medium text-zinc-700">{TEAM.INVITE_TITLE}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              An invitation email will be sent. They sign up with that email to join your shop.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="staff-email">{TEAM.INVITE_EMAIL}</Label>
              <Input
                id="staff-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ada@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>{TEAM.INVITE_ROLE}</Label>
              <Select value={role} onValueChange={(v) => setRole(v as InvitableRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">{TEAM.ROLE_MANAGER}</SelectItem>
                  <SelectItem value="accountant">{TEAM.ROLE_ACCOUNTANT}</SelectItem>
                  <SelectItem value="inventory_manager">{TEAM.ROLE_INVENTORY_MANAGER}</SelectItem>
                  <SelectItem value="cashier">{TEAM.ROLE_CASHIER}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-brand hover:bg-brand-dark text-white"
              disabled={!email || inviting || !shop?.betterAuthOrgId}
            >
              {inviting ? TEAM.INVITE_SUBMITTING : 'Send invitation'}
            </Button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
        {isLoading && (
          <div className="divide-y divide-zinc-100">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-6 w-20 ml-auto" />
                <Skeleton className="h-7 w-7 rounded-md" />
              </div>
            ))}
          </div>
        )}
        {!isLoading && members.length === 0 && (
          <div className="py-10 text-center text-sm text-zinc-400">{TEAM.EMPTY}</div>
        )}
        {!isLoading && members.length > 0 && (
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium text-zinc-500">Name</th>
                <th className="px-4 py-2.5 text-left font-medium text-zinc-500">Email</th>
                <th className="px-4 py-2.5 text-left font-medium text-zinc-500">Role</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-zinc-900">{m.name}</td>
                  <td className="px-4 py-3 text-zinc-500">{m.email}</td>
                  <td className="px-4 py-3">
                    {m.role === 'owner' ? (
                      <Badge variant="outline" className="text-brand border-brand">
                        {ROLE_LABELS.owner}
                      </Badge>
                    ) : (
                      <Select
                        value={m.role}
                        onValueChange={(v) =>
                          updateRoleMutation.mutate({ id: m.id, newRole: v as InvitableRole })
                        }
                        disabled={updateRoleMutation.isPending}
                      >
                        <SelectTrigger className="h-7 w-40 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">{TEAM.ROLE_MANAGER}</SelectItem>
                          <SelectItem value="accountant">{TEAM.ROLE_ACCOUNTANT}</SelectItem>
                          <SelectItem value="inventory_manager">{TEAM.ROLE_INVENTORY_MANAGER}</SelectItem>
                          <SelectItem value="cashier">{TEAM.ROLE_CASHIER}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {m.role !== 'owner' && m.userId !== currentUserId && (
                      confirmDeleteId === m.id ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-xs text-zinc-500">Remove?</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-zinc-500 hover:text-zinc-900"
                            disabled={removeMutation.isPending}
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 px-2 text-xs bg-red-600 hover:bg-red-700 text-white"
                            disabled={removeMutation.isPending}
                            onClick={() => removeMutation.mutate(m.id)}
                          >
                            {removeMutation.isPending ? 'Removing…' : 'Remove'}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-zinc-400 hover:text-red-500"
                          onClick={() => setConfirmDeleteId(m.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pending invitations */}
      {(invitesLoading || pendingInvites.length > 0) && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-zinc-400" />
            <h3 className="text-sm font-medium text-zinc-700">Pending invitations</h3>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
            {invitesLoading ? (
              <div className="divide-y divide-zinc-100">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-3">
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="h-5 w-20 ml-auto" />
                    <Skeleton className="h-7 w-7 rounded-md" />
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-100 bg-zinc-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium text-zinc-500">Email</th>
                    <th className="px-4 py-2.5 text-left font-medium text-zinc-500">Role</th>
                    <th className="px-4 py-2.5 text-left font-medium text-zinc-500">Sent</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {pendingInvites.map((inv) => (
                    <tr key={inv.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 text-zinc-700">{inv.email}</td>
                      <td className="px-4 py-3 text-zinc-500">
                        {baRoleToLabel(inv.role)}
                      </td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">
                        {inv.createdAt
                          ? new Date(inv.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {confirmRevokeId === inv.id ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="text-xs text-zinc-500">Revoke?</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-zinc-500 hover:text-zinc-900"
                              disabled={revokeMutation.isPending}
                              onClick={() => setConfirmRevokeId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-2 text-xs bg-red-600 hover:bg-red-700 text-white"
                              disabled={revokeMutation.isPending}
                              onClick={() => revokeMutation.mutate(inv.id)}
                            >
                              {revokeMutation.isPending ? 'Revoking…' : 'Revoke'}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-zinc-400 hover:text-red-500"
                            onClick={() => setConfirmRevokeId(inv.id)}
                            title="Revoke invitation"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
