'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { shops, staff } from '@/lib/db/schema'
import { logger } from '@/lib/logger'

export async function createShopAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const reqHeaders = await headers()
  const session = await auth.api.getSession({ headers: reqHeaders })
  if (!session?.user) redirect('/sign-in')

  const name = (formData.get('name') as string | null)?.trim()
  if (!name) return { error: 'Shop name is required' }

  // Idempotent — if user already has a shop, send them to dashboard
  const existing = await db.query.staff.findFirst({
    where: eq(staff.userId, session.user.id),
  })
  if (existing) redirect('/dashboard')

  try {
    // Create Better Auth organization
    const org = await auth.api.createOrganization({
      headers: reqHeaders,
      body: {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      },
    })

    // Explicitly set the new org as active so the session is linked immediately
    await auth.api.setActiveOrganization({
      headers: reqHeaders,
      body: { organizationId: org.id },
    })

    // Create our shops record linked to the BA org
    const [shop] = await db
      .insert(shops)
      .values({
        betterAuthOrgId: org.id,
        ownerId: session.user.id,
        name,
        plan: 'starter',
        planStatus: 'active',
      })
      .returning()

    if (!shop) return { error: 'Failed to create shop' }

    // Create staff record for the owner
    await db.insert(staff).values({
      shopId: shop.id,
      userId: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: 'owner',
    })

    logger.info('Shop created via onboarding', { shopId: shop.id, userId: session.user.id })
  } catch (err) {
    logger.error('Onboarding failed', err)
    return { error: 'Something went wrong. Please try again.' }
  }

  redirect('/dashboard')
}
