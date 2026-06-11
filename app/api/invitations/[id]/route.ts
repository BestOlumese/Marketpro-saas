import { NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { getShopWithOrg, requireRole } from '@/lib/auth/helpers'
import { db } from '@/lib/db'
import { invitation as invitationTable } from '@/lib/db/schema'
import { logger } from '@/lib/logger'
import type { ApiResponse } from '@/types'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    await requireRole(['owner', 'manager'])
    const shop = await getShopWithOrg()
    const { id } = await params

    if (!shop.betterAuthOrgId) {
      return NextResponse.json({ success: false, error: 'No organisation found' }, { status: 400 })
    }

    const [revoked] = await db
      .update(invitationTable)
      .set({ status: 'canceled' })
      .where(
        and(
          eq(invitationTable.id, id),
          eq(invitationTable.organizationId, shop.betterAuthOrgId),
          eq(invitationTable.status, 'pending')
        )
      )
      .returning({ id: invitationTable.id })

    if (!revoked) {
      return NextResponse.json({ success: false, error: 'Invitation not found' }, { status: 404 })
    }

    logger.info('Invitation revoked', { invitationId: id })
    return NextResponse.json({ success: true, data: null })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORISED' || err.message === 'UNAUTHORIZED')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    logger.error('DELETE /api/invitations/[id] failed', err)
    return NextResponse.json({ success: false, error: 'Failed to revoke invitation' }, { status: 500 })
  }
}
