import { NextResponse } from 'next/server'
import { eq, and, isNull } from 'drizzle-orm'
import { getShopId } from '@/lib/clerk/helpers'
import { db } from '@/lib/db'
import { staff } from '@/lib/db/schema'
import { logger } from '@/lib/logger'
import type { ApiResponse, Staff } from '@/types'

export async function GET(): Promise<NextResponse<ApiResponse<Staff[]>>> {
  try {
    const shopId = await getShopId()
    const members = await db.query.staff.findMany({
      where: and(eq(staff.shopId, shopId), isNull(staff.deletedAt)),
    })
    return NextResponse.json({ success: true, data: members })
  } catch (err) {
    if (err instanceof Error && (err.message === 'UNAUTHORIZED' || err.message === 'SHOP_NOT_FOUND')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    logger.error('GET /api/team failed', err)
    return NextResponse.json({ success: false, error: 'Failed to load team' }, { status: 500 })
  }
}
