import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { staff, member } from '@/lib/db/schema'
import { CreateShopForm } from '@/components/onboarding/CreateShopForm'
import { APP_NAME, AUTH } from '@/lib/constants/copy'

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  // Already set up as shop owner
  const existingStaff = await db.query.staff.findFirst({
    where: eq(staff.userId, session.user.id),
  })
  if (existingStaff) redirect('/dashboard')

  // Invited staff: BA org membership exists but no staff record yet
  // → go to dashboard where the fallback auto-creates the staff record
  const orgMembership = await db.query.member.findFirst({
    where: eq(member.userId, session.user.id),
  })
  if (orgMembership) redirect('/dashboard')

  return (
    <div className="w-full max-w-sm space-y-6 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
      <div className="text-center">
        <h1 className="text-xl font-bold text-brand">{APP_NAME}</h1>
        <p className="mt-1 text-sm font-medium text-zinc-700">{AUTH.ONBOARDING_TITLE}</p>
        <p className="text-sm text-zinc-500">{AUTH.ONBOARDING_DESCRIPTION}</p>
      </div>
      <CreateShopForm />
    </div>
  )
}
