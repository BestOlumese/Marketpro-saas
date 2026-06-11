import { NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { getShopWithOrg } from '@/lib/auth/helpers'
import { db } from '@/lib/db'
import { invitation as invitationTable } from '@/lib/db/schema'
import { logger } from '@/lib/logger'
import type { ApiResponse } from '@/types'

export interface PendingInvitation {
  id: string
  email: string
  role: string | null
  createdAt: Date | null
}

export async function GET(): Promise<NextResponse<ApiResponse<PendingInvitation[]>>> {
  try {
    const shop = await getShopWithOrg()
    if (!shop.betterAuthOrgId) {
      return NextResponse.json({ success: true, data: [] })
    }

    const rows = await db
      .select({
        id:        invitationTable.id,
        email:     invitationTable.email,
        role:      invitationTable.role,
        createdAt: invitationTable.createdAt,
      })
      .from(invitationTable)
      .where(
        and(
          eq(invitationTable.organizationId, shop.betterAuthOrgId),
          eq(invitationTable.status, 'pending')
        )
      )
      .orderBy(invitationTable.createdAt)

    return NextResponse.json({ success: true, data: rows })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'SHOP_NOT_FOUND')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    logger.error('GET /api/invitations failed', err)
    return NextResponse.json({ success: false, error: 'Failed to load invitations' }, { status: 500 })
  }
}
