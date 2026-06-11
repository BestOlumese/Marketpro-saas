import { Badge } from '@/components/ui/badge'
import { TEAM } from '@/lib/constants/copy'
import type { UserRole } from '@/types'

interface RoleBadgeProps {
  role: UserRole
}

const ROLE_STYLES: Record<UserRole, string> = {
  owner:             'bg-brand/10 text-brand border-brand/20',
  manager:           'bg-blue-50 text-blue-700 border-blue-200',
  accountant:        'bg-purple-50 text-purple-700 border-purple-200',
  inventory_manager: 'bg-amber-50 text-amber-700 border-amber-200',
  cashier:           'bg-zinc-100 text-zinc-600 border-zinc-200',
}

const ROLE_LABELS: Record<UserRole, string> = {
  owner:             TEAM.ROLE_OWNER,
  manager:           TEAM.ROLE_MANAGER,
  accountant:        TEAM.ROLE_ACCOUNTANT,
  inventory_manager: TEAM.ROLE_INVENTORY_MANAGER,
  cashier:           TEAM.ROLE_CASHIER,
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <Badge variant="outline" className={ROLE_STYLES[role]}>
      {ROLE_LABELS[role]}
    </Badge>
  )
}
