import { NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { getShopId, requireRole } from '@/lib/clerk/helpers'
import { getShopWithOrg } from '@/lib/auth/helpers'
import { db } from '@/lib/db'
import { staff } from '@/lib/db/schema'
import { member } from '@/lib/db/schema/auth'
import { logger } from '@/lib/logger'
import type { ApiResponse, Staff } from '@/types'

const updateRoleSchema = z.object({
  role: z.enum(['manager', 'accountant', 'inventory_manager', 'cashier']),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Staff>>> {
  try {
    await requireRole(['owner', 'manager'])
    const shopId = await getShopId()
    const { id } = await params

    const body: unknown = await req.json()
    const parsed = updateRoleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 })
    }

    const [updated] = await db
      .update(staff)
      .set({ role: parsed.data.role, updatedAt: new Date() })
      .where(and(eq(staff.id, id), eq(staff.shopId, shopId)))
      .returning()

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Staff member not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORISED' || err.message === 'UNAUTHORIZED')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    logger.error('PATCH /api/team/[id] failed', err)
    return NextResponse.json({ success: false, error: 'Failed to update role' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    await requireRole(['owner'])
    const shopId = await getShopId()
    const shop   = await getShopWithOrg()
    const { id } = await params

    // Fetch the staff record so we have their userId for BA member removal
    const staffMember = await db.query.staff.findFirst({
      where: and(eq(staff.id, id), eq(staff.shopId, shopId)),
      columns: { id: true, userId: true },
    })

    if (!staffMember) {
      return NextResponse.json({ success: false, error: 'Staff member not found' }, { status: 404 })
    }

    // Soft-delete from our staff table
    await db
      .update(staff)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(staff.id, id))

    // Hard-delete from Better Auth member table so they can be re-invited
    if (shop.betterAuthOrgId) {
      await db
        .delete(member)
        .where(
          and(
            eq(member.userId, staffMember.userId),
            eq(member.organizationId, shop.betterAuthOrgId)
          )
        )
    }

    logger.info('Staff removed', { staffId: id, shopId })
    return NextResponse.json({ success: true, data: null })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORISED' || err.message === 'UNAUTHORIZED')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    logger.error('DELETE /api/team/[id] failed', err)
    return NextResponse.json({ success: false, error: 'Failed to remove staff' }, { status: 500 })
  }
}
