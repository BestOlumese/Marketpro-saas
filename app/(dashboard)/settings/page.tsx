'use client'

import { OrganizationProfile } from '@clerk/nextjs'
import { PageHeader } from '@/components/shared/PageHeader'
import { SETTINGS } from '@/lib/constants/copy'

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-8">
      <PageHeader title={SETTINGS.TITLE} description={SETTINGS.DESCRIPTION} />
      <OrganizationProfile routing="hash" />
    </div>
  )
}
