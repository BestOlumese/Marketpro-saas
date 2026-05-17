'use client'

import { OrganizationProfile } from '@clerk/nextjs'
import { PageHeader } from '@/components/shared/PageHeader'
import { BankAccountsSettings } from '@/components/settings/BankAccountsSettings'
import { SETTINGS } from '@/lib/constants/copy'

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-10">
      <PageHeader title={SETTINGS.TITLE} description={SETTINGS.DESCRIPTION} />

      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <BankAccountsSettings />
      </div>

      <div>
        <h3 className="font-semibold text-zinc-900 mb-4">Organization & Team</h3>
        <OrganizationProfile routing="hash" />
      </div>
    </div>
  )
}
