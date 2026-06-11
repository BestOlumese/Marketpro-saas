import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { eq, and, isNull } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { staff } from '@/lib/db/schema'
import type { ApiResponse, UserRole } from '@/types'

export async function GET(): Promise<NextResponse<ApiResponse<UserRole | null>>> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const member = await db.query.staff.findFirst({
    where: and(eq(staff.userId, session.user.id), isNull(staff.deletedAt)),
    columns: { role: true },
  })

  return NextResponse.json({ success: true, data: (member?.role as UserRole) ?? null })
}
