import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { PageHeader } from '@/components/shared/PageHeader'
import { ProfileForm } from '@/components/settings/ProfileForm'
import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm'
import { ROUTES } from '@/lib/constants/routes'

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect(ROUTES.SIGN_IN)

  return (
    <div className="p-6 space-y-6 max-w-lg">
      <PageHeader title="Account settings" description="Update your name and password." />

      {/* Personal info card */}
      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="px-6 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-semibold text-zinc-900">Personal info</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Your display name shown across the app.</p>
        </div>
        <div className="px-6 py-5">
          <ProfileForm
            initialName={session.user.name}
            email={session.user.email}
          />
        </div>
      </div>

      {/* Change password card */}
      <div id="security" className="rounded-xl border border-zinc-200 bg-white">
        <div className="px-6 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-semibold text-zinc-900">Change password</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Choose a strong password of at least 8 characters.</p>
        </div>
        <div className="px-6 py-5">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  )
}
