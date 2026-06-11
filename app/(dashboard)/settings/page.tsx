import Link from 'next/link'
import { Users, CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { BankAccountsSettings } from '@/components/settings/BankAccountsSettings'
import { SETTINGS, BILLING } from '@/lib/constants/copy'

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-10">
      <PageHeader title={SETTINGS.TITLE} description={SETTINGS.DESCRIPTION} />

      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <BankAccountsSettings />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-zinc-900">Team</h3>
            <p className="mt-0.5 text-sm text-zinc-500">Manage staff accounts and roles.</p>
          </div>
          <Link
            href="/settings/team"
            className="flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 transition-colors"
          >
            <Users className="h-4 w-4" />
            Manage team
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-brand/20 bg-brand-light p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-brand">{BILLING.TITLE}</h3>
            <p className="mt-0.5 text-sm text-zinc-500">{BILLING.DESCRIPTION}</p>
          </div>
          <Link
            href="/settings/billing"
            className="flex items-center gap-2 rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
          >
            <CreditCard className="h-4 w-4" />
            Manage billing
          </Link>
        </div>
      </div>
    </div>
  )
}
