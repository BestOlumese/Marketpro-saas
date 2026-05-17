import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { db } from '@/lib/db'
import { shops, staff } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { logger } from '@/lib/logger'
import type { ApiResponse } from '@/types'

type OrgMembershipEvent = {
  type: 'organizationMembership.created' | 'organizationMembership.deleted' | 'organizationMembership.updated'
  data: {
    organization: { id: string; name: string }
    public_user_data: { user_id: string; first_name: string; last_name: string; identifier: string }
    role: string
  }
}

type OrgCreatedEvent = {
  type: 'organization.created'
  data: {
    id: string
    name: string
    created_by: string
  }
}

type ClerkWebhookEvent = OrgMembershipEvent | OrgCreatedEvent

export async function POST(req: Request): Promise<NextResponse<ApiResponse<null>>> {
  const body = await req.text()
  const headersList = await headers()

  const svixId = headersList.get('svix-id')
  const svixTimestamp = headersList.get('svix-timestamp')
  const svixSignature = headersList.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ success: false, error: 'Missing svix headers' }, { status: 400 })
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
  let event: ClerkWebhookEvent

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid webhook signature' }, { status: 400 })
  }

  try {
    if (event.type === 'organization.created') {
      await db.insert(shops).values({
        clerkOrgId: event.data.id,
        ownerId: event.data.created_by,
        name: event.data.name,
        plan: 'starter',
        planStatus: 'active',
      })
      logger.info('Shop created', { orgId: event.data.id })
    }

    if (event.type === 'organizationMembership.created') {
      const shop = await db.query.shops.findFirst({
        where: eq(shops.clerkOrgId, event.data.organization.id),
      })
      if (shop) {
        const fullName = [event.data.public_user_data.first_name, event.data.public_user_data.last_name]
          .filter(Boolean)
          .join(' ')
        await db.insert(staff).values({
          shopId: shop.id,
          clerkUserId: event.data.public_user_data.user_id,
          name: fullName || event.data.public_user_data.identifier,
          email: event.data.public_user_data.identifier,
          role: event.data.role as 'org:admin' | 'org:manager' | 'org:cashier',
        })
        logger.info('Staff created', { userId: event.data.public_user_data.user_id })
      }
    }

    if (event.type === 'organizationMembership.updated') {
      await db
        .update(staff)
        .set({ role: event.data.role as 'org:admin' | 'org:manager' | 'org:cashier', updatedAt: new Date() })
        .where(eq(staff.clerkUserId, event.data.public_user_data.user_id))
      logger.info('Staff role updated', { userId: event.data.public_user_data.user_id })
    }

    if (event.type === 'organizationMembership.deleted') {
      await db
        .update(staff)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(staff.clerkUserId, event.data.public_user_data.user_id))
      logger.info('Staff soft-deleted', { userId: event.data.public_user_data.user_id })
    }

    return NextResponse.json({ success: true, data: null })
  } catch (error) {
    logger.error('Clerk webhook handler failed', error)
    return NextResponse.json({ success: false, error: 'Webhook processing failed' }, { status: 500 })
  }
}
