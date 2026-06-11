import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { PageHeader } from '@/components/shared/PageHeader'
import { TeamSettings } from '@/components/settings/TeamSettings'
import { TEAM } from '@/lib/constants/copy'
import { ROUTES } from '@/lib/constants/routes'

export default async function TeamPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect(ROUTES.SIGN_IN)

  return (
    <div className="p-6">
      <PageHeader title={TEAM.TITLE} description={TEAM.DESCRIPTION} />
      <div className="mt-6">
        <TeamSettings currentUserId={session.user.id} />
      </div>
    </div>
  )
}
