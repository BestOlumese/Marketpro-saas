import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { eq, and, isNull } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { staff, shops } from '@/lib/db/schema'
import type { ApiResponse } from '@/types'

type ShopData = { id: string; name: string; plan: string; betterAuthOrgId: string | null; aiQueriesUsed: number }

export async function GET(): Promise<NextResponse<ApiResponse<ShopData | null>>> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const staffMember = await db.query.staff.findFirst({
    where: and(eq(staff.userId, session.user.id), isNull(staff.deletedAt)),
    with: { shop: true },
  })

  if (!staffMember?.shop) {
    return NextResponse.json({ success: true, data: null })
  }

  return NextResponse.json({
    success: true,
    data: {
      id:              staffMember.shop.id,
      name:            staffMember.shop.name,
      plan:            staffMember.shop.plan,
      betterAuthOrgId: staffMember.shop.betterAuthOrgId,
      aiQueriesUsed:   staffMember.shop.aiQueriesUsed ?? 0,
    },
  })
}
